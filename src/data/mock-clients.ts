
export const mockClients = [
  {
    id: 1,
    name: "Ricardo Almeida",
    avatar: "",
    email: "ricardo@email.com",
    phone: "(11) 99876-5432",
    loyaltyPoints: 45,
    status: "active",
    lastVisit: "2025-04-29",
    totalVisits: 12,
    preferredBarber: "Carlos Eduardo",
    notes: "Prefere corte degradê baixo e barba modelada."
  },
  {
    id: 2,
    name: "Fernando Silva",
    avatar: "",
    email: "fernando@email.com",
    phone: "(11) 98765-4321",
    loyaltyPoints: 20,
    status: "active",
    lastVisit: "2025-04-15",
    totalVisits: 6,
    preferredBarber: "André Santos",
    notes: "Cliente sensível no couro cabeludo, usar tesoura na parte superior."
  },
  {
    id: 3,
    name: "Bruno Costa",
    avatar: "",
    email: "bruno@email.com",
    phone: "(11) 97654-3210",
    loyaltyPoints: 65,
    status: "inactive",
    lastVisit: "2025-03-02",
    totalVisits: 18,
    preferredBarber: "Marcos Paulo",
    notes: "Corte militar com máquina zero nas laterais."
  },
  {
    id: 4,
    name: "Pedro Oliveira",
    avatar: "",
    email: "pedro@email.com",
    phone: "(11) 96543-2109",
    loyaltyPoints: 30,
    status: "active",
    lastVisit: "2025-05-01",
    totalVisits: 8,
    preferredBarber: "João Victor",
    notes: "Barba apenas aparada, mantendo comprimento."
  }
];

export const mockAppointments = [
  {
    id: 1,
    date: "2025-05-01",
    time: "14:30",
    service: "Corte Degradê",
    barber: "Carlos Eduardo",
    price: 45.00,
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    note: "Cliente muito satisfeito com o resultado"
  },
  {
    id: 2,
    date: "2025-04-15",
    time: "16:00",
    service: "Barba",
    barber: "André Santos",
    price: 35.00,
    status: "completed",
    paymentMethod: "PIX",
    note: ""
  },
  {
    id: 3,
    date: "2025-03-30",
    time: "10:15",
    service: "Combo (Corte + Barba)",
    barber: "Carlos Eduardo",
    price: 70.00,
    status: "completed",
    paymentMethod: "Dinheiro",
    note: "Cliente solicitou manter comprimento no topo"
  },
  {
    id: 4,
    date: "2025-03-10",
    time: "11:00",
    service: "Corte Simples",
    barber: "João Victor",
    price: 40.00,
    status: "canceled",
    paymentMethod: "-",
    note: "Cliente não compareceu"
  },
  {
    id: 5,
    date: "2025-02-22",
    time: "15:45",
    service: "Corte Degradê + Sobrancelha",
    barber: "Marcos Paulo",
    price: 55.00,
    status: "completed",
    paymentMethod: "Cartão de Débito",
    note: ""
  }
];
