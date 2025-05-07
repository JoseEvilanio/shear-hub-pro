
import { supabase } from '@/integrations/supabase/client';
import { BarbershopStats } from '@/types/admin';

export const barbershopsAdminApi = {
  async getBarbershops(): Promise<BarbershopStats[]> {
    const { data: barbershops } = await supabase
      .from('barbershops')
      .select('id, name, city, status, payment_status, next_payment_date, created_at');
    
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
        // Ensure status is properly typed
        status: shop.status as 'active' | 'inactive' | 'blocked',
        payment_status: shop.payment_status as 'active' | 'late' | 'blocked',
        clientCount: clientCount || 0,
        barberCount: barberCount || 0,
        appointmentCount: appointmentCount || 0,
        revenue
      } as BarbershopStats;
    }));
    
    return barbershopsWithStats;
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
  }
};
