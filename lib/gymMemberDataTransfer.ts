import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

import type { GymMemberInput } from '@/lib/gymService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  GYM_MEMBER_PIPELINE_LABELS,
  GYM_MEMBER_PIPELINE_STAGES,
  GYM_MEMBER_STATUS_LABELS,
  GYM_MEMBERSHIP_STATUS_LABELS,
  gymMemberFullName,
  isGymMemberPipelineStage,
  type GymMember,
  type GymMemberPipelineStage,
  type GymMemberStatus,
  type GymMembershipStatus,
} from '@/lib/gymTypes';
import { getWhatsAppUrl } from '@/lib/whatsappLink';

export type GymMemberDataFormat = 'csv' | 'excel';

export interface GymMemberImportRow extends GymMemberInput {
  memberId?: string;
  membership?: {
    planName?: string;
    startsAt?: string;
    endsAt?: string;
    status?: GymMembershipStatus;
  };
}

export interface GymMemberExportRow {
  id_interno: string;
  nombre: string;
  apellidos: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  whatsapp: string;
  fecha_nacimiento: string;
  estado: string;
  etapa_crm: string;
  fecha_alta: string;
  cuenta_app: string;
  notas: string;
  tarifa: string;
  tarifa_inicio: string;
  tarifa_fin: string;
  tarifa_estado: string;
  creado_en: string;
  actualizado_en: string;
}

export interface GymMemberImportResult {
  rows: GymMemberImportRow[];
  skipped: number;
}

const EXPORT_HEADERS = [
  'id_interno',
  'nombre',
  'apellidos',
  'nombre_completo',
  'email',
  'telefono',
  'whatsapp',
  'fecha_nacimiento',
  'estado',
  'etapa_crm',
  'fecha_alta',
  'cuenta_app',
  'notas',
  'tarifa',
  'tarifa_inicio',
  'tarifa_fin',
  'tarifa_estado',
  'creado_en',
  'actualizado_en',
] as const;

const HEADER_ALIASES: Record<string, string> = {
  id_interno: 'memberId',
  id: 'memberId',
  member_id: 'memberId',
  nombre: 'firstName',
  'first name': 'firstName',
  first_name: 'firstName',
  apellidos: 'lastName',
  'last name': 'lastName',
  last_name: 'lastName',
  nombre_completo: 'skip',
  email: 'email',
  correo: 'email',
  telefono: 'phone',
  teléfono: 'phone',
  phone: 'phone',
  whatsapp: 'skip',
  fecha_nacimiento: 'birthDate',
  birth_date: 'birthDate',
  nacimiento: 'birthDate',
  estado: 'status',
  status: 'status',
  etapa_crm: 'pipelineStage',
  pipeline_stage: 'pipelineStage',
  etapa: 'pipelineStage',
  fecha_alta: 'joinedAt',
  fecha: 'joinedAt',
  joined_at: 'joinedAt',
  alta: 'joinedAt',
  cuenta_app: 'skip',
  notas: 'notes',
  notes: 'notes',
  tarifa: 'planName',
  plan: 'planName',
  plan_name: 'planName',
  tarifa_precio: 'skip',
  tarifa_periodo: 'skip',
  tarifa_inicio: 'membershipStartsAt',
  tarifa_fin: 'membershipEndsAt',
  membership_starts_at: 'membershipStartsAt',
  membership_ends_at: 'membershipEndsAt',
  tarifa_estado: 'membershipStatus',
  membership_status: 'membershipStatus',
  reservas_totales: 'skip',
  reservas_confirmadas: 'skip',
  asistencias: 'skip',
  no_asistencias: 'skip',
  cancelaciones: 'skip',
  en_lista_espera: 'skip',
  ultima_reserva: 'skip',
  creado_en: 'skip',
  actualizado_en: 'skip',
};

