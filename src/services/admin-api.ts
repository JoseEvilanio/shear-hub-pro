
import { supabase } from '@/integrations/supabase/client';
import { 
  AppStats, 
  BarbershopStats, 
  UserStats, 
  PaymentStats, 
  SubscriptionPlan,
  ActivityLog
} from '@/types/admin';

export const adminApi = {
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
      .eq('status', 'active');
    
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
      .gte('payment_date', startOfMonth.toISOString());
    
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
  },

  // Fetch barbershops with stats
  async getBarbershops(): Promise<BarbershopStats[]> {
    const { data: barbershops } = await supabase
      .from('barbershops')
      .select('id, name, city, status, payment_status, next_payment_date');
    
    if (!barbershops) return [];
    
    // For each barbershop, get additional stats
    const barbershopsWithStats = await Promise.all(barbershops.map(async (shop) => {
      // Count clients (users who have appointments with this barbershop)
      const { count: clientCount } = await supabase
        .from('appointments')
        .select('client_id', { count: 'exact', head: true })
        .eq('barbershop_id', shop.id)
        .not('client_id', 'is', null);
      
      // Count barbers
      const { count: barberCount } = await supabase
        .from('barbers')
        .select('*', { count: 'exact', head: true })
        .eq('barbershop_id', shop.id);
      
      // Count appointments
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('barbershop_id', shop.id);
      
      // Sum payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('barbershop_id', shop.id)
        .eq('status', 'paid');
      
      const revenue = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount as any), 0) || 0;
      
      return {
        ...shop,
        clientCount: clientCount || 0,
        barberCount: barberCount || 0,
        appointmentCount: appointmentCount || 0,
        revenue
      };
    }));
    
    return barbershopsWithStats;
  },

  // Fetch users with stats
  async getUsers(): Promise<UserStats[]> {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, created_at, avatar_url');
    
    if (!users) return [];
    
    // For each user, get appointment count
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id);
      
      return {
        ...user,
        appointmentCount: appointmentCount || 0
      };
    }));
    
    return usersWithStats;
  },

  // Fetch payments
  async getPayments(): Promise<PaymentStats[]> {
    const { data: payments } = await supabase
      .from('payments')
      .select('id, barbershop_id, amount, status, payment_date, payment_method, invoice_url');
    
    if (!payments) return [];
    
    // Get barbershop names
    const paymentsWithShopNames = await Promise.all(payments.map(async (payment) => {
      const { data: barbershop } = await supabase
        .from('barbershops')
        .select('name')
        .eq('id', payment.barbershop_id)
        .single();
      
      return {
        ...payment,
        barbershop_name: barbershop?.name || 'Unknown'
      };
    }));
    
    return paymentsWithShopNames;
  },

  // Block/unblock a barbershop
  async updateBarbershopStatus(id: string, status: 'active' | 'blocked'): Promise<void> {
    await supabase
      .from('barbershops')
      .update({ status, payment_status: status === 'blocked' ? 'blocked' : 'active' })
      .eq('id', id);
    
    // Log activity
    await supabase.rpc('log_activity', {
      action: status === 'blocked' ? 'block_barbershop' : 'unblock_barbershop',
      target_type: 'barbershop',
      target_id: id
    });
  },

  // Get subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*');
    
    return data || [];
  },

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
        user_email: profile?.email || 'Unknown'
      };
    }));
    
    return logsWithUserEmails;
  },

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
