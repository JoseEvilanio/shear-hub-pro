// Store simples para demonstração
export const useAppSelector = (selector: any) => {
  return selector({
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        name: 'Administrador',
        email: 'admin@oficina.com',
        role: 'admin'
      }
    }
  });
};

export const store = {
  getState: () => ({
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        name: 'Administrador',
        email: 'admin@oficina.com',
        role: 'admin'
      }
    }
  })
};