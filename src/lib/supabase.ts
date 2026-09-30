// Punto de entrada único del cliente de base de datos para Balanz.
// Reutiliza el cliente generado (lee VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY).
export { supabase } from "@/integrations/supabase/client";
