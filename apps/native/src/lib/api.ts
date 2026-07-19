// One place for the API origin. In production this is unset until the API is
// hosted; screens show a friendly "engine not connected" state instead.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? 'http://localhost:4300' : undefined);

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new Error('api-not-configured');
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return (await res.json()) as T;
}
