"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faChevronDown, faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const initialItems = [
  { id: 1, name: "fdsafds", description: "efsf", price: 20, available: true, image: null },
  { id: 2, name: "fesfds", description: "rgrg", price: 10, available: true, image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg" },
];

const filterOptions = [
  { label: "Disponíveis", value: "disponiveis" },
  { label: "Indisponíveis", value: "indisponiveis" },
  { label: "Preço: Menor para Maior", value: "preco-asc" },
  { label: "Preço: Maior para Menor", value: "preco-desc" },
  { label: "Mais vendidos", value: "mais-vendidos" },
  { label: "Menos vendidos", value: "menos-vendidos" },
];

const categories = ["Todos", "Lanches", "Sobremesas"];

export default function CardapioPage() {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", available: true, image: null });

  const filteredItems = items.filter(item => {
    // Skip category filtering since category property is not defined in item type
    if (selectedCategory !== "Todos") return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedFilter === "disponiveis" && !item.available) return false;
    if (selectedFilter === "indisponiveis" && item.available) return false;
    return true;
  }).sort((a, b) => {
    if (selectedFilter === "preco-asc") return a.price - b.price;
    if (selectedFilter === "preco-desc") return b.price - a.price;
    return 0;
  });

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setItems([
      ...items,
      { ...newItem, id: Date.now(), price: parseFloat(newItem.price), image: null }
    ]);
    setModalOpen(false);
    setNewItem({ name: "", description: "", price: "", available: true, image: null });
  }

  function closeModal() {
    setModalOpen(false);
  }

  return (
    <div className="p-10 bg-[#F7F7F7] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-700">Cardápio</h1>
          <p className="text-gray-400">Gerencie os itens do cardápio do seu estabelecimento</p>
        </div>
        <button className="bg-[#FF6A00] hover:bg-[#e65c00] text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors" onClick={() => setModalOpen(true)}>
          <FontAwesomeIcon icon={faPlus} /> Adicionar Item
        </button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold">Itens do Cardápio</h2>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Buscar item..."
              className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#FF6A00] outline-none w-48"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="relative">
              <button
                className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-gray-100 transition-colors"
                onClick={() => setFilterOpen(v => !v)}
              >
                Filtros <FontAwesomeIcon icon={faChevronDown} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20">
                  {filterOptions.map(opt => (
                    <button
                      key={opt.value}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={() => { setSelectedFilter(opt.value); setFilterOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-xl font-medium text-base transition-colors ${selectedCategory === cat ? 'bg-[#FFF3E6] text-[#FF6A00] font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}            
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400">Sem imagem</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
                <button className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[#FF6A00] font-bold">R$ {item.price.toFixed(2)}</span>
                <label className="flex items-center gap-2 cursor-pointer opacity-100">
                  <span className="text-xs text-gray-500">Disponível</span>
                  <input type="checkbox" checked={item.available} readOnly className="hidden" />
                  <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out ${item.available ? 'bg-orange-400' : ''}`}></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors">×</button>
            <h2 className="text-2xl font-extrabold mb-1 text-gray-900">Adicionar Novo Item</h2>
            <p className="text-gray-700 mb-6 text-sm">Preencha as informações para adicionar um novo item ao cardápio.</p>
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Nome do Item</label>
                <input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Ex: Hambúrguer Especial" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-medium text-gray-900 placeholder-gray-400" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Descrição</label>
                <textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Descreva os ingredientes e características do item..." className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none font-medium text-gray-900 placeholder-gray-400" rows={3} required />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Preço (R$)</label>
                  <input type="number" min="0" step="0.01" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-medium text-gray-900 placeholder-gray-400" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Categoria</label>
                  <select className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-medium text-gray-900 placeholder-gray-400" required>
                    <option value="">Selecione a categoria</option>
                    <option value="Lanches">Lanches</option>
                    <option value="Sobremesas">Sobremesas</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">URL da Imagem (Opcional)</label>
                <input 
                  type="url" 
                  value={newItem.image || ''} 
                  onChange={e => setNewItem({ 
                    ...newItem, image: e.target.value || null
                  })} 
                  placeholder="https://exemplo.com/imagem.jpg" 
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition font-medium text-gray-900 placeholder-gray-400" 
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <label className="flex items-center cursor-pointer">
                  <span className="text-sm font-semibold mr-2 text-gray-700">Item Disponível</span>
                  <input type="checkbox" checked={newItem.available} onChange={e => setNewItem({ ...newItem, available: e.target.checked })} className="sr-only" />
                  <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out ${newItem.available ? 'bg-orange-400' : ''}`}>
                    <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${newItem.available ? 'translate-x-4' : ''}`}></span>
                  </span>
                </label>
                <span className="text-xs text-gray-700">O item será exibido como disponível no cardápio</span>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 font-semibold shadow-sm transition">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-orange-400 text-white font-bold shadow-md hover:bg-orange-500 transition">Adicionar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}