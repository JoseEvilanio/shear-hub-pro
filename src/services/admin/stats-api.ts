import { supabase } from '@/integrations/supabase/client';
import { AppStats } from '@/types/admin';

export const statsAdminApi = {
  // Fetch overall app stats
  async getAppStats(): Promise<AppStats> {
    // Count of barbershops
    const { count: total_barbershops } = await supabase
      .from('barbershops')
      .select('*', { count: 'exact', head: true });
    
    const { count: active_barbershops } = await supabase
      .from('barbershops')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const { count: blocked_barbershops } = await supabase
      .from('barbershops')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'blocked');
    
    // Count of users by role
    const { count: total_clients } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');
    
    const { count: total_barbers } = await supabase
      .from('barbers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Count of appointments
    const { count: total_appointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });
    
    // Sum of payments
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid');
    
    const total_revenue = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount as any), 0) || 0;
    
    // Current month revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: monthlyPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('processed_at', startOfMonth.toISOString());
    
    const monthly_revenue = monthlyPayments?.reduce((sum, payment) => sum + parseFloat(payment.amount as any), 0) || 0;
    
    return {
      total_barbershops: total_barbershops || 0,
      active_barbershops: active_barbershops || 0,
      blocked_barbershops: blocked_barbershops || 0,
      total_clients: total_clients || 0,
      total_barbers: total_barbers || 0,
      total_appointments: total_appointments || 0,
      total_revenue,
      monthly_revenue
    };
  }
};
