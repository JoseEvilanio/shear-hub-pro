
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan } from '@/types/admin';

export const subscriptionsAdminApi = {
  // Get subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (!data) return [];

    return data.map(plan => ({
      ...plan,
      // Cast features to the correct type
      features: plan.features as unknown as Record<string, any>
    })) as SubscriptionPlan[];
  }
};
