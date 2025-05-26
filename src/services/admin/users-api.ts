
import { supabase } from '@/integrations/supabase/client';
import { UserStats } from '@/types/admin';

export const usersAdminApi = {
  // Fetch users with stats - Modified to work with the actual structure of the profiles table
  async getUsers(): Promise<UserStats[]> {
    // 1. Fetch all base user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at');
    
    if (profilesError || !profiles) {
      console.error("Error fetching user profiles:", profilesError);
      return [];
    }

    if (profiles.length === 0) {
      return [];
    }

    const userIds = profiles.map(profile => profile.id);

    // 2. Fetch Related Data in Bulk (Appointments)
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('client_id') // Only select client_id as we are just counting
      .in('client_id', userIds);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      // Decide how to handle: return profiles with 0 counts or empty array
      // For now, proceed and counts will be 0 for users if appointments fail
    }

    // 3. Process Data Client-Side (Count Appointments)
    const appointmentCountsMap = new Map<string, number>();
    if (appointmentsData) {
      for (const apt of appointmentsData) {
        if (apt.client_id) {
          const clientIdStr = apt.client_id.toString();
          appointmentCountsMap.set(clientIdStr, (appointmentCountsMap.get(clientIdStr) || 0) + 1);
        }
      }
    }
    
    // 4. Merge Data
    const usersWithStats = profiles.map(profile => {
      const appointmentCount = appointmentCountsMap.get(profile.id.toString()) || 0;
      
      return {
        id: profile.id,
        email: profile.email || '',
        role: (profile.role as 'client' | 'barber' | 'owner' | 'admin' | 'superuser') || 'client',
        first_name: '', // These fields don't exist in the DB, so we use empty strings
        last_name: '',
        created_at: profile.created_at || '',
        appointmentCount: appointmentCount,
        avatar_url: undefined // This field doesn't exist in the DB
      } as UserStats;
    });
    
    return usersWithStats;
  }
};
