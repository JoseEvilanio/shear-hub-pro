
import { supabase } from '@/integrations/supabase/client';
import { PaymentStats } from '@/types/admin';

export const paymentsAdminApi = {
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
        // Ensure status is properly typed
        status: payment.status as 'pending' | 'paid' | 'failed' | 'refunded',
        barbershop_name: barbershop?.name || 'Unknown'
      } as PaymentStats;
    }));
    
    return paymentsWithShopNames;
  }
};
