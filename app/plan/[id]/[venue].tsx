import { Redirect } from 'expo-router';

/** El catálogo Base · Training se retiró; enlaces antiguos vuelven a Programaciones. */
export default function StandardVenueRedirectScreen() {
  return <Redirect href="/tabs/programs" />;
}
