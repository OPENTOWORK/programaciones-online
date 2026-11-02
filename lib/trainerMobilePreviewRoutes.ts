import type { Href } from 'expo-router';

export type TrainerPreviewRoute =
  | { name: 'plan-category'; planId: string }
  | { name: 'trainer-plan-create'; type?: string }
  | { name: 'trainer-plan'; id: string; edit?: string }
  | { name: 'trainer-athlete'; id: string };

export type TrainerPreviewNavAction =
  | { kind: 'route'; route: TrainerPreviewRoute }
  | { kind: 'reset-tabs' };

function normalizeParams(
  params?: Record<string, string | number | (string | number)[] | null | undefined>,
): Record<string, string> {
  if (!params) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    out[key] = Array.isArray(value) ? String(value[0] ?? '') : String(value);
  }
  return out;
}

function matchPath(pathname: string, params: Record<string, string> = {}): TrainerPreviewNavAction | null {
  if (pathname === '/tabs/programs' || pathname === '/tabs/home') {
    return { kind: 'reset-tabs' };
  }

  const planCategory = pathname.match(/^\/plan\/([^/]+)$/);
  if (planCategory) {
    return { kind: 'route', route: { name: 'plan-category', planId: planCategory[1] } };
  }

  if (pathname === '/trainer/plan/create') {
    return {
      kind: 'route',
      route: { name: 'trainer-plan-create', type: params.type },
    };
  }

  if (pathname === '/trainer/plan/[id]') {
    const id = params.id;
    if (!id) return null;
    return {
      kind: 'route',
      route: { name: 'trainer-plan', id, edit: params.edit },
    };
  }

  if (pathname === '/trainer/athlete/[id]') {
    const id = params.id;
    if (!id) return null;
    return { kind: 'route', route: { name: 'trainer-athlete', id } };
  }

  return null;
}

export function hrefToTrainerPreviewNavAction(href: Href): TrainerPreviewNavAction | null {
  if (typeof href === 'string') {
    const [path, query = ''] = href.split('?');
    const params = Object.fromEntries(new URLSearchParams(query));
    return matchPath(path, params);
  }

  if (typeof href === 'object' && href.pathname) {
    return matchPath(href.pathname, normalizeParams(href.params));
  }

  return null;
}

export function previewRouteTitle(route: TrainerPreviewRoute): string {
  switch (route.name) {
    case 'plan-category':
      return 'Programación';
    case 'trainer-plan-create':
      return 'Nuevo plan';
    case 'trainer-plan':
      return 'Plan del atleta';
    case 'trainer-athlete':
      return 'Ficha del atleta';
    default:
      return 'Vista móvil';
  }
}
