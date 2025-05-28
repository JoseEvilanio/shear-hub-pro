// Este arquivo é gerado automaticamente. Não o edite diretamente.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("URL do Supabase ou Chave Pública não está definida nas variáveis de ambiente. Certifique-se de criar um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.");
  // Opcionalmente, lance um erro para impedir que o aplicativo seja executado sem a configuração adequada
  // throw new Error("URL do Supabase ou Chave Pública não está definida nas variáveis de ambiente.");
}

// Importe o cliente supabase assim:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);