
import { supabase } from '@/integrations/supabase/client';
import { UserStats } from '@/types/admin';

export const usersAdminApi = {
  // Fetch users with stats - Modified to work with the actual structure of the profiles table
  async getUsers(): Promise<UserStats[]> {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at');
    
    if (error || !users) {
      console.error("Error fetching user profiles:", error);
      return [];
    }
    
    // For each user, get appointment count
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id);
      
      // Create UserStats object with available data
      const userStats: UserStats = {
        id: user.id,
        email: user.email || '',
        role: (user.role as 'client' | 'barber' | 'owner' | 'admin' | 'superuser') || 'client',
        first_name: '', // These fields don't exist in the DB, so we use empty strings
        last_name: '',
        created_at: user.created_at || '',
        appointmentCount: appointmentCount || 0,
        avatar_url: undefined
      };

      return userStats;
    }));
    
    return usersWithStats;
  }
};
