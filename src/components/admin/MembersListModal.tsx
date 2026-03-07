import React from 'react';
import { X, Edit, Trash2, User, FileText } from 'lucide-react';
import { Member } from '../../utils/dataManager';

interface MembersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  category: 'anciao' | 'servo' | 'publicador' | string;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
}

const MembersListModal: React.FC<MembersListModalProps> = ({
  isOpen,
  onClose,
  members,
  category,
  onEditMember,
  onDeleteMember
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const getCategoryTitle = (category: 'anciao' | 'servo' | 'publicador' | string) => {
    switch (category) {
      case 'anciao': return 'Ancião';
      case 'servo': return 'Servo Ministerial';
      case 'publicador': return 'Publicador';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const handleDeleteMember = (member: Member) => {
    onDeleteMember(member.id);
  };

  const categoryMembers = members.filter(m => m.category === category);
  const filteredMembers = categoryMembers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas para publicadores
  const activePublishers = categoryMembers.filter(m => m.status === 'ativo').length;
  const inactivePublishers = categoryMembers.filter(m => m.status === 'inativo').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-60 bg-white text-red-500 hover:text-red-700 rounded-full p-2 shadow-lg hover:bg-red-50 transition-all duration-200 border-2 border-red-200 hover:border-red-300"
        title="Fechar"
      >
        <X size={24} />
      </button>

      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">{getCategoryTitle(category)}</h3>
            {category === 'publicador' && (
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-600 font-medium">
                  Ativos: {activePublishers}
                </span>
                <span className="text-red-600 font-medium">
                  Inativos: {inactivePublishers}
                </span>
                <span className="text-gray-600 font-medium">
                  Total: {categoryMembers.length}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome..."
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{member.name}</h4>
                    {member.status && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        member.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </div>
                  
                  {member.grupo && (
                    <p className="text-sm text-gray-600 mb-1">🏠 Grupo: {member.grupo}</p>
                  )}
                  
                  {member.phone && (
                    <p className="text-sm text-gray-600">📞 {member.phone}</p>
                  )}
                  
                  {member.email && (
                    <p className="text-sm text-gray-600">✉️ {member.email}</p>
                  )}
                  
                  {member.address && (
                    <p className="text-sm text-gray-600">🏠 {member.address}</p>
                  )}
                  
                  {member.responsibilities && member.responsibilities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Responsabilidades:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.responsibilities.map((resp, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {resp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.notes && member.notes.trim() && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <FileText size={12} />
                        Anotações:
                      </p>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 border-l-2 border-blue-300">
                        {member.notes}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onEditMember(member)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Editar membro"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Excluir membro"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User size={48} className="mx-auto mb-2 opacity-50" />
            <p>Nenhum membro encontrado nesta categoria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersListModal;