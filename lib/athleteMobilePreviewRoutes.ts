import type { Href } from 'expo-router';

export type AthletePreviewTabName = 'home' | 'programs' | 'progress' | 'trainer' | 'profile';

export type AthletePreviewRoute =
  | { name: 'plan'; params: { id: string } }
  | { name: 'program'; params: { id: string; sample?: string } }
  | { name: 'program-info'; params: { id: string } }
  | { name: 'program-chat'; params: { id: string } }
  | { name: 'workout'; params: { id: string; date?: string; preview?: string } }
  | { name: 'athlete-session'; params: { id: string; date?: string } }
  | { name: 'calendar'; params: { date: string } }
  | { name: 'intake'; params: { returnTo?: string; templateId?: string } }
  | {
      name: 'timer';
      params: {
        mode?: string;
        direction?: string;
        duration?: string;
        work?: string;
        rest?: string;
        rounds?: string;
        title?: string;
        block?: string;
      };
    };

export type AthletePreviewNavAction =
  | { kind: 'tab'; tab: AthletePreviewTabName }
  | { kind: 'route'; route: AthletePreviewRoute };

const TAB_PATHS: Record<string, AthletePreviewTabName> = {
  '/tabs/home': 'home',
  '/tabs/programs': 'programs',
  '/tabs/progress': 'progress',
  '/tabs/trainer': 'trainer',
  '/tabs/profile': 'profile',
};

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

function decodePart(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function matchPath(pathname: string, params: Record<string, string>): AthletePreviewNavAction | null {
  const path = pathname.split('#')[0].replace(/\/$/, '') || '/';
  const tab = TAB_PATHS[path];
  if (tab) return { kind: 'tab', tab };

  if (path === '/timer') {
    return {
      kind: 'route',
      route: {
        name: 'timer',
        params: {
          mode: params.mode,
          direction: params.direction,
          duration: params.duration,
          work: params.work,
          rest: params.rest,
          rounds: params.rounds,
          title: params.title,
          block: params.block,
        },
      },
    };
  }

  if (path === '/profile/intake-form') {
    return {
      kind: 'route',
      route: {
        name: 'intake',
        params: { returnTo: params.returnTo, templateId: params.templateId },
      },
    };
  }

  if (path === '/calendar/[date]' && params.date) {
    return { kind: 'route', route: { name: 'calendar', params: { date: params.date } } };
  }
  const calendar = path.match(/^\/calendar\/([^/]+)$/);
  if (calendar) {
    return { kind: 'route', route: { name: 'calendar', params: { date: decodePart(calendar[1]) } } };
  }

  if (path === '/plan/[id]' && params.id) {
    return { kind: 'route', route: { name: 'plan', params: { id: params.id } } };
  }
  const plan = path.match(/^\/plan\/([^/]+)$/);
  if (plan && plan[1] !== '[id]') {
    return { kind: 'route', route: { name: 'plan', params: { id: decodePart(plan[1]) } } };
  }

  if (path === '/program/[id]/info' && params.id) {
    return { kind: 'route', route: { name: 'program-info', params: { id: params.id } } };
  }
  if (path === '/program/[id]/chat' && params.id) {
    return { kind: 'route', route: { name: 'program-chat', params: { id: params.id } } };
  }
  if (path === '/program/[id]' && params.id) {
    return {
      kind: 'route',
      route: { name: 'program', params: { id: params.id, sample: params.sample } },
    };
  }

  const programInfo = path.match(/^\/program\/([^/]+)\/info$/);
  if (programInfo) {
    return { kind: 'route', route: { name: 'program-info', params: { id: decodePart(programInfo[1]) } } };
  }
  const programChat = path.match(/^\/program\/([^/]+)\/chat$/);
  if (programChat) {
    return { kind: 'route', route: { name: 'program-chat', params: { id: decodePart(programChat[1]) } } };
  }
  const program = path.match(/^\/program\/([^/]+)$/);
  if (program && program[1] !== '[id]') {
    return {
      kind: 'route',
      route: { name: 'program', params: { id: decodePart(program[1]), sample: params.sample } },
    };
  }

  if (path === '/workout/[id]' && params.id) {
    return {
      kind: 'route',
      route: { name: 'workout', params: { id: params.id, date: params.date, preview: params.preview } },
    };
  }
  const workout = path.match(/^\/workout\/([^/]+)$/);
  if (workout && workout[1] !== '[id]') {
    return {
      kind: 'route',
      route: {
        name: 'workout',
        params: { id: decodePart(workout[1]), date: params.date, preview: params.preview },
      },
    };
  }

  if (path === '/athlete/plan/[id]/session' && params.id) {
    return {
      kind: 'route',
      route: { name: 'athlete-session', params: { id: params.id, date: params.date } },
    };
  }
  const session = path.match(/^\/athlete\/plan\/([^/]+)\/session$/);
  if (session) {
    return {
      kind: 'route',
      route: { name: 'athlete-session', params: { id: decodePart(session[1]), date: params.date } },
    };
  }

  return null;
}

export function hrefToAthletePreviewNavAction(href: Href): AthletePreviewNavAction | null {
  if (typeof href === 'string') {
    const [path, query = ''] = href.split('?');
    const params = Object.fromEntries(new URLSearchParams(query));
    return matchPath(path, params);
  }

  if (typeof href === 'object' && href && 'pathname' in href && href.pathname) {
    return matchPath(href.pathname, normalizeParams(href.params));
  }

  return null;
}

export function athletePreviewRouteTitle(route: AthletePreviewRoute): string {
  switch (route.name) {
    case 'plan':
      return 'Programación';
    case 'program':
      return route.params.sample === '1' ? 'Semana de prueba' : 'Calendario';
    case 'program-info':
      return 'Ficha';
    case 'program-chat':
      return 'Chat grupal';
    case 'workout':
      return 'Entreno';
    case 'athlete-session':
      return 'Sesión';
    case 'calendar':
      return 'Día';
    case 'intake':
      return 'Formulario';
    case 'timer':
      return 'Cronómetro';
    default:
      return 'Vista móvil';
  }
}

export function athletePreviewRouteParams(route: AthletePreviewRoute): Record<string, string | undefined> {
  switch (route.name) {
    case 'plan':
    case 'program-info':
    case 'program-chat':
      return { id: route.params.id };
    case 'program':
      return { id: route.params.id, sample: route.params.sample };
    case 'workout':
      return { id: route.params.id, date: route.params.date, preview: route.params.preview };
    case 'athlete-session':
      return { id: route.params.id, date: route.params.date };
    case 'calendar':
      return { date: route.params.date };
    case 'intake':
      return { returnTo: route.params.returnTo, templateId: route.params.templateId };
    case 'timer':
      return {
        mode: route.params.mode,
        direction: route.params.direction,
        duration: route.params.duration,
        work: route.params.work,
        rest: route.params.rest,
        rounds: route.params.rounds,
        title: route.params.title,
        block: route.params.block,
      };
    default:
      return {};
  }
}
