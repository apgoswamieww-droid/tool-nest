// ──────────────────────────────────────────────────────
// ToolNest — Account layer client helpers
//
// Thin, typed fetch wrappers for the session-authenticated account
// APIs (/api/favorites, /api/calculations, /api/preferences). Used by
// client components only; the server components never import this.
// All requests are same-origin, so session cookies travel
// automatically. A non-OK response throws with the server message.
// ──────────────────────────────────────────────────────

export interface SavedCalculationItem {
  id: string;
  toolSlug: string;
  title: string | null;
  toolVersion: string | null;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SavedCalculationPage {
  calculations: SavedCalculationItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface UserPreferences {
  theme: "light" | "dark" | "system" | null;
  language: string | null;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!res.ok) {
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

// ── Favorites ─────────────────────────────────────────

export async function fetchFavoriteSlugs(): Promise<string[]> {
  const res = await fetch("/api/favorites");
  if (!res.ok) throw new Error("Failed to load favorites");
  const body = (await res.json()) as { favorites: { toolSlug: string }[] };
  return body.favorites.map((f) => f.toolSlug);
}

/** Toggle a favorite; returns the new state (true = favorited). */
export async function toggleFavorite(toolSlug: string): Promise<boolean> {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolSlug }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to update favorites");
  }
  const body = (await res.json()) as { favorited: boolean };
  return body.favorited;
}

// ── Saved calculations ────────────────────────────────

export async function fetchSavedCalculations(params: {
  toolSlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<SavedCalculationPage> {
  const search = new URLSearchParams();
  if (params.toolSlug) search.set("toolSlug", params.toolSlug);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 20));
  return request<SavedCalculationPage>(`/api/calculations?${search.toString()}`);
}

export async function deleteSavedCalculation(id: string): Promise<void> {
  const res = await fetch(`/api/calculations/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to delete saved calculation");
  }
}

// ── Preferences ───────────────────────────────────────

export async function fetchPreferences(): Promise<UserPreferences> {
  const res = await request<{ preferences: UserPreferences }>("/api/preferences");
  return {
    theme: res.preferences.theme ?? null,
    language: res.preferences.language ?? null,
  };
}

export async function updatePreferences(update: {
  theme?: "light" | "dark" | "system";
  language?: string;
}): Promise<UserPreferences> {
  const res = await request<{ preferences: UserPreferences }>("/api/preferences", {
    method: "PUT",
    body: JSON.stringify(update),
  });
  return {
    theme: res.preferences.theme ?? null,
    language: res.preferences.language ?? null,
  };
}