interface MembershipSnapshot {
  planName?: string;
  startsAt?: string;
  endsAt?: string;
  status?: GymMembershipStatus;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeMatch(value?: string) {
  return (value ?? '').trim().toLowerCase();
}

function escapeCsvCell(value: string) {
  if (/[",\n\r;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseStatus(value: unknown): GymMemberStatus {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['lead', 'potencial', 'miembro potencial'].includes(normalized)) return 'lead';
  if (['active', 'activo', 'activa'].includes(normalized)) return 'active';
  if (['inactive', 'inactivo', 'inactiva'].includes(normalized)) return 'inactive';
  if (['blocked', 'bloqueado', 'bloqueada'].includes(normalized)) return 'blocked';
  return 'active';
}

function parsePipelineStage(value: unknown): GymMemberPipelineStage | undefined {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (isGymMemberPipelineStage(normalized)) return normalized;

  const byLabel = GYM_MEMBER_PIPELINE_STAGES.find(
    (stage) => stage.label.toLowerCase() === normalized || stage.key === normalized,
  );
  return byLabel?.key;
}

function parseMembershipStatus(value: unknown): GymMembershipStatus | undefined {
  const normalized = String(value ?? '').trim().toLowerCase();
  const entries = Object.entries(GYM_MEMBERSHIP_STATUS_LABELS) as Array<[GymMembershipStatus, string]>;
  const match = entries.find(
    ([key, label]) => key === normalized || label.toLowerCase() === normalized,
  );
  return match?.[0];
}

function emptyExportRow(member: GymMember): GymMemberExportRow {
  return {
    id_interno: member.id,
    nombre: member.firstName,
    apellidos: member.lastName,
    nombre_completo: gymMemberFullName(member),
    email: member.email ?? '',
    telefono: member.phone ?? '',
    whatsapp: getWhatsAppUrl(member.phone) ?? '',
    fecha_nacimiento: member.birthDate ?? '',
    estado: GYM_MEMBER_STATUS_LABELS[member.status],
    etapa_crm: GYM_MEMBER_PIPELINE_LABELS[member.pipelineStage],
    fecha_alta: member.joinedAt,
    cuenta_app: member.userId ? 'Sí' : 'No',
    notas: member.notes ?? '',
    tarifa: '',
    tarifa_inicio: '',
    tarifa_fin: '',
    tarifa_estado: '',
    creado_en: formatDateTime(member.createdAt),
    actualizado_en: formatDateTime(member.updatedAt),
  };
}

function memberToExportRow(member: GymMember, membership?: MembershipSnapshot): GymMemberExportRow {
  const row = emptyExportRow(member);

  if (membership) {
    row.tarifa = membership.planName ?? '';
    row.tarifa_inicio = membership.startsAt ?? '';
    row.tarifa_fin = membership.endsAt ?? '';
    row.tarifa_estado = membership.status ? GYM_MEMBERSHIP_STATUS_LABELS[membership.status] : '';
  }

  return row;
}

async function fetchMembershipSnapshots(gymId: string, memberIds: string[]) {
  const map = new Map<string, MembershipSnapshot>();
  if (!isSupabaseConfigured || memberIds.length === 0) return map;

  const supabase = getSupabase();
  if (!supabase) return map;

  const { data } = await supabase
    .from('gym_member_memberships')
    .select('member_id, starts_at, ends_at, status, gym_membership_plans(name, price, billing_period)')
    .eq('gym_id', gymId)
    .in('member_id', memberIds)
    .order('starts_at', { ascending: false });

  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const memberId = String(row.member_id);
    if (map.has(memberId)) continue;

    const planRow = Array.isArray(row.gym_membership_plans)
      ? row.gym_membership_plans[0]
      : row.gym_membership_plans;
    const plan = planRow as { name?: string; price?: number; billing_period?: string } | null | undefined;

    map.set(memberId, {
      planName: plan?.name,
      startsAt: row.starts_at ? String(row.starts_at).slice(0, 10) : undefined,
      endsAt: row.ends_at ? String(row.ends_at).slice(0, 10) : undefined,
      status: row.status as GymMembershipStatus,
    });
  }

  return map;
}

export async function buildGymMemberExportRows(gymId: string, members: GymMember[]) {
  const memberIds = members.map((member) => member.id);
  const memberships = await fetchMembershipSnapshots(gymId, memberIds);

  return members.map((member) => memberToExportRow(member, memberships.get(member.id)));
}

function rowsToMatrix(rows: GymMemberExportRow[]) {
  return [EXPORT_HEADERS.slice(), ...rows.map((row) => EXPORT_HEADERS.map((key) => row[key]))];
}

export function memberRowsToCsv(rows: GymMemberExportRow[]) {
  const matrix = rowsToMatrix(rows);
  return matrix.map((row) => row.map((cell) => escapeCsvCell(cell)).join(';')).join('\r\n');
}

export function memberRowsToExcelBuffer(rows: GymMemberExportRow[]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsToMatrix(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Miembros');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
}

function mapRecordToImportRow(record: Record<string, unknown>): GymMemberImportRow | null {
  const mapped: Partial<GymMemberInput> & {
    memberId?: string;
    membership?: GymMemberImportRow['membership'];
  } = {};
  const membership: GymMemberImportRow['membership'] = {};

  for (const [rawKey, rawValue] of Object.entries(record)) {
    const alias = HEADER_ALIASES[normalizeHeader(rawKey)];
    if (!alias || alias === 'skip') continue;

    const value = String(rawValue ?? '').trim();
    if (!value) continue;

    switch (alias) {
      case 'memberId':
        mapped.memberId = value;
        break;
      case 'firstName':
        mapped.firstName = value;
        break;
      case 'lastName':
        mapped.lastName = value;
        break;
      case 'email':
        mapped.email = value;
        break;
      case 'phone':
        mapped.phone = value;
        break;
      case 'birthDate':
        mapped.birthDate = value.slice(0, 10);
        break;
      case 'status':
        mapped.status = parseStatus(value);
        break;
      case 'pipelineStage': {
        const stage = parsePipelineStage(value);
        if (stage) mapped.pipelineStage = stage;
        break;
      }
      case 'joinedAt':
        mapped.joinedAt = value.slice(0, 10);
        break;
      case 'notes':
        mapped.notes = value;
        break;
      case 'planName':
        membership.planName = value;
        break;
      case 'membershipStartsAt':
        membership.startsAt = value.slice(0, 10);
        break;
      case 'membershipEndsAt':
        membership.endsAt = value.slice(0, 10);
        break;
      case 'membershipStatus': {
        const status = parseMembershipStatus(value);
        if (status) membership.status = status;
        break;
      }
      default:
        break;
    }
  }

  if (!mapped.firstName?.trim()) return null;

  const row: GymMemberImportRow = {
    firstName: mapped.firstName.trim(),
    lastName: mapped.lastName?.trim() ?? '',
    email: mapped.email?.trim() || undefined,
    phone: mapped.phone?.trim() || undefined,
    birthDate: mapped.birthDate,
    status: mapped.status ?? 'active',
    pipelineStage: mapped.pipelineStage,
    joinedAt: mapped.joinedAt,
    notes: mapped.notes?.trim() || undefined,
    memberId: mapped.memberId,
  };

  if (membership.planName || membership.startsAt || membership.endsAt || membership.status) {
    row.membership = membership;
  }

  return row;
}

function parseDelimitedText(text: string): GymMemberImportResult {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { rows: [], skipped: 0 };

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((header) => normalizeHeader(header.replace(/^"|"$/g, '')));
  const rows: GymMemberImportRow[] = [];
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cells = line
      .split(delimiter)
      .map((cell) => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? '';
    });
    const input = mapRecordToImportRow(record);
    if (input) rows.push(input);
    else skipped += 1;
  }

  return { rows, skipped };
}

function parseWorkbookBuffer(buffer: ArrayBuffer): GymMemberImportResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], skipped: 0 };

  const sheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const rows: GymMemberImportRow[] = [];
  let skipped = 0;

  for (const record of records) {
    const input = mapRecordToImportRow(record);
    if (input) rows.push(input);
    else skipped += 1;
  }

  return { rows, skipped };
}

