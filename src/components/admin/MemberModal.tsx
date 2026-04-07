import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { Member } from '../../utils/dataManager';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Partial<Member>) => void;
  editingMember?: Member | null;
  defaultCategory?: string;
}

const MemberModal: React.FC<MemberModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingMember,
  defaultCategory 
}) => {
  const [memberData, setMemberData] = useState<Partial<Member>>(() => {
    if (editingMember) {
      return editingMember;
    }
    return {
      name: '',
      category: defaultCategory || 'publicador',
      phone: '',
      email: '',
      address: '',
      grupo: undefined,
      status: defaultCategory === 'publicador' ? 'ativo' : undefined,
      responsibilities: [],
      notes: '',
      codigo_acesso: ''
    };
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [newResponsibility, setNewResponsibility] = useState('');

  // Load available categories (default + custom) from localStorage
  useEffect(() => {
    const defaultCategories = ['publicador', 'pioneiro', 'servo', 'anciao'];
    const savedCustomCategories = localStorage.getItem('customCategories');
    const savedHiddenCategories = localStorage.getItem('hiddenDefaultCategories');
    
    let customCategories: string[] = [];
    let hiddenCategories: string[] = [];
    
    if (savedCustomCategories) {
      customCategories = JSON.parse(savedCustomCategories);
    }
    
    if (savedHiddenCategories) {
      hiddenCategories = JSON.parse(savedHiddenCategories);
    }
    
    const visibleDefaultCategories = defaultCategories.filter(cat => !hiddenCategories.includes(cat));
    const allCategories = [...visibleDefaultCategories, ...customCategories];
    
    setAvailableCategories(allCategories);
  }, [isOpen]);

  // Reset form when modal opens/closes or editingMember changes
  useEffect(() => {
    if (editingMember) {
      setMemberData(editingMember);
    } else {
      setMemberData({
        name: '',
        category: defaultCategory || 'publicador',
        phone: '',
        email: '',
        address: '',
        grupo: undefined,
        status: defaultCategory === 'publicador' ? 'ativo' : undefined,
        responsibilities: [],
        notes: '',
        codigo_acesso: ''
      });
    }
  }, [editingMember, isOpen, defaultCategory]);

  const handleSave = () => {
    if (memberData.name?.trim()) {
      onSave(memberData);
      onClose();
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'anciao': return 'Ancião';
      case 'servo': return 'Servo Ministerial';
      case 'publicador': return 'Publicador';
      case 'pioneiro': return 'Pioneiro';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const isDefaultCategory = (category: string) => {
    return ['anciao', 'servo', 'publicador', 'pioneiro'].includes(category);
  };

  const shouldShowResponsibilities = () => {
    return memberData.category === 'anciao' || memberData.category === 'servo';
  };

  const shouldShowStatus = () => {
    return memberData.category === 'publicador';
  };

  const addResponsibility = () => {
    if (newResponsibility.trim() && memberData.responsibilities) {
      setMemberData({
        ...memberData,
        responsibilities: [...memberData.responsibilities, newResponsibility.trim()]
      });
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    if (memberData.responsibilities) {
      setMemberData({
        ...memberData,
        responsibilities: memberData.responsibilities.filter((_, i) => i !== index)
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          title="Fechar"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">
          {editingMember ? 'Editar Membro' : `Novo ${getCategoryDisplayName(memberData.category || 'publicador')}`}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={memberData.name || ''}
              onChange={(e) => setMemberData({...memberData, name: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={memberData.category}
              onChange={(e) => setMemberData({
                ...memberData, 
                category: e.target.value,
                status: e.target.value === 'publicador' ? 'ativo' : undefined,
                responsibilities: e.target.value === 'anciao' || e.target.value === 'servo' ? [] : undefined
              })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!(!editingMember && defaultCategory && isDefaultCategory(defaultCategory))}
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryDisplayName(cat)}
                </option>
              ))}
            </select>
            {!editingMember && defaultCategory && isDefaultCategory(defaultCategory) && (
              <p className="text-xs text-gray-500 mt-1">
                Categoria pré-selecionada para este novo membro
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <select
              value={memberData.grupo || ''}
              onChange={(e) => setMemberData({...memberData, grupo: e.target.value as any})}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um grupo</option>
              <option value="Salão Do Reino">Salão Do Reino</option>
              <option value="Jardim Tropical Ville">Jardim Tropical Ville</option>
              <option value="Despraiado">Despraiado</option>
              <option value="Jardim Novo Colorado">Jardim Novo Colorado</option>
            </select>
          </div>

          {shouldShowStatus() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={memberData.status || 'ativo'}
                onChange={(e) => setMemberData({...memberData, status: e.target.value as 'ativo' | 'inativo'})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={memberData.phone || ''}
              onChange={(e) => setMemberData({...memberData, phone: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={memberData.email || ''}
              onChange={(e) => setMemberData({...memberData, email: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={memberData.address || ''}
              onChange={(e) => setMemberData({...memberData, address: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Acesso (Relatório)</label>
            <input
              type="text"
              value={memberData.codigo_acesso || ''}
              onChange={(e) => setMemberData({...memberData, codigo_acesso: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 123456"
            />
          </div>

          {shouldShowResponsibilities() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsabilidades
              </label>
              
              {/* Lista de responsabilidades existentes */}
              {memberData.responsibilities && memberData.responsibilities.length > 0 && (
                <div className="mb-3 space-y-1">
                  {memberData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                      <span className="text-sm text-blue-800">{resp}</span>
                      <button
                        onClick={() => removeResponsibility(index)}
                        className="text-red-500 hover:text-red-700"
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar nova responsabilidade */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Áudio e Vídeo"
                  onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
                />
                <button
                  onClick={addResponsibility}
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center"
                  type="button"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anotações
            </label>
            <textarea
              value={memberData.notes || ''}
              onChange={(e) => setMemberData({...memberData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            disabled={!memberData.name?.trim()}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Salvar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;