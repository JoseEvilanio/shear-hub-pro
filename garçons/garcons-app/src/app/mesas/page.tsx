"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faSearch, faChair, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const filterOptions = [
  { label: "Disponíveis", value: "disponiveis" },
  { label: "Ocupadas", value: "ocupadas" },
  { label: "Reservadas", value: "reservadas" },
  { label: "Capacidade: Menor para Maior", value: "capacidade-asc" },
  { label: "Capacidade: Maior para Menor", value: "capacidade-desc" },
];

const mesasMock = [
  { numero: 1, status: "disponivel", capacidade: 4 },
  { numero: 2, status: "ocupada", capacidade: 2 },
  { numero: 3, status: "reservada", capacidade: 6 },
  { numero: 4, status: "disponivel", capacidade: 2 },
  { numero: 5, status: "ocupada", capacidade: 4 },
];

export default function MesasPage() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filteredMesas = mesasMock.filter((mesa) => {
    if (search && !mesa.numero.toString().includes(search)) return false;
    if (selectedFilter === "disponiveis" && mesa.status !== "disponivel") return false;
    if (selectedFilter === "ocupadas" && mesa.status !== "ocupada") return false;
    if (selectedFilter === "reservadas" && mesa.status !== "reservada") return false;
    return true;
  }).sort((a, b) => {
    if (selectedFilter === "capacidade-asc") return a.capacidade - b.capacidade;
    if (selectedFilter === "capacidade-desc") return b.capacidade - a.capacidade;
    return 0;
  });

  return (
    <div className="p-10 bg-[#F7F7F7] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mesas</h1>
          <p className="text-gray-400">Gerencie as mesas do seu estabelecimento</p>
        </div>
        <button className="bg-[#FF6A00] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
          <FontAwesomeIcon icon={faChair} /> Adicionar Mesa
        </button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold">Lista de Mesas</h2>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar mesa..."
                className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6A00] outline-none w-48"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                onClick={() => setFilterOpen(v => !v)}
              >
                Filtros <FontAwesomeIcon icon={faFilter} />
                <span className="ml-1">&#9662;</span>
              </button>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {filterOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedFilter === opt.value ? 'bg-gray-100 font-semibold' : ''}`}
                      onClick={() => { setSelectedFilter(opt.value); setFilterOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    className="w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-50"
                    onClick={() => { setSelectedFilter(null); setFilterOpen(false); }}
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMesas.map(mesa => (
            <div key={mesa.numero} className="bg-gray-50 rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faChair} className="text-[#FF6A00] text-xl" />
                <span className="font-bold text-lg">Mesa {mesa.numero}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-gray-500 text-sm">Capacidade: {mesa.capacidade}</span>
                {mesa.status === "disponivel" && <span className="flex items-center gap-1 text-green-600 text-sm"><FontAwesomeIcon icon={faCheckCircle} /> Disponível</span>}
                {mesa.status === "ocupada" && <span className="flex items-center gap-1 text-red-500 text-sm"><FontAwesomeIcon icon={faTimesCircle} /> Ocupada</span>}
                {mesa.status === "reservada" && <span className="flex items-center gap-1 text-yellow-500 text-sm"><FontAwesomeIcon icon={faChair} /> Reservada</span>}
              </div>
            </div>
          ))}
          {filteredMesas.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-10">Nenhuma mesa encontrada.</div>
          )}
        </div>
      </div>
    </div>
  );
}