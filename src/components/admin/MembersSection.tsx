import React, { useState, useEffect } from 'react';
import { Plus, User, Trash2 } from 'lucide-react';
import { Member } from '../../utils/dataManager';

interface MembersSectionProps {
  members: Member[];
  onNewMember: (category?: string) => void;
  onViewMembers: (category: 'anciao' | 'servo' | 'publicador' | string) => void;
}

const MembersSection: React.FC<MembersSectionProps> = ({
  members,
  onNewMember,
  onViewMembers
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save categories to localStorage whenever customCategories changes
  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  const getMembersByCategory = (category: 'anciao' | 'servo' | 'publicador' | string) => {
    return members.filter(m => m.category === category);
  };

  const defaultCategories = [
    { key: 'anciao' as const, title: 'Ancião', count: getMembersByCategory('anciao').length },
    { key: 'servo' as const, title: 'Servo Ministerial', count: getMembersByCategory('servo').length },
    { key: 'publicador' as const, title: 'Publicador', count: getMembersByCategory('publicador').length }
  ];

  const allCategories = [
    ...defaultCategories,
    ...customCategories.map(key => ({
      key,
      title: key,
      count: getMembersByCategory(key).length
    }))
  ];

  const handleAddCategory = () => {
    if (newCategory.trim() && !allCategories.some(cat => cat.key === newCategory.trim())) {
      setCustomCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    // Verificar se é uma categoria padrão (não pode ser excluída)
    const protectedCategories = ['anciao', 'servo', 'publicador'];
    
    if (protectedCategories.includes(categoryToDelete)) {
      return; // Não permite excluir categorias padrão
    }

    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete}"?`)) {
      setCustomCategories(prev => prev.filter(cat => cat !== categoryToDelete));
    }
  };

  // Verificar se é uma categoria padrão
  const isDefaultCategory = (category: string) => {
    return ['anciao', 'servo', 'publicador'].includes(category);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Membros</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">

        {/* Add New Category Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria (ex: Pioneiros)"
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allCategories.map((category) => (
            <div 
              key={category.key} 
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User size={16} />
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600">{category.count} membros</p>
                </div>
                {/* Só mostrar botão de excluir para categorias personalizadas */}
                {!isDefaultCategory(category.key) && (
                  <button
                    onClick={() => handleDeleteCategory(category.key)}
                    className="text-red-600 hover:text-red-900 ml-2"
                    title="Excluir categoria"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onViewMembers(category.key)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm"
                >
                  Visualizar
                </button>
                <button
                  onClick={() => onNewMember(category.key)}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 flex items-center gap-1 text-sm"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersSection;