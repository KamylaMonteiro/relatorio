import { createClient } from '@supabase/supabase-js';

// Function to validate and get a proper Supabase URL
const getValidSupabaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // If no environment URL is provided, return empty string
  if (!envUrl || envUrl.trim() === '') {
    return '';
  }
  
  // Try to validate the URL
  try {
    new URL(envUrl);
    return envUrl;
  } catch (error) {
    console.warn('Invalid VITE_SUPABASE_URL provided:', envUrl);
    return '';
  }
};

const supabaseUrl = getValidSupabaseUrl();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if both URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  const hasValidUrl = supabaseUrl && supabaseUrl !== '';
  const hasValidKey = supabaseAnonKey && supabaseAnonKey !== '';
  
  return !!(hasValidUrl && hasValidKey && supabase);
};

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
    // Tenta fazer uma consulta simples para testar a conexão
    const { error } = await supabase.from('meetings').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Erro ao testar conexão com Supabase:', error);
    return false;
  }
};