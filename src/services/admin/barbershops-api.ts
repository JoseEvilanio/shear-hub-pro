import { supabase } from '@/integrations/supabase/client';
import { BarbershopStats } from '@/types/admin';

export const barbershopsAdminApi = {
  async getBarbershops(): Promise<BarbershopStats[]> {
    // 1. Fetch all base barbershop data
    const { data: barbershopsData, error: barbershopsError } = await supabase
      .from('barbershops')
      .select('id, name, city, status, payment_status, next_payment_date, created_at');

    if (barbershopsError) {
      console.error('Error fetching barbershops:', barbershopsError);
      return [];
    }
    if (!barbershopsData || barbershopsData.length === 0) {
      return [];
    }

    const shopIds = barbershopsData.map(shop => shop.id);

    if (shopIds.length === 0) {
      return barbershopsData.map(shop => ({
        ...shop,
        status: shop.status as 'active' | 'inactive' | 'blocked',
        payment_status: shop.payment_status as 'active' | 'late' | 'blocked',
        clientCount: 0,
        barberCount: 0,
        appointmentCount: 0,
        revenue: 0,
      } as BarbershopStats));
    }

    // 2. Fetch Related Data in Bulk
    const [
      { data: appointmentsData, error: appointmentsError },
      { data: barbersData, error: barbersError },
      { data: paymentsData, error: paymentsError }
    ] = await Promise.all([
      supabase.from('appointments').select('barbershop_id, client_id').in('barbershop_id', shopIds).not('client_id', 'is', null),
      supabase.from('barbers').select('barbershop_id, id').in('barbershop_id', shopIds).eq('is_active', true),
      supabase.from('payments').select('barbershop_id, amount').eq('status', 'paid').in('barbershop_id', shopIds)
    ]);

    if (appointmentsError) console.error('Error fetching appointments:', appointmentsError);
    if (barbersError) console.error('Error fetching barbers:', barbersError);
    if (paymentsError) console.error('Error fetching payments:', paymentsError);

    // 3. Process Data Client-Side
    const clientCountsMap = new Map<string, number>();
    const appointmentCountsMap = new Map<string, number>();
    const barberCountsMap = new Map<string, number>();
    const revenueMap = new Map<string, number>();
    const barbershopClientSetsMap = new Map<string, Set<string>>();

    if (appointmentsData) {
      for (const apt of appointmentsData) {
        if (apt.barbershop_id) {
          const shopIdStr = apt.barbershop_id.toString();
          appointmentCountsMap.set(shopIdStr, (appointmentCountsMap.get(shopIdStr) || 0) + 1);
          if (apt.client_id) {
            if (!barbershopClientSetsMap.has(shopIdStr)) {
              barbershopClientSetsMap.set(shopIdStr, new Set());
            }
            barbershopClientSetsMap.get(shopIdStr)!.add(apt.client_id.toString());
          }
        }
      }
    }
    barbershopClientSetsMap.forEach((clientSet, shopId) => {
      clientCountsMap.set(shopId, clientSet.size);
    });
    
    if (barbersData) {
      for (const barber of barbersData) {
        if (barber.barbershop_id) {
          const shopIdStr = barber.barbershop_id.toString();
          barberCountsMap.set(shopIdStr, (barberCountsMap.get(shopIdStr) || 0) + 1);
        }
      }
    }

    if (paymentsData) {
      for (const payment of paymentsData) {
        if (payment.barbershop_id && typeof payment.amount === 'number') {
           const shopIdStr = payment.barbershop_id.toString();
          revenueMap.set(shopIdStr, (revenueMap.get(shopIdStr) || 0) + payment.amount);
        } else if (payment.barbershop_id && typeof payment.amount === 'string') { // Handle if amount is string
          const shopIdStr = payment.barbershop_id.toString();
          revenueMap.set(shopIdStr, (revenueMap.get(shopIdStr) || 0) + parseFloat(payment.amount));
        }
      }
    }
    
    // 4. Merge Data
    const barbershopsWithStats = barbershopsData.map(shop => {
      const shopIdStr = shop.id.toString();
      return {
        ...shop,
        status: shop.status as 'active' | 'inactive' | 'blocked',
        payment_status: shop.payment_status as 'active' | 'late' | 'blocked',
        clientCount: clientCountsMap.get(shopIdStr) || 0,
        barberCount: barberCountsMap.get(shopIdStr) || 0,
        appointmentCount: appointmentCountsMap.get(shopIdStr) || 0,
        revenue: revenueMap.get(shopIdStr) || 0,
      } as BarbershopStats;
    });

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
