import { Redirect, useLocalSearchParams } from 'expo-router';

import { normalizeRouteParam } from '@/lib/routeParams';
import { getStandardVenue } from '@/lib/standardVenues';

/** Enlaces antiguos a /plan/[id]/gym etc. redirigen a Estándar con la pestaña correcta. */
export default function StandardVenueRedirectScreen() {
  const { id, venue } = useLocalSearchParams<{ id?: string | string[]; venue?: string | string[] }>();
  const planId = normalizeRouteParam(id) ?? '';
  const venueId = normalizeRouteParam(venue) ?? 'gym';
  const standardVenue = getStandardVenue(venueId);

  if (!planId || !standardVenue) {
    return <Redirect href="/tabs/programs" />;
  }

  return (
    <Redirect
      href={{
        pathname: '/plan/[id]',
        params: { id: planId, venue: standardVenue.id },
      }}
    />
  );
}
