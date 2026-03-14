import type { DashboardState } from '../types';
import { getSupabase } from '../auth/supabase';
import { validateAreas } from '../model/validation';
import { normalizeLoadedState } from './localStorage';

const TABLE = 'dashboard_state';

export async function loadRemoteState(userId: string): Promise<DashboardState | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select('state')
    .eq('user_id', userId)
    .single();
  if (error || !data?.state) return null;
  try {
    const parsed = data.state as Partial<DashboardState>;
    if (!parsed || !Array.isArray(parsed.areas)) return null;
    const validation = validateAreas(parsed.areas);
    if (!validation.ok) return null;
    return normalizeLoadedState(parsed);
  } catch {
    return null;
  }
}

export async function saveRemoteState(userId: string, state: DashboardState): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
}
