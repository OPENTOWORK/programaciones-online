import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AthleteAlertSummary } from '@/lib/types';

const READS_TABLE = 'trainer_athlete_alert_reads';
const EMPTY_ALERTS: AthleteAlertSummary = {
  chatCount: 0,
  sessionCount: 0,
  intakeChanged: false,
  total: 0,
};

type AlertReadRow = {
  athlete_id: string;
  chat_read_at: string | null;
  sessions_read_at: string | null;
  intake_read_at: string | null;
};

type AlertSource = 'chat' | 'sessions' | 'intake';

function timestamp(value: unknown) {
  if (typeof value !== 'string') return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function emptyAlertsByAthlete(athleteIds: string[]) {
  return Object.fromEntries(
    athleteIds.map((athleteId) => [athleteId, { ...EMPTY_ALERTS }]),
  ) as Record<string, AthleteAlertSummary>;
}

export async function fetchTrainerAthleteAlerts(
  athleteIds: string[],
): Promise<Record<string, AthleteAlertSummary>> {
  const alerts = emptyAlertsByAthlete(athleteIds);
  if (!isSupabaseConfigured || athleteIds.length === 0) return alerts;

  const supabase = getSupabase();
  if (!supabase) return alerts;

  const { data: sessionData } = await supabase.auth.getSession();
  const trainerId = sessionData.session?.user.id;
  if (!trainerId) return alerts;

  const { data: reads, error: readsError } = await supabase
    .from(READS_TABLE)
    .select('athlete_id, chat_read_at, sessions_read_at, intake_read_at')
    .eq('trainer_id', trainerId)
    .in('athlete_id', athleteIds);

  if (readsError) return alerts;

  const readsByAthlete = new Map(
    ((reads ?? []) as AlertReadRow[]).map((row) => [row.athlete_id, row]),
  );

  const [messagesResult, sessionsResult, intakeResult] = await Promise.all([
    supabase
      .from('trainer_messages')
      .select('user_id, sender, created_at')
      .in('user_id', athleteIds),
    supabase
      .from('workout_logs')
      .select('user_id, updated_at')
      .in('user_id', athleteIds),
    supabase
      .from('athlete_intake_forms')
      .select('user_id, updated_at, completed_at')
      .in('user_id', athleteIds)
      .not('completed_at', 'is', null),
  ]);

  const latestTrainerReply = new Map<string, number>();
  for (const row of messagesResult.data ?? []) {
    if (row.sender !== 'trainer') continue;
    const athleteId = String(row.user_id);
    latestTrainerReply.set(
      athleteId,
      Math.max(latestTrainerReply.get(athleteId) ?? 0, timestamp(row.created_at)),
    );
  }

  for (const row of messagesResult.data ?? []) {
    if (row.sender !== 'user') continue;
    const athleteId = String(row.user_id);
    const alert = alerts[athleteId];
    if (!alert) continue;
    const readAt = Math.max(
      timestamp(readsByAthlete.get(athleteId)?.chat_read_at),
      latestTrainerReply.get(athleteId) ?? 0,
    );
    if (timestamp(row.created_at) > readAt) alert.chatCount += 1;
  }

  for (const row of sessionsResult.data ?? []) {
    const athleteId = String(row.user_id);
    const alert = alerts[athleteId];
    if (!alert) continue;
    const readAt = timestamp(readsByAthlete.get(athleteId)?.sessions_read_at);
    if (timestamp(row.updated_at) > readAt) alert.sessionCount += 1;
  }

  for (const row of intakeResult.data ?? []) {
    const athleteId = String(row.user_id);
    const alert = alerts[athleteId];
    if (!alert) continue;
    const readAt = timestamp(readsByAthlete.get(athleteId)?.intake_read_at);
    if (timestamp(row.updated_at) > readAt) alert.intakeChanged = true;
  }

  for (const alert of Object.values(alerts)) {
    alert.total = alert.chatCount + alert.sessionCount + (alert.intakeChanged ? 1 : 0);
  }

  return alerts;
}

export async function markAthleteAlertRead(
  athleteId: string,
  source: AlertSource,
): Promise<void> {
  if (!isSupabaseConfigured || !athleteId) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const trainerId = sessionData.session?.user.id;
  if (!trainerId) return;

  const now = new Date().toISOString();
  const readColumn = {
    chat: 'chat_read_at',
    sessions: 'sessions_read_at',
    intake: 'intake_read_at',
  }[source];

  await supabase.from(READS_TABLE).upsert(
    {
      trainer_id: trainerId,
      athlete_id: athleteId,
      [readColumn]: now,
      updated_at: now,
    },
    { onConflict: 'trainer_id,athlete_id' },
  );
}

export async function markAthleteDetailAlertsRead(athleteId: string): Promise<void> {
  await Promise.all([
    markAthleteAlertRead(athleteId, 'sessions'),
    markAthleteAlertRead(athleteId, 'intake'),
  ]);
}
