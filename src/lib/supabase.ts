/**
 * Configuração do Supabase
 * 
 * Para usar o Supabase, configure as variáveis de ambiente:
 * - NEXT_PUBLIC_SUPABASE_URL: URL do seu projeto Supabase
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Chave anon do seu projeto
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}
