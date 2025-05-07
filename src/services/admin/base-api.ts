
import { supabase } from '@/integrations/supabase/client';

export const baseAdminApi = {
  // Check if current user is a superuser
  async isSuperUser(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    return profile?.role === 'superuser';
  }
};
