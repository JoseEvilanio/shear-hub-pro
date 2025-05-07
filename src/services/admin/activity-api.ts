
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/types/admin';

export const activityAdminApi = {
  // Get activity logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (!logs) return [];
    
    // Get user emails
    const logsWithUserEmails = await Promise.all(logs.map(async (log) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', log.user_id)
        .single();
      
      return {
        ...log,
        // Cast metadata to the correct type
        metadata: log.metadata as unknown as Record<string, any>,
        user_email: profile?.email || 'Unknown'
      } as ActivityLog;
    }));
    
    return logsWithUserEmails;
  }
};
