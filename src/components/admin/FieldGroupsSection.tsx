import { useState, useEffect, FC } from 'react';
import {
  Plus, Edit, Trash2, MapPin, Clock, Users, Map,
  Loader2, X, RefreshCw, AlertCircle, Home
} from 'lucide-react';
import DataManager, { FieldGroup, Territory, GroupMember } from '../../utils/dataManager';

interface FieldGroupsSectionProps {
  onDataChange: () => void;
}



const InputField: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  accentClass?: string;
}> = ({ label, value, onChange, placeholder, required, accentClass = 'focus:ring-green-500 focus:border-green-500' }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all ${accentClass}`}
    />
  </div>
);

const FieldGroupsSection: FC<FieldGroupsSectionProps> = ({ onDataChange }) => {
  const dataManager = DataManager.getInstance();
  const [activeTab, setActiveTab] = useState('grupos');
  const [groups, setGroups] = useState<FieldGroup[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddTerritoryModal, setShowAddTerritoryModal] = useState(false);
  const [showBulkAddMemberModal, setShowBulkAddMemberModal] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [territory, setTerritory] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  const [territoryForm, setTerritoryForm] = useState({
    id: '',
    nome: '',
    responsavel: '',
    status: 'Disponível' as 'Disponível' | 'Em andamento' | 'Trabalhado',
    ultimaVisita: '',
    proximaVisita: '',
    descricao: '',
    observacoes: '',
  });

  const predefinedGroups = ['Salão Do Reino', 'Jardim Tropical Ville', 'Despraiado', 'Jardim Novo Colorado'];
  const [bulkMemberInput, setBulkMemberInput] = useState('');
  const [bulkGroupAssignment, setBulkGroupAssignment] = useState<string[]>([]);
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<FieldGroup | null>(null);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadData(); }, [dataManager]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dataManager.loadAllDataFromCloud();
      const [loadedGroups, loadedTerritories, loadedGroupMembers] = await Promise.all([
        dataManager.getFieldGroups(),
        dataManager.getTerritories(),
        dataManager.getGroupMembers(),
      ]);
      setGroups(loadedGroups || []);
      setTerritories(loadedTerritories || []);
      setGroupMembers(loadedGroupMembers || []);
    } catch {
      setError('Erro ao carregar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGroupForm = () => { setNewGroupName(''); setTerritory(''); setMeetingTime(''); setMeetingLocation(''); setEditingGroup(null); };
  const resetTerritoryForm = () => { setTerritoryForm({ id: '', nome: '', responsavel: '', status: 'Disponível', ultimaVisita: '', proximaVisita: '', descricao: '', observacoes: '' }); setEditingTerritory(null); };
  const resetBulkMemberForm = () => { setBulkMemberInput(''); setBulkGroupAssignment([]); setEditingGroupName(null); };

  const generateUniqueId = (prefix = '') => `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 9)}`;
  const checkIfMemberIdExists = (id: string) => groupMembers.some((m) => m.id === id);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) { alert('Por favor, preencha o nome do grupo'); return; }
    const newGroup: FieldGroup = { id: generateUniqueId('group_'), name: newGroupName.trim(), memberIds: [], territory: territory.trim() || undefined, meetingTime: meetingTime.trim() || undefined, meetingLocation: meetingLocation.trim() || undefined };
    try { await dataManager.addFieldGroup(newGroup); await loadData(); onDataChange(); setShowAddGroupModal(false); resetGroupForm(); }
    catch { alert('Erro ao adicionar grupo de campo'); }
  };

  const handleEditGroup = (group: FieldGroup) => { setEditingGroup(group); setNewGroupName(group.name); setTerritory(group.territory || ''); setMeetingTime(group.meetingTime || ''); setMeetingLocation(group.meetingLocation || ''); setShowAddGroupModal(true); };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !newGroupName.trim()) { alert('Por favor, preencha o nome do grupo'); return; }
    const updated: FieldGroup = { ...editingGroup, name: newGroupName.trim(), memberIds: [], territory: territory.trim() || undefined, meetingTime: meetingTime.trim() || undefined, meetingLocation: meetingLocation.trim() || undefined };
    try { await dataManager.updateFieldGroup(updated); await loadData(); onDataChange(); setShowAddGroupModal(false); resetGroupForm(); }
    catch { alert('Erro ao atualizar grupo de campo'); }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este grupo de campo?'))
      try { await dataManager.deleteFieldGroup(id); await loadData(); onDataChange(); }
      catch { alert('Erro ao excluir grupo de campo'); }
  };

  const checkIfTerritoryIdExists = (id: string, excludeId?: string) => territories.some((t) => t.id === id && t.id !== excludeId);

  const handleAddTerritory = async () => {
    if (!territoryForm.nome.trim()) { alert('Por favor, preencha o nome do território'); return; }
    const finalId = territoryForm.id.trim() || generateUniqueId('territory_');
    if (territoryForm.id.trim() && checkIfTerritoryIdExists(finalId)) { alert('Este ID já existe.'); return; }
    try { await dataManager.addTerritory({ ...territoryForm, id: finalId }); await loadData(); setShowAddTerritoryModal(false); resetTerritoryForm(); }
    catch { alert('Erro ao adicionar território'); }
  };

  const handleEditTerritory = (t: Territory) => { setEditingTerritory(t); setTerritoryForm({ id: t.id || '', nome: t.nome || '', responsavel: t.responsavel || '', status: t.status || 'Disponível', ultimaVisita: t.ultimaVisita || '', proximaVisita: t.proximaVisita || '', descricao: t.descricao || '', observacoes: t.observacoes || '' }); setShowAddTerritoryModal(true); };

  const handleUpdateTerritory = async () => {
    if (!editingTerritory || !territoryForm.nome.trim()) { alert('Por favor, preencha o nome do território'); return; }
    const finalId = territoryForm.id.trim() || editingTerritory.id;
    if (finalId !== editingTerritory.id && checkIfTerritoryIdExists(finalId)) { alert('Este ID já existe.'); return; }
    try {
      if (finalId !== editingTerritory.id) { await dataManager.deleteTerritory(editingTerritory.id); await dataManager.addTerritory({ ...territoryForm, id: finalId }); }
      else { await dataManager.updateTerritory({ ...territoryForm, id: finalId }); }
      await loadData(); setShowAddTerritoryModal(false); resetTerritoryForm();
    } catch { alert('Erro ao atualizar território'); }
  };

  const handleDeleteTerritory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este território?'))
      try { await dataManager.deleteTerritory(id); await loadData(); }
      catch { alert('Erro ao excluir território'); }
  };

  const handleEditGroupMembers = (groupName: string) => {
    const names = groupMembers.filter((m) => m.groupName === groupName && m.isActive).map((m) => m.name).join('\n');
    setEditingGroupName(groupName); setBulkMemberInput(names); setBulkGroupAssignment([groupName]); setShowBulkAddMemberModal(true);
  };

  const handleBulkAddMembers = async () => {
    const names = bulkMemberInput.split('\n').map((n) => n.trim()).filter(Boolean);
    const targetGroupName = bulkGroupAssignment[0];
    if (!targetGroupName) { alert('Por favor, selecione um grupo.'); return; }
    setIsSaving(true);
    try {
      for (const member of groupMembers.filter((m) => m.groupName === targetGroupName))
        await dataManager.deleteGroupMember(member.id);
      const newMembers: GroupMember[] = [];
      for (const name of names) {
        let uniqueId = ''; let attempts = 0;
        do { uniqueId = generateUniqueId('member_'); attempts++; } while (checkIfMemberIdExists(uniqueId) && attempts < 10);
        const nm: GroupMember = { id: uniqueId, name, groupName: targetGroupName, role: '', isActive: true };
        newMembers.push(nm); await dataManager.addGroupMember(nm);
      }
      setGroupMembers((prev) => [...prev.filter((m) => m.groupName !== targetGroupName), ...newMembers]);
      await loadData(); 
      setShowBulkAddMemberModal(false); resetBulkMemberForm();
    } catch { alert('Erro ao processar a lista de membros.'); }
    finally { setIsSaving(false); }
  };

  const TABS = [
    { id: 'grupos', label: 'Grupos de Campo', icon: <MapPin size={15} />, count: groups.length },
    { id: 'territorios', label: 'Territórios', icon: <Map size={15} />, count: territories.length },
    { id: 'lista-grupos', label: 'Membros dos Grupos', icon: <Users size={15} />, count: groupMembers.filter(m => m.isActive).length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-green-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={loadData} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
            <RefreshCw size={14} /> Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Grupos de Campo</h2>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB: Grupos de Campo ── */}
      {activeTab === 'grupos' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-gray-500">{groups.length} {groups.length === 1 ? 'grupo cadastrado' : 'grupos cadastrados'}</p>
            <button
              onClick={() => { resetGroupForm(); setShowAddGroupModal(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} /> Novo Grupo
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <MapPin size={48} className="mb-3" />
              <p className="text-base font-medium text-gray-400">Nenhum grupo cadastrado</p>
              <p className="text-sm text-gray-300 mt-1">Clique em "Novo Grupo" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Card top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                          <MapPin size={18} />
                        </div>
                        <h3 className="font-bold text-gray-800 leading-tight">{group.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditGroup(group)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar"><Edit size={15} /></button>
                        <button onClick={() => handleDeleteGroup(group.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Excluir"><Trash2 size={15} /></button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.territory && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                          <MapPin size={13} className="text-green-500 flex-shrink-0" />
                          <span className="font-medium text-gray-500 min-w-fit">Território:</span>
                          <span className="truncate">{group.territory}</span>
                        </div>
                      )}
                      {group.meetingTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                          <Clock size={13} className="text-green-500 flex-shrink-0" />
                          <span className="font-medium text-gray-500 min-w-fit">Horário:</span>
                          <span className="truncate">{group.meetingTime}</span>
                        </div>
                      )}
                      {group.meetingLocation && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                          <Home size={13} className="text-green-500 flex-shrink-0" />
                          <span className="font-medium text-gray-500 min-w-fit">Local:</span>
                          <span className="truncate">{group.meetingLocation}</span>
                        </div>
                      )}
                      {!group.territory && !group.meetingTime && !group.meetingLocation && (
                        <p className="text-xs text-gray-300 italic px-1">Nenhuma informação adicional</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Territórios ── */}
      {activeTab === 'territorios' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-gray-500">{territories.length} {territories.length === 1 ? 'território cadastrado' : 'territórios cadastrados'}</p>
            <button
              onClick={() => { resetTerritoryForm(); setShowAddTerritoryModal(true); }}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} /> Novo Território
            </button>
          </div>

          {territories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Map size={48} className="mb-3" />
              <p className="text-base font-medium text-gray-400">Nenhum território cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {territories.map((t) => {
                return (
                  <div key={t.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                    {/* Blue Header */}
                    <div className="bg-blue-600 px-5 py-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                          <Map size={16} />
                        </div>
                        <h3 className="font-bold text-white text-lg tracking-tight">{t.nome}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTerritory(t)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTerritory(t.id)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/30 text-white flex items-center justify-center transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5">
                      {/* Top Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-5">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-500">Responsável:</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{t.responsavel || 'Não definido'}</p>
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-xs font-semibold text-gray-500">Status:</p>
                          <p className={`text-sm font-bold ${t.status === 'Disponível' ? 'text-emerald-600' : t.status === 'Em andamento' ? 'text-amber-600' : 'text-sky-600'}`}>
                            {t.status}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-xs font-semibold text-gray-500">Última Visita:</p>
                          <p className="text-sm font-bold text-gray-800">{t.ultimaVisita || '—'}</p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-4" />

                      {/* Bottom Info */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500">Próxima Visita Prevista:</p>
                        <p className="text-sm font-bold text-blue-600">{t.proximaVisita || 'Não agendada'}</p>
                      </div>

                      {t.descricao && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Descrição</p>
                          <p className="text-xs text-gray-600 italic line-clamp-2">{t.descricao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Membros dos Grupos ── */}
      {activeTab === 'lista-grupos' && (
        <div>
          <p className="text-sm text-gray-500 mb-5">
            {groupMembers.filter((m) => m.isActive).length} membros distribuídos em {predefinedGroups.length} grupos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {predefinedGroups.map((groupName) => {
              const members = groupMembers.filter((m) => m.groupName === groupName && m.isActive);
              return (
                <div key={groupName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-4 py-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-bold text-sm leading-tight">{groupName}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full">
                          {members.length}
                        </span>
                        <button
                          onClick={() => handleEditGroupMembers(groupName)}
                          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-all"
                          disabled={isSaving}
                          title="Editar membros"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Member list */}
                  <div className="p-3 flex-1">
                    {members.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-300">
                        <Users size={24} className="mb-1" />
                        <p className="text-xs">Sem membros</p>
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {members.map((member, idx) => (
                          <li key={member.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-xs text-gray-300 font-bold w-4 text-right select-none">{idx + 1}</span>
                            <span className="text-sm text-gray-700 leading-tight">
                              {member.name}
                              {member.role && <span className="ml-1 text-xs text-gray-400">({member.role})</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: Grupo ── */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) { setShowAddGroupModal(false); resetGroupForm(); } }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">{editingGroup ? 'Editar Grupo' : 'Novo Grupo de Campo'}</h3>
              <button onClick={() => { setShowAddGroupModal(false); resetGroupForm(); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <InputField label="Nome do Grupo" value={newGroupName} onChange={setNewGroupName} required placeholder="" />
              <InputField label="Território" value={territory} onChange={setTerritory} placeholder="" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Horário" value={meetingTime} onChange={setMeetingTime} placeholder="" />
                <InputField label="Local de Encontro" value={meetingLocation} onChange={setMeetingLocation} placeholder="" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={editingGroup ? handleUpdateGroup : handleAddGroup} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {editingGroup ? 'Atualizar' : 'Criar'} Grupo
              </button>
              <button onClick={() => { setShowAddGroupModal(false); resetGroupForm(); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Território ── */}
      {showAddTerritoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) { setShowAddTerritoryModal(false); resetTerritoryForm(); } }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">{editingTerritory ? 'Editar Território' : 'Novo Território'}</h3>
              <button onClick={() => { setShowAddTerritoryModal(false); resetTerritoryForm(); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <InputField label="ID do Território (opcional)" value={territoryForm.id} onChange={(v) => setTerritoryForm({ ...territoryForm, id: v })} accentClass="focus:ring-sky-500 focus:border-sky-500" />
              <InputField label="Nome do Território" value={territoryForm.nome} onChange={(v) => setTerritoryForm({ ...territoryForm, nome: v })} required accentClass="focus:ring-sky-500 focus:border-sky-500" />
              <InputField label="Responsável" value={territoryForm.responsavel} onChange={(v) => setTerritoryForm({ ...territoryForm, responsavel: v })} accentClass="focus:ring-sky-500 focus:border-sky-500" />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={territoryForm.status}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, status: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Trabalhado">Trabalhado</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Última Visita" value={territoryForm.ultimaVisita} onChange={(v) => setTerritoryForm({ ...territoryForm, ultimaVisita: v })} placeholder="dd/mm/aaaa" accentClass="focus:ring-sky-500 focus:border-sky-500" />
                <InputField label="Próxima Visita" value={territoryForm.proximaVisita} onChange={(v) => setTerritoryForm({ ...territoryForm, proximaVisita: v })} placeholder="dd/mm/aaaa" accentClass="focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Observações</label>
                <textarea
                  value={territoryForm.observacoes}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, observacoes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={editingTerritory ? handleUpdateTerritory : handleAddTerritory} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {editingTerritory ? 'Atualizar' : 'Criar'} Território
              </button>
              <button onClick={() => { setShowAddTerritoryModal(false); resetTerritoryForm(); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Membros em Massa ── */}
      {showBulkAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) { setShowBulkAddMemberModal(false); resetBulkMemberForm(); } }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {editingGroupName ? `Membros — ${editingGroupName}` : 'Adicionar Membros'}
              </h3>
              <button onClick={() => { setShowBulkAddMemberModal(false); resetBulkMemberForm(); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nomes <span className="normal-case text-gray-400 font-normal">(um por linha)</span>
                </label>
                <textarea
                  value={bulkMemberInput}
                  onChange={(e) => setBulkMemberInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                  rows={10}
                />
              </div>
              {!editingGroupName && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Atribuir ao Grupo</label>
                  <select
                    multiple
                    value={bulkGroupAssignment}
                    onChange={(e) => setBulkGroupAssignment(Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                    size={predefinedGroups.length > 5 ? 5 : predefinedGroups.length}
                    disabled={isSaving}
                  >
                    {predefinedGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBulkAddMembers}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {isSaving && <Loader2 size={15} className="animate-spin" />}
                {isSaving ? 'Salvando...' : (editingGroupName ? 'Salvar Alterações' : 'Adicionar Membros')}
              </button>
              <button
                onClick={() => { setShowBulkAddMemberModal(false); resetBulkMemberForm(); }}
                disabled={isSaving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
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