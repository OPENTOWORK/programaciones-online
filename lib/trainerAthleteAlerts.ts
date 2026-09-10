import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AthleteAlertSummary } from '@/lib/types';

const READS_TABLE = 'trainer_athlete_alert_reads';
const EMPTY_ALERTS: AthleteAlertSummary = {
  chatCount: 0,
  sessionCount: 0,
  intakeChanged: false,
  total: 0,
  chatActivityCount: 0,
  sessionActivityCount: 0,
  intakeCompleted: false,
};

type AlertReadRow = {
  athlete_id: string;
  chat_read_at: string | null;
  sessions_read_at: string | null;
  intake_read_at: string | null;
};

export type AlertSource = 'chat' | 'sessions' | 'intake';

export const EMPTY_ATHLETE_ALERTS: AthleteAlertSummary = { ...EMPTY_ALERTS };

export function withAlertSourceCleared(
  alerts: AthleteAlertSummary,
  source: AlertSource,
): AthleteAlertSummary {
  const next = { ...alerts };
  if (source === 'chat') next.chatCount = 0;
  if (source === 'sessions') next.sessionCount = 0;
  if (source === 'intake') next.intakeChanged = false;
  next.total = next.chatCount + next.sessionCount + (next.intakeChanged ? 1 : 0);
  return next;
}

export function withAlertSourceReopened(
  alerts: AthleteAlertSummary,
  source: AlertSource,
): AthleteAlertSummary {
  const next = { ...alerts };
  if (source === 'chat') next.chatCount = Math.max(1, next.chatCount);
  if (source === 'sessions') next.sessionCount = Math.max(1, next.sessionCount);
  if (source === 'intake') next.intakeChanged = true;
  next.total = next.chatCount + next.sessionCount + (next.intakeChanged ? 1 : 0);
  return next;
}

export function pendingAlertSources(alerts?: AthleteAlertSummary | null): AlertSource[] {
  if (!alerts) return [];
  const sources: AlertSource[] = [];
  if (alerts.chatCount > 0) sources.push('chat');
  if (alerts.sessionCount > 0) sources.push('sessions');
  if (alerts.intakeChanged) sources.push('intake');
  return sources;
}

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

  const { data: reads } = await supabase
    .from(READS_TABLE)
    .select('athlete_id, chat_read_at, sessions_read_at, intake_read_at')
    .eq('trainer_id', trainerId)
    .in('athlete_id', athleteIds);

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
    const createdAt = timestamp(row.created_at);
    alert.chatActivityCount = (alert.chatActivityCount ?? 0) + 1;
    if (createdAt >= timestamp(alert.lastChatAt)) {
      alert.lastChatAt = typeof row.created_at === 'string' ? row.created_at : alert.lastChatAt;
    }
    const readAt = Math.max(
      timestamp(readsByAthlete.get(athleteId)?.chat_read_at),
      latestTrainerReply.get(athleteId) ?? 0,
    );
    if (createdAt > readAt) alert.chatCount += 1;
  }

  for (const row of sessionsResult.data ?? []) {
    const athleteId = String(row.user_id);
    const alert = alerts[athleteId];
    if (!alert) continue;
    const updatedAt = timestamp(row.updated_at);
    alert.sessionActivityCount = (alert.sessionActivityCount ?? 0) + 1;
    if (updatedAt >= timestamp(alert.lastSessionAt)) {
      alert.lastSessionAt = typeof row.updated_at === 'string' ? row.updated_at : alert.lastSessionAt;
    }
    const readAt = timestamp(readsByAthlete.get(athleteId)?.sessions_read_at);
    if (updatedAt > readAt) alert.sessionCount += 1;
  }

  for (const row of intakeResult.data ?? []) {
    const athleteId = String(row.user_id);
    const alert = alerts[athleteId];
    if (!alert) continue;
    const updatedAt = timestamp(row.updated_at);
    alert.intakeCompleted = true;
    if (updatedAt >= timestamp(alert.lastIntakeAt)) {
      alert.lastIntakeAt = typeof row.updated_at === 'string' ? row.updated_at : alert.lastIntakeAt;
    }
    const readAt = timestamp(readsByAthlete.get(athleteId)?.intake_read_at);
    if (updatedAt > readAt) alert.intakeChanged = true;
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
  await writeAlertReadAt(athleteId, source, new Date().toISOString());
}

export async function markAthleteAlertUnread(
  athleteId: string,
  source: AlertSource,
): Promise<void> {
  await writeAlertReadAt(athleteId, source, null);
}

async function writeAlertReadAt(
  athleteId: string,
  source: AlertSource,
  readAt: string | null,
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
      [readColumn]: readAt,
      updated_at: now,
    },
    { onConflict: 'trainer_id,athlete_id' },
  );
}

export async function markAthleteAlertSourcesRead(
  athleteId: string,
  sources: AlertSource[],
): Promise<void> {
  await Promise.all(sources.map((source) => markAthleteAlertRead(athleteId, source)));
}