async function readPickerFile(uri: string, format: GymMemberDataFormat) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('No se pudo leer el archivo seleccionado.');

  if (format === 'csv') {
    return parseDelimitedText(await response.text());
  }

  return parseWorkbookBuffer(await response.arrayBuffer());
}

function downloadOnWeb(filename: string, data: BlobPart, mimeType: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false;

  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

export async function exportGymMembers(
  gymId: string,
  members: GymMember[],
  format: GymMemberDataFormat,
  fileStem = 'contactos-gimnasio',
) {
  const rows = await buildGymMemberExportRows(gymId, members);
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const csv = `\uFEFF${memberRowsToCsv(rows)}`;
    if (!downloadOnWeb(`${fileStem}-${stamp}.csv`, csv, 'text/csv;charset=utf-8')) {
      return { error: 'La exportación CSV solo está disponible en la versión web por ahora.' };
    }
    return { data: rows.length };
  }

  const buffer = memberRowsToExcelBuffer(rows);
  if (
    !downloadOnWeb(
      `${fileStem}-${stamp}.xlsx`,
      buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  ) {
    return { error: 'La exportación Excel solo está disponible en la versión web por ahora.' };
  }
  return { data: rows.length };
}

export async function pickAndParseGymMembers(
  format: GymMemberDataFormat,
): Promise<{ cancelled: true } | { error: string } | GymMemberImportResult> {
  const mimeTypes =
    format === 'csv'
      ? ['text/csv', 'text/comma-separated-values', 'application/csv']
      : [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];

  const result = await DocumentPicker.getDocumentAsync({
    type: mimeTypes,
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { cancelled: true };
  }

  const asset = result.assets[0];
  const lowerName = asset.name.toLowerCase();
  const resolvedFormat =
    format === 'csv' || lowerName.endsWith('.csv')
      ? 'csv'
      : lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')
        ? 'excel'
        : format;

  try {
    const parsed = await readPickerFile(asset.uri, resolvedFormat);
    if (parsed.rows.length === 0) {
      return {
        error:
          'El archivo no contiene miembros válidos. Revisa que incluya al menos la columna nombre.',
      };
    }
    return parsed;
  } catch {
    return { error: 'No se pudo leer el archivo. Comprueba que sea un CSV o Excel válido.' };
  }
}

export function findMemberImportMatch(members: GymMember[], row: GymMemberImportRow) {
  if (row.memberId) {
    const byId = members.find((member) => member.id === row.memberId);
    if (byId) return byId;
  }

  const email = normalizeMatch(row.email);
  if (email) {
    const byEmail = members.find((member) => normalizeMatch(member.email) === email);
    if (byEmail) return byEmail;
  }

  const phone = normalizeMatch(row.phone);
  if (phone) {
    const byPhone = members.find((member) => normalizeMatch(member.phone) === phone);
    if (byPhone) return byPhone;
  }

  return null;
}
