import { FC } from 'react';
import { Calendar, Users, MapPin, FileText, ClipboardList } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: 'meetings',    label: 'Reuniões',        icon: Calendar,       color: 'text-indigo-500' },
  { id: 'members',     label: 'Membros',          icon: Users,          color: 'text-sky-500'    },
  { id: 'fieldGroups', label: 'Grupos de Campo',  icon: MapPin,         color: 'text-emerald-500'},
  { id: 'designacoes', label: 'Designações',      icon: ClipboardList,  color: 'text-violet-500' },
  { id: 'relatorios',  label: 'Relatórios',       icon: FileText,       color: 'text-amber-500'  },
];

const Sidebar: FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="w-full md:w-56 bg-white border-b md:border-r border-gray-100 flex-shrink-0 z-10 sticky top-0">
      <nav className="p-2 md:p-3 overflow-x-auto scrollbar-hide">
        <p className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-3 mt-1">
          Menu
        </p>
        <ul className="flex flex-row md:flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id} className="flex-shrink-0">
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2 md:py-2.5 rounded-xl flex items-center gap-2 md:gap-3 transition-all duration-150 group whitespace-nowrap ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon
                    size={16}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-green-600' : `${item.color} opacity-70 group-hover:opacity-100`
                    }`}
                  />
                  <span className="text-xs md:text-sm leading-none">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;