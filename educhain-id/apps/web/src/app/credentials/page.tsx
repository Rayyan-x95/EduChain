import { redirect } from 'next/navigation';

export default function CredentialsPage() {
  // Canonical student credentials hub is currently implemented as `/wallet`.
  // Keep `/credentials` as a stable route for navigation + external links.
  redirect('/wallet');
}

