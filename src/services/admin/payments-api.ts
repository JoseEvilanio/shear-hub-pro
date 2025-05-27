
import { supabase } from '@/integrations/supabase/client';
import { PaymentStats } from '@/types/admin';

export const paymentsAdminApi = {
  // Fetch payments
  async getPayments(): Promise<PaymentStats[]> {
    // 1. Fetch all payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, barbershop_id, amount, status, payment_date, payment_method, invoice_url');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return [];
    }
    if (!payments || payments.length === 0) {
      return [];
    }

    // 2. Extract all unique barbershop_id's
    const uniqueBarbershopIds = Array.from(
      new Set(payments.map(p => p.barbershop_id).filter(id => id !== null && id !== undefined))
    );

    let barbershopMap = new Map<string, string>();

    // 3. Fetch all barbershops whose IDs are in the extracted list
    if (uniqueBarbershopIds.length > 0) {
      const { data: barbershops, error: barbershopsError } = await supabase
        .from('barbershops')
        .select('id, name')
        .in('id', uniqueBarbershopIds);

      if (barbershopsError) {
        console.error('Error fetching barbershops:', barbershopsError);
        // Decide if you want to return payments without names or empty array
        // For now, we'll proceed and use 'Unknown' for names
      }

      // 4. Create a map of barbershop_id to barbershop_name
      if (barbershops) {
        barbershops.forEach(shop => {
          if (shop.id && shop.name) { // Ensure id and name are not null
            barbershopMap.set(shop.id.toString(), shop.name);
          }
        });
      }
    }

    // 5. Iterate through payments and attach barbershop_name
    const paymentsWithShopNames = payments.map(payment => {
      const barbershop_name = payment.barbershop_id 
        ? barbershopMap.get(payment.barbershop_id.toString()) || 'Unknown' 
        : 'Unknown';
      
      return {
        ...payment,
        status: payment.status as 'pending' | 'paid' | 'failed' | 'refunded', // Ensure status is properly typed
        barbershop_name: barbershop_name,
        // Ensure all fields from PaymentStats are present, or cast appropriately
        // id, amount, status, payment_date, payment_method, invoice_url are from payments query
        // barbershop_id is also from payments query
      } as PaymentStats; // Cast to PaymentStats
    });

    return paymentsWithShopNames;
  }
};
