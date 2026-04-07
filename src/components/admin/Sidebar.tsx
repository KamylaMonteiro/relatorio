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
    <aside className="w-full md:w-56 bg-white border-r border-gray-100 flex-shrink-0">
      <nav className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-3 mt-1">
          Menu
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 group ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  {/* Active indicator bar */}
                  <span className={`w-0.5 h-4 rounded-full transition-all duration-200 flex-shrink-0 ${
                    isActive ? 'bg-green-500' : 'bg-transparent group-hover:bg-gray-300'
                  }`} />
                  <Icon
                    size={16}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-green-600' : `${item.color} opacity-70 group-hover:opacity-100`
                    }`}
                  />
                  <span className="text-sm leading-none">{item.label}</span>
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