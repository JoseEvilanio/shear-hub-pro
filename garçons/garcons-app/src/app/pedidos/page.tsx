"use client";
import React, { useState } from "react";

const tabs = [
  "Todos",
  "Pendentes",
  "Em Preparo",
  "Prontos",
  "Concluídos",
  "Cancelados"
];

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="min-h-screen bg-[#F7F7F7] p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-700">Pedidos</h1>
          <p className="text-gray-400">Gerencie os pedidos do seu estabelecimento</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#FF6A00] hover:bg-[#e65c00] text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            <span className="text-xl">+</span> Novo Pedido
          </button>
          <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-gray-100 transition-colors">
            Filtros <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Lista de Pedidos</h2>
        <div className="flex justify-start gap-4 mb-4 flex-wrap">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-xl font-medium text-base transition-colors ${activeTab === idx ? 'bg-[#FFF3E6] text-[#FF6A00] font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Buscar por cliente..." className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6A00] outline-none" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500">
                <th className="py-2">Pedido</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Total</th>
                <th>Pagamento</th>
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
      </div>
    </div>
  );
}