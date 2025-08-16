// Interceptador de Token para Renovação Automática
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';

// O TokenInterceptor não é mais necessário pois os interceptadores
// já estão configurados na classe ApiClient
export const TokenInterceptor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};