
export const mockLoyaltyPrograms = [
  {
    id: 1,
    name: "Programa Cortes Fidelidade",
    description: "Acumule pontos a cada corte de cabelo",
    rule: "1 corte = 10 pontos",
    status: "active",
    participants: 78,
    rewards: [
      {
        name: "Corte Grátis",
        description: "Um corte de cabelo totalmente gratuito",
        points: 100,
        redeemed: 15
      },
      {
        name: "Tratamento Especial",
        description: "Hidratação profunda gratuita",
        points: 75,
        redeemed: 8
      }
    ]
  },
  {
    id: 2,
    name: "Clube da Barba",
    description: "Programa exclusivo para serviços de barba",
    rule: "R$1 gasto = 1 ponto",
    status: "active",
    participants: 46,
    rewards: [
      {
        name: "Barba Gratuita",
        description: "Um serviço de barba completo",
        points: 120,
        redeemed: 7
      },
      {
        name: "Kit Barba",
        description: "Kit com produtos para barba",
        points: 200,
        redeemed: 4
      }
    ]
  },
  {
    id: 3,
    name: "VIP Premium",
    description: "Programa para clientes premium com benefícios exclusivos",
    rule: "Assinatura mensal de R$99,00",
    status: "inactive",
    participants: 0,
    rewards: [
      {
        name: "Atendimento Prioritário",
        description: "Agendamento prioritário sem espera",
        points: 0,
        redeemed: 0
      },
      {
        name: "Desconto Permanente",
        description: "10% de desconto em todos os serviços",
        points: 0,
        redeemed: 0
      }
    ]
  }
];
