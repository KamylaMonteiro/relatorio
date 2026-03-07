import React from 'react';
import { Calendar, Users, MapPin } from 'lucide-react';
import { Users as UsersIcon } from 'lucide-react'; // Usando um ícone diferente para Designações

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onLogout }) => {
  const menuItems = [
    { id: 'meetings', label: 'Reuniões', icon: Calendar },
    { id: 'members', label: 'Membros', icon: Users },
    { id: 'fieldGroups', label: 'Grupos de Campo', icon: MapPin },
    { id: 'designacoes', label: 'Designações', icon: UsersIcon } // Nova aba
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
                    activeSection === item.id 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
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