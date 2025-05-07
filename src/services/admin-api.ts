
import { baseAdminApi } from './admin/base-api';
import { statsAdminApi } from './admin/stats-api';
import { barbershopsAdminApi } from './admin/barbershops-api';
import { usersAdminApi } from './admin/users-api';
import { paymentsAdminApi } from './admin/payments-api';
import { subscriptionsAdminApi } from './admin/subscriptions-api';
import { activityAdminApi } from './admin/activity-api';

// Combine all admin API modules into a single export
export const adminApi = {
  ...baseAdminApi,
  ...statsAdminApi,
  ...barbershopsAdminApi,
  ...usersAdminApi,
  ...paymentsAdminApi,
  ...subscriptionsAdminApi,
  ...activityAdminApi
};
