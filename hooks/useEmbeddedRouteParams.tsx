import { useLocalSearchParams } from 'expo-router';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

type ParamRecord = Record<string, string | string[] | undefined>;

const EmbeddedParamsContext = createContext<ParamRecord | null>(null);

export function EmbeddedRouteParamsProvider({
  params,
  children,
}: {
  params: Record<string, string | undefined>;
  children: ReactNode;
}) {
  const value = useMemo(() => params as ParamRecord, [params]);
  return <EmbeddedParamsContext.Provider value={value}>{children}</EmbeddedParamsContext.Provider>;
}

export function useEmbeddedRouteParams<
  T extends Record<string, string | string[] | undefined> = Record<string, string | string[]>,
>() {
  const embedded = useContext(EmbeddedParamsContext);
  const routeParams = useLocalSearchParams();
  return useMemo(() => ({ ...routeParams, ...embedded }) as T, [embedded, routeParams]);
}
