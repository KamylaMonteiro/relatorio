import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Clock, Users, Map, Loader2 } from 'lucide-react';
import DataManager, { Member, FieldGroup, Territory, GroupMember } from '../../utils/dataManager';

interface FieldGroupsSectionProps {
  members: Member[];
  onDataChange: () => void;
}

const FieldGroupsSection: React.FC<FieldGroupsSectionProps> = ({ members, onDataChange }) => {
  const dataManager = DataManager.getInstance();
  const [activeTab, setActiveTab] = useState('grupos');
  const [groups, setGroups] = useState<FieldGroup[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  
  // Estados para modais
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddTerritoryModal, setShowAddTerritoryModal] = useState(false);
  const [showBulkAddMemberModal, setShowBulkAddMemberModal] = useState(false);
  
  // Estados para formulários
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [territory, setTerritory] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  
  // Estados para territórios
  const [territoryForm, setTerritoryForm] = useState({
    id: '',
    nome: '',
    responsavel: '',
    status: 'Disponível' as 'Disponível' | 'Em andamento' | 'Trabalhado',
    ultimaVisita: '',
    proximaVisita: '',
    descricao: '',
    observacoes: ''
  });

  // Estados para membros dos grupos
  const predefinedGroups = ['Salão Do Reino', 'Jardim Tropical Ville', 'Despraiado', 'Jardim Novo Colorado'];
  const [bulkMemberInput, setBulkMemberInput] = useState('');
  const [bulkGroupAssignment, setBulkGroupAssignment] = useState<string[]>([]);
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);

  const [editingGroup, setEditingGroup] = useState<FieldGroup | null>(null);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado simplificado para controlar o carregamento do salvamento
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [dataManager]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dataManager.loadAllDataFromCloud();
      
      const [loadedGroups, loadedTerritories, loadedGroupMembers] = await Promise.all([
        dataManager.getFieldGroups(),
        dataManager.getTerritories(),
        dataManager.getGroupMembers()
      ]);
      
      console.log('Membros carregados do DataManager por grupo:', loadedGroupMembers.reduce((acc, member) => {
        acc[member.groupName] = acc[member.groupName] || [];
        acc[member.groupName].push(member.name);
        return acc;
      }, {} as Record<string, string[]>)); // Log detalhado por grupo
      setGroups(loadedGroups || []);
      setTerritories(loadedTerritories || []);
      setGroupMembers(loadedGroupMembers || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erro ao carregar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGroupForm = () => {
    setNewGroupName('');
    setSelectedMembers([]);
    setTerritory('');
    setMeetingTime('');
    setMeetingLocation('');
    setEditingGroup(null);
  };

  const resetTerritoryForm = () => {
    setTerritoryForm({
      id: '',
      nome: '',
      responsavel: '',
      status: 'Disponível',
      ultimaVisita: '',
      proximaVisita: '',
      descricao: '',
      observacoes: ''
    });
    setEditingTerritory(null);
  };

  const resetBulkMemberForm = () => {
    setBulkMemberInput('');
    setBulkGroupAssignment([]);
    setEditingGroupName(null);
  };

  const generateUniqueId = (prefix: string = ''): string => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const extraRandom = Math.random().toString(36).substring(2, 9);
    return `${prefix}${timestamp}-${randomPart}-${extraRandom}`;
  };

  const checkIfMemberIdExists = (id: string): boolean => {
    return groupMembers.some(member => member.id === id);
  };

  // Funções para grupos de campo
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Por favor, preencha o nome do grupo');
      return;
    }
    const newGroup: FieldGroup = {
      id: generateUniqueId('group_'),
      name: newGroupName.trim(),
      memberIds: [],
      territory: territory.trim() || undefined,
      meetingTime: meetingTime.trim() || undefined,
      meetingLocation: meetingLocation.trim() || undefined,
    };
    try {
      await dataManager.addFieldGroup(newGroup);
      await loadData();
      onDataChange();
      setShowAddGroupModal(false);
      resetGroupForm();
    } catch (error) {
      console.error('Error adding field group:', error);
      alert('Erro ao adicionar grupo de campo');
    }
  };

  const handleEditGroup = (group: FieldGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setSelectedMembers(group.memberIds);
    setTerritory(group.territory || '');
    setMeetingTime(group.meetingTime || '');
    setMeetingLocation(group.meetingLocation || '');
    setShowAddGroupModal(true);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !newGroupName.trim()) {
      alert('Por favor, preencha o nome do grupo');
      return;
    }
    const updatedGroup: FieldGroup = {
      ...editingGroup,
      name: newGroupName.trim(),
      memberIds: [],
      territory: territory.trim() || undefined,
      meetingTime: meetingTime.trim() || undefined,
      meetingLocation: meetingLocation.trim() || undefined,
    };
    try {
      await dataManager.updateFieldGroup(updatedGroup);
      await loadData();
      onDataChange();
      setShowAddGroupModal(false);
      resetGroupForm();
    } catch (error) {
      console.error('Error updating field group:', error);
      alert('Erro ao atualizar grupo de campo');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este grupo de campo?')) {
      try {
        await dataManager.deleteFieldGroup(id);
        await loadData();
        onDataChange();
      } catch (error) {
        console.error('Error deleting field group:', error);
        alert('Erro ao excluir grupo de campo');
      }
    }
  };

  // Funções para territórios
  const checkIfTerritoryIdExists = (id: string, excludeId?: string): boolean => {
    return territories.some(t => t.id === id && t.id !== excludeId);
  };

  const generateTerritoryId = (): string => generateUniqueId('territory_');

  const handleAddTerritory = async () => {
    if (!territoryForm.nome.trim()) {
      alert('Por favor, preencha o nome do território');
      return;
    }
    const finalId = territoryForm.id.trim() || generateTerritoryId();
    if (territoryForm.id.trim() && checkIfTerritoryIdExists(finalId)) {
      alert('Este ID de território já existe. Por favor, escolha um ID diferente ou deixe vazio para gerar automaticamente.');
      return;
    }
    const newTerritory: Territory = { ...territoryForm, id: finalId };
    try {
      await dataManager.addTerritory(newTerritory);
      await loadData();
      setShowAddTerritoryModal(false);
      resetTerritoryForm();
    } catch (error) {
      console.error('Error adding territory:', error);
      alert('Erro ao adicionar território');
    }
  };

  const handleEditTerritory = (territory: Territory) => {
    setEditingTerritory(territory);
    setTerritoryForm(territory);
    setShowAddTerritoryModal(true);
  };

  const handleUpdateTerritory = async () => {
    if (!editingTerritory || !territoryForm.nome.trim()) {
      alert('Por favor, preencha o nome do território');
      return;
    }
    const finalId = territoryForm.id.trim() || editingTerritory.id;
    if (finalId !== editingTerritory.id && checkIfTerritoryIdExists(finalId)) {
      alert('Este ID de território já existe. Por favor, escolha um ID diferente.');
      return;
    }
    const updatedTerritory: Territory = { ...territoryForm, id: finalId };
    try {
      if (finalId !== editingTerritory.id) {
        await dataManager.deleteTerritory(editingTerritory.id);
        await dataManager.addTerritory(updatedTerritory);
      } else {
        await dataManager.updateTerritory(updatedTerritory);
      }
      await loadData();
      setShowAddTerritoryModal(false);
      resetTerritoryForm();
    } catch (error) {
      console.error('Error updating territory:', error);
      alert('Erro ao atualizar território');
    }
  };

  const handleDeleteTerritory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este território?')) {
      try {
        await dataManager.deleteTerritory(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting territory:', error);
        alert('Erro ao excluir território');
      }
    }
  };

  const handleEditGroupMembers = (groupName: string) => {
    const membersOfGroup = groupMembers
      .filter(member => member.groupName === groupName && member.isActive)
      .map(member => member.name)
      .join('\n');
    
    setEditingGroupName(groupName);
    setBulkMemberInput(membersOfGroup);
    setBulkGroupAssignment([groupName]);
    setShowBulkAddMemberModal(true);
  };

  const handleBulkAddMembers = async () => {
    const names = bulkMemberInput.split('\n').map(name => name.trim()).filter(name => name);
    const targetGroupName = bulkGroupAssignment[0];

    if (!targetGroupName) {
      alert('Por favor, selecione um grupo.');
      return;
    }

    setIsSaving(true);

    try {
      // Remove todos os membros antigos apenas do grupo alvo
      const oldMembers = groupMembers.filter(m => m.groupName === targetGroupName);
      for (const member of oldMembers) {
        await dataManager.deleteGroupMember(member.id);
      }

      // Adiciona os novos membros apenas para o grupo alvo, preservando a ordem
      if (names.length > 0) {
        const newMembers: GroupMember[] = [];
        for (let i = 0; i < names.length; i++) {
          let uniqueId: string;
          let attempts = 0;
          const maxAttempts = 10;
          
          do {
            uniqueId = generateUniqueId('member_');
            attempts++;
          } while (checkIfMemberIdExists(uniqueId) && attempts < maxAttempts);
          
          if (attempts >= maxAttempts) {
            console.error('Não foi possível gerar um ID único após várias tentativas');
            alert('Erro interno: não foi possível gerar ID único. Tente novamente.');
            setIsSaving(false);
            return;
          }

          const newMember: GroupMember = {
            id: uniqueId,
            name: names[i],
            groupName: targetGroupName,
            role: '',
            isActive: true
          };
          newMembers.push(newMember);
          await dataManager.addGroupMember(newMember);
        }
        // Atualiza o estado local apenas para o grupo afetado
        setGroupMembers(prev => [
          ...prev.filter(m => m.groupName !== targetGroupName),
          ...newMembers
        ]);
      }

      await loadData();
      onDataChange();

      setIsSaving(false);
      setShowBulkAddMemberModal(false);
      resetBulkMemberForm();
    } catch (error) {
      console.error('Error processing bulk members:', error);
      alert('Erro ao processar a lista de membros. Verifique se não há nomes duplicados.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
      </div>

      {/* Tabs */}
      <div className="bg-white border-b mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('grupos')}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'grupos'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin size={16} className="inline mr-2" />
            Grupos de Campo
          </button>
          <button
            onClick={() => setActiveTab('territorios')}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'territorios'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Map size={16} className="inline mr-2" />
            Territórios
          </button>
          <button
            onClick={() => setActiveTab('lista-grupos')}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'lista-grupos'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Membros dos Grupos
          </button>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'grupos' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Grupos de Campo</h3>
            <button
              onClick={() => {
                resetGroupForm();
                setShowAddGroupModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Novo Grupo
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-green-800">{group.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditGroup(group)} className="text-blue-600 hover:text-blue-800 p-1 rounded" title="Editar grupo"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteGroup(group.id)} className="text-red-600 hover:text-red-800 p-1 rounded" title="Excluir grupo"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-3">
                  {group.territory && <div className="flex items-center gap-2 text-gray-700"><MapPin size={16} className="text-green-600" /><span className="text-sm"><strong>Território:</strong> {group.territory}</span></div>}
                  {group.meetingTime && <div className="flex items-center gap-2 text-gray-700"><Clock size={16} className="text-green-600" /><span className="text-sm"><strong>Horário:</strong> {group.meetingTime}</span></div>}
                  {group.meetingLocation && <div className="flex items-center gap-2 text-gray-700"><MapPin size={16} className="text-green-600" /><span className="text-sm"><strong>Local:</strong> {group.meetingLocation}</span></div>}
                </div>
              </div>
            ))}
          </div>
          {groups.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhum grupo de campo encontrado</h3>
            </div>
          )}
        </div>
      )}

      {activeTab === 'territorios' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Territórios</h3>
            <button onClick={() => { resetTerritoryForm(); setShowAddTerritoryModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors"><Plus size={16} />Novo Território</button>
          </div>
          <div className="grid gap-4">
            {territories.map((territory) => (
              <div key={territory.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{territory.nome}</h3>
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded text-white">{territory.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTerritory(territory)} className="text-white hover:text-blue-200 p-1 rounded" title="Editar território"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteTerritory(territory.id)} className="text-white hover:text-red-200 p-1 rounded" title="Excluir território"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><span className="text-sm font-medium text-gray-600">Responsável:</span><p className="text-sm font-semibold text-gray-800">{territory.responsavel || '--'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Status:</span><p className={`text-sm font-semibold ${territory.status === 'Disponível' ? 'text-green-600' : territory.status === 'Em andamento' ? 'text-yellow-600' : 'text-blue-600'}`}>{territory.status}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Última Visita:</span><p className="text-sm text-gray-800">{territory.ultimaVisita || '--'}</p></div>
                  </div>
                  {territory.proximaVisita && <div className="mt-3 pt-3 border-t"><span className="text-sm font-medium text-gray-600">Próxima Visita Prevista:</span><p className="text-sm text-blue-600 font-semibold">{territory.proximaVisita}</p></div>}
                  {territory.descricao && <div className="mt-3 pt-3 border-t"><span className="text-sm font-medium text-gray-600">Descrição:</span><p className="text-sm text-gray-700">{territory.descricao}</p></div>}
                </div>
              </div>
            ))}
          </div>
          {territories.length === 0 && (
            <div className="text-center py-12">
              <Map size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhum território encontrado</h3>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lista-grupos' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Membros dos Grupos</h3>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {predefinedGroups.map((groupName) => {
              const currentMembers = groupMembers.filter(member => member.groupName === groupName && member.isActive);
              return (
                <div key={groupName} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-800">{groupName}</h4>
                    <button
                      onClick={() => handleEditGroupMembers(groupName)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title={`Editar membros de ${groupName}`}
                      disabled={isSaving}
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 flex-grow">
                    {currentMembers.length > 0 ? (
                      currentMembers.map((member) => (
                        <li key={member.id} className="text-sm text-gray-700">
                          {member.name} {member.role && `(${member.role})`}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 list-none"></li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800">{editingGroup ? 'Editar Grupo de Campo' : 'Novo Grupo de Campo'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Grupo *</label>
                <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Território</label>
                <input type="text" value={territory} onChange={(e) => setTerritory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                  <input type="text" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local de Encontro</label>
                  <input type="text" value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={editingGroup ? handleUpdateGroup : handleAddGroup} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">{editingGroup ? 'Atualizar' : 'Criar'} Grupo</button>
              <button onClick={() => { setShowAddGroupModal(false); resetGroupForm(); }} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showAddTerritoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-800">{editingTerritory ? 'Editar Território' : 'Novo Território'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Território (opcional)</label>
                <input type="text" value={territoryForm.id} onChange={(e) => setTerritoryForm({...territoryForm, id: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Território *</label>
                <input type="text" value={territoryForm.nome} onChange={(e) => setTerritoryForm({...territoryForm, nome: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <input type="text" value={territoryForm.responsavel} onChange={(e) => setTerritoryForm({...territoryForm, responsavel: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={territoryForm.status} onChange={(e) => setTerritoryForm({...territoryForm, status: e.target.value as any})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Disponível">Disponível</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Trabalhado">Trabalhado</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última Visita</label>
                  <input type="text" value={territoryForm.ultimaVisita} onChange={(e) => setTerritoryForm({...territoryForm, ultimaVisita: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="dd/mm/aaaa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Visita</label>
                  <input type="text" value={territoryForm.proximaVisita} onChange={(e) => setTerritoryForm({...territoryForm, proximaVisita: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="dd/mm/aaaa" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={territoryForm.observacoes} onChange={(e) => setTerritoryForm({...territoryForm, observacoes: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={2} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={editingTerritory ? handleUpdateTerritory : handleAddTerritory} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">{editingTerritory ? 'Atualizar' : 'Criar'} Território</button>
              <button onClick={() => { setShowAddTerritoryModal(false); resetTerritoryForm(); }} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showBulkAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingGroupName ? `Editar Membros do Grupo: ${editingGroupName}` : 'Adicionar Membros em Massa'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomes (um por linha)</label>
                <textarea
                  value={bulkMemberInput}
                  onChange={(e) => setBulkMemberInput(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={10}
                />
              </div>
              {!editingGroupName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atribuir aos Grupos</label>
                  <select
                    multiple
                    value={bulkGroupAssignment}
                    onChange={(e) =>
                      setBulkGroupAssignment(
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    size={predefinedGroups.length > 5 ? 5 : predefinedGroups.length}
                    disabled={isSaving}
                  >
                    {predefinedGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleBulkAddMembers}
                disabled={isSaving}
                className={`flex-1 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                  isSaving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />}
                {isSaving 
                  ? 'Salvando...' 
                  : (editingGroupName ? 'Salvar Alterações' : 'Adicionar Membros')
                }
              </button>
              <button
                onClick={() => { setShowBulkAddMemberModal(false); resetBulkMemberForm(); }}
                disabled={isSaving}
                className={`flex-1 py-2 rounded transition-colors ${
                  isSaving 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldGroupsSection;