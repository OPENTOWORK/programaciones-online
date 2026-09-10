import { Redirect } from 'expo-router';

export default function GymCrmRedirect() {
  return <Redirect href={{ pathname: '/gym/members', params: { tab: 'crm' } }} />;
}
