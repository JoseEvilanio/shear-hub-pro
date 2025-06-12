"use client";
import React from "react";

const stats = [
  {
    title: "Pedidos Hoje",
    value: 0,
    subtext: "0% mais que ontem",
    status: "0 concluídos, 0 pendentes",
    color: "#FF6A00",
    icon: (
      <span className="inline-block w-3 h-3 rounded-full" style={{background:'#FF6A00'}}></span>
    ),
  },
  {
    title: "Faturamento do Dia",
    value: "R$ 0.00",
    subtext: "0% mais que ontem",
    status: "Meta: R$ 3000.00",
    color: "#10B981",
    icon: (
      <span className="inline-block w-3 h-3 rounded-full" style={{background:'#10B981'}}></span>
    ),
  },
  {
    title: "Tempo Médio",
    value: "24 min",
    subtext: "9% a mais que ontem",
    status: "Meta: 20 min",
    color: "#FFD600",
    icon: (
      <span className="inline-block w-3 h-3 rounded-full" style={{background:'#FFD600'}}></span>
    ),
  },
  {
    title: "Clientes Atendidos",
    value: 0,
    subtext: "0% mais que ontem",
    status: "0 novos clientes",
    color: "#B0B0B0",
    icon: (
      <span className="inline-block w-3 h-3 rounded-full" style={{background:'#B0B0B0'}}></span>
    ),
  },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mb-6">Bem-vindo de volta, Jose! Aqui está o resumo do seu restaurante.</p>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border-t-4" style={{borderTopColor: stat.color}}>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">{stat.title} {stat.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.subtext}</div>
            <div className="text-xs text-gray-400">{stat.status}</div>
          </div>
        ))}
      </div>
      {/* Pedidos Recentes */}
      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Pedidos Recentes</h2>
          <a href="#" className="text-[#FF6A00] text-sm font-medium hover:underline">Ver todos</a>
        </div>
        <input type="text" placeholder="Buscar por cliente..." className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6A00] outline-none" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500">
                <th className="py-2">Pedido</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">Nenhum resultado encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-1 rounded border border-gray-200 text-gray-500">Anterior</button>
          <button className="px-4 py-1 rounded border border-gray-200 text-gray-500">Próximo</button>
        </div>
      </section>
      {/* Itens Mais Vendidos */}
      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Itens Mais Vendidos</h2>
          <a href="#" className="text-[#FF6A00] text-sm font-medium hover:underline">Ver todos</a>
        </div>
        {/* Conteúdo futuro */}
      </section>
      {/* Atividade em Tempo Real e WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Atividade em Tempo Real</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Pedido #2340 foi entregue com sucesso <span className="text-xs text-gray-400">5 minutos atrás</span></li>
            <li>Pedido #2338 está aguardando há mais de 30 minutos <span className="text-xs text-gray-400">10 minutos atrás</span></li>
          </ul>
        </section>
        <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-700">Integração WhatsApp</h2>
          <p className="text-gray-500 text-sm">Receba pedidos diretamente pelo WhatsApp</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.94 14.47l-1.05 3.84a1 1 0 0 0 1.22 1.22l3.84-1.05A10 10 0 1 0 12 2Zm5.93 14.07a8 8 0 1 1-13.86-2.13.99.99 0 0 0-.12-.21l-.7-2.57 2.57.7c.07.02.14.06.21.12A8 8 0 0 1 12 20a8 8 0 0 1 5.93-3.93Z" fill="#25D366"/></svg>
            </span>
            <span className="text-[#25D366] font-semibold">Status: Conectado</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Mensagens hoje:</span>
            <span className="font-bold">32</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 bg-[#25D366] text-white rounded-lg py-2 font-semibold hover:bg-[#22c55e] transition-colors">Configurar Mensagens</button>
            <button className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 font-semibold hover:bg-gray-100 transition-colors">Ver Conversas</button>
          </div>
        </section>
      </div>
    </div>
  );
}
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faList, faUtensils, faUsers, faMoneyBillWave, faChartBar, faCog } from "@fortawesome/free-solid-svg-icons";