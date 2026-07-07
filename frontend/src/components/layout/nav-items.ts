import { ClipboardList, CalendarClock, Users, Truck, Package, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/sales-orders", label: "Ordens de Venda", hint: "Gestão e monitoramento", icon: ClipboardList },
  { href: "/scheduling", label: "Agendamento", hint: "Controle de entregas", icon: CalendarClock },
  { href: "/customers", label: "Clientes", hint: "Cadastros", icon: Users },
  { href: "/transport-types", label: "Tipos de Transporte", hint: "Cadastros", icon: Truck },
  { href: "/items", label: "Itens", hint: "Catálogo", icon: Package },
];
