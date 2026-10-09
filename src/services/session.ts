export function clearSession(event = 'healthcheck:session-ended'): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(event));
}

export async function sessionFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const sent = new Headers(init?.headers).get('Authorization');
    // A late failure from an old login must not erase a newer session.
    if (token && sent === `Bearer ${token}`) {
      if (response.status === 401) clearSession();
      if (response.status === 403) window.dispatchEvent(new Event('healthcheck:permissions-changed'));
    }
  }
  return response;
}
