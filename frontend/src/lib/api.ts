const BASE = "/api";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export function getPrograms(lang: string) {
  return fetchApi<import("@/types").Program[]>(`/programs?lang=${lang}`);
}

export function getProgramById(id: string, lang: string) {
  return fetchApi<import("@/types").ProgramDetail>(`/programs/${id}?lang=${lang}`);
}

export function getMe() {
  return fetchApi<import("@/types").MeResponse>(`/me`);
}

export function updateGroup(id: string, data: import("@/types").GroupUpdatePayload) {
  return fetchApi<{ success: boolean }>(`/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function loginUrl() {
  return `/api/auth/login`;
}

export function logoutUrl() {
  return `/api/auth/logout`;
}
