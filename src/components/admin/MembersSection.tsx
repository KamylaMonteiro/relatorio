import React, { useState, useEffect } from 'react';
import { Plus, User, Trash2, Eye, Users, Tag } from 'lucide-react';
import { Member } from '../../utils/dataManager';

interface MembersSectionProps {
  members: Member[];
  onNewMember: (category?: string) => void;
  onViewMembers: (category: 'anciao' | 'servo' | 'publicador' | string) => void;
}

interface CategoryConfig {
  key: string;
  title: string;
  count: number;
  isDefault: boolean;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

const DEFAULT_CATEGORY_STYLES: Record<string, { gradient: string; iconBg: string; iconColor: string }> = {
  anciao:    { gradient: 'from-indigo-500 to-indigo-600',  iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600'  },
  servo:     { gradient: 'from-sky-500 to-sky-600',        iconBg: 'bg-sky-50',      iconColor: 'text-sky-600'     },
  pioneiro:  { gradient: 'from-emerald-500 to-emerald-600',iconBg: 'bg-emerald-50',  iconColor: 'text-emerald-600' },
  publicador:{ gradient: 'from-amber-500 to-amber-600',    iconBg: 'bg-amber-50',    iconColor: 'text-amber-600'   },
};
const CUSTOM_STYLE = { gradient: 'from-violet-500 to-violet-600', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' };

const MembersSection: React.FC<MembersSectionProps> = ({ members, onNewMember, onViewMembers }) => {
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  const getMembersByCategory = (category: string) =>
    members.filter((m) => m.category.toLowerCase().includes(category.toLowerCase()));

  const isDefaultCategory = (category: string) =>
    ['anciao', 'servo', 'publicador', 'pioneiro'].includes(category.toLowerCase());

  const defaultCategories: CategoryConfig[] = [
    { key: 'anciao',     title: 'Ancião',            count: getMembersByCategory('anciao').length,     isDefault: true, ...DEFAULT_CATEGORY_STYLES['anciao']     },
    { key: 'servo',      title: 'Servo Ministerial',  count: getMembersByCategory('servo').length,      isDefault: true, ...DEFAULT_CATEGORY_STYLES['servo']      },
    { key: 'pioneiro',   title: 'Pioneiro',            count: getMembersByCategory('pioneiro').length,   isDefault: true, ...DEFAULT_CATEGORY_STYLES['pioneiro']   },
    { key: 'publicador', title: 'Publicador',          count: getMembersByCategory('publicador').length, isDefault: true, ...DEFAULT_CATEGORY_STYLES['publicador'] },
  ];

  const allCategories: CategoryConfig[] = [
    ...defaultCategories,
    ...customCategories.map((key) => ({
      key,
      title: key,
      count: getMembersByCategory(key).length,
      isDefault: false,
      ...CUSTOM_STYLE,
    })),
  ];

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !allCategories.some((cat) => cat.key.toLowerCase() === trimmed.toLowerCase())) {
      setCustomCategories((prev) => [...prev, trimmed]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (isDefaultCategory(categoryToDelete)) return;
    if (window.confirm(`Excluir a categoria "${categoryToDelete}"?`))
      setCustomCategories((prev) => prev.filter((cat) => cat !== categoryToDelete));
  };

  const totalMembers = members.length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Membros</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
            <Users size={12} />
            {totalMembers} {totalMembers === 1 ? 'membro' : 'membros'} no total
          </span>
        </div>
      </div>

      {/* Add Category Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Tag size={12} /> Nova Categoria
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ex: Pioneiros Auxiliares..."
            className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={15} />
            Adicionar
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {allCategories.map((category) => (
          <div
            key={category.key}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
          >
            {/* Colored top bar */}
            <div className={`h-1.5 bg-gradient-to-r ${category.gradient}`} />

            <div className="p-5 flex flex-col flex-1">
              {/* Header row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${category.iconBg} flex items-center justify-center ${category.iconColor}`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{category.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {category.count} {category.count === 1 ? 'membro' : 'membros'}
                    </p>
                  </div>
                </div>
                {!category.isDefault && (
                  <button
                    onClick={() => handleDeleteCategory(category.key)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Excluir categoria"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Count badge */}
              <div className={`rounded-xl px-3 py-2 mb-4 bg-gradient-to-r ${category.gradient}`}>
                <p className="text-white/80 text-xs font-medium">Total cadastrado</p>
                <p className="text-white text-2xl font-bold leading-tight">{category.count}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => onViewMembers(category.key)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors uppercase tracking-wider"
                >
                  <Eye size={13} />
                  Visualizar Lista
                </button>
                <button
                  onClick={() => onNewMember(category.key)}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${category.gradient} text-white px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 uppercase tracking-wider shadow-sm`}
                >
                  <Plus size={13} />
                  Novo Cadastro
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersSection;