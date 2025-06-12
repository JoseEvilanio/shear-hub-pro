"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faList, faUtensils, faUsers, faMoneyBillWave, faChartBar, faCog } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SidebarButton({ href, icon, children, active }: { href: string; icon: React.ReactNode; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-8 py-3 text-base font-medium rounded-lg transition-colors ${active ? 'bg-[#FFF3E6] text-[#FF6A00]' : 'text-gray-700 hover:bg-gray-100'}`}>
      {icon}{children}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between fixed h-full z-10">
      <div>
        <div className="px-8 py-6 text-2xl font-bold text-[#FF6A00]">Garçon</div>
        <nav className="flex flex-col gap-1 mt-4">
          <SidebarButton href="/dashboard" icon={<FontAwesomeIcon icon={faHouse} />} active={pathname === "/dashboard"}>Dashboard</SidebarButton>
          <SidebarButton href="/pedidos" icon={<FontAwesomeIcon icon={faList} />} active={pathname === "/pedidos"}>Pedidos</SidebarButton>
          <SidebarButton href="/cardapio" icon={<FontAwesomeIcon icon={faUtensils} />} active={pathname === "/cardapio"}>Cardápio</SidebarButton>
          <SidebarButton href="/mesas" icon={<FontAwesomeIcon icon={faUsers} />} active={pathname === "/mesas"}>Mesas</SidebarButton>
          <SidebarButton href="/financeiro" icon={<FontAwesomeIcon icon={faMoneyBillWave} />} active={pathname === "/financeiro"}>Financeiro</SidebarButton>
          <SidebarButton href="/relatorios" icon={<FontAwesomeIcon icon={faChartBar} />} active={pathname === "/relatorios"}>Relatórios</SidebarButton>
          <SidebarButton href="/configuracoes" icon={<FontAwesomeIcon icon={faCog} />} active={pathname === "/configuracoes"}>Configurações</SidebarButton>
        </nav>
      </div>
      <div className="px-8 py-6 border-t border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">JO</div>
        <div>
          <div className="font-semibold text-gray-800">Jose</div>
          <div className="text-xs text-gray-500">Funcionário</div>
        </div>
      </div>
    </aside>
  );
}
// legacyBehavior removed and Link updated to new API