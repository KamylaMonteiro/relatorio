import { useState, useEffect } from 'react';
import { Search, Plus, Users, X, Trash2, Edit } from 'lucide-react';
import DataManager, { Report, Member } from '../../utils/dataManager';

const ReportsSection = () => {
  const [activeTab, setActiveTab] = useState<'publicador' | 'pioneiro' | 'servo' | 'anciao'>('publicador');
  const [members, setMembers] = useState<Member[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]); // Using any for simplicity or import Assignment
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterName, setFilterName] = useState<string>('');

  const getFilterMonths = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 4; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const labelD = new Date(d.getFullYear(), d.getMonth(), 15);
      const label = labelD.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return months;
  };

  const [selectedFilterMonth, setSelectedFilterMonth] = useState<string>(
    (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })()
  );  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const tagColors = [
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', active: 'bg-emerald-600' },
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', active: 'bg-blue-600' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', active: 'bg-rose-600' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', active: 'bg-amber-600' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', active: 'bg-indigo-600' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', active: 'bg-purple-600' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', active: 'bg-pink-600' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', active: 'bg-orange-600' },
    { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', active: 'bg-sky-600' },
    { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', active: 'bg-violet-600' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', active: 'bg-teal-600' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', active: 'bg-cyan-600' },
    { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200', active: 'bg-lime-600' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200', active: 'bg-fuchsia-600' },
    { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', active: 'bg-slate-600' },
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', active: 'bg-red-600' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', active: 'bg-yellow-600' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', active: 'bg-green-600' },
    { bg: 'bg-zinc-100', text: 'text-zinc-800', border: 'border-zinc-200', active: 'bg-zinc-600' },
    { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-200', active: 'bg-stone-600' },
  ];



  interface PioneerTag {
    name: string;
    colorIndex: number;
  }

  const [availableTags, setAvailableTags] = useState<PioneerTag[]>(() => {
    const saved = localStorage.getItem('pioneerTags');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migração simples se for o formato antigo (string[])
        if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
          return (parsed as string[]).map((name, i) => ({ name, colorIndex: i % tagColors.length }));
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing tags', e);
      }
    }
    return [
      { name: 'Ancião', colorIndex: 2 },
      { name: 'Servo', colorIndex: 3 }
    ];
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    localStorage.setItem('pioneerTags', JSON.stringify(availableTags));
  }, [availableTags]);

  const dataManager = DataManager.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allMembers = await dataManager.getMembers();
      const allReports = await dataManager.getReports();
      const allAssignments = await dataManager.getAssignments();
      setMembers(allMembers || []);
      setReports(allReports || []);
      setAssignments(allAssignments || []);
    } catch (error) {
      console.error('Error loading data for reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStrongCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@=-#,?';
    let code = '';
    for (let i = 0; i < 9; i++) {
      // Ensure at least one special char if possible, but randomness is simplest
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // simple heuristic to assure one special character
    const specials = '@=-#,?';
    if (![...code].some(c => specials.includes(c))) {
      code = code.substring(0, 8) + specials.charAt(Math.floor(Math.random() * specials.length));
    }
    return code;
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setNewName('');
    setSelectedTags([]);
    setNewTagName('');
    let code: string;
    let attempts = 0;
    do {
      code = generateStrongCode();
      attempts++;
    } while (members.some(m => m.codigo_acesso === code) && attempts < 50);

    setGeneratedCode(code);
    setShowAddModal(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setNewName(member.name);
    setGeneratedCode(member.codigo_acesso || '');
    setSelectedTags(member.responsibilities || []);
    setShowAddModal(true);
  };

  const handleSaveMember = async () => {
    if (!newName.trim()) return;

    const responsibilities = activeTab === 'pioneiro' ? [...selectedTags] : [];

    try {
      if (editingMember) {
        // Update existing member
        const updatedMember: Member = {
          ...editingMember,
          name: newName.trim(),
          responsibilities: responsibilities,
          codigo_acesso: generatedCode,
        };
        await dataManager.updateMember(updatedMember);

        // Also update the linked general member if it exists
        if (editingMember.alternate_id) {
          const linkedMember = members.find(m => m.id === editingMember.alternate_id);
          if (linkedMember) {
            await dataManager.updateMember({
              ...linkedMember,
              name: newName.trim(),
              category: activeTab === 'anciao' ? 'anciaos' : activeTab === 'servo' ? 'servos' : activeTab === 'publicador' ? 'publicadores' : activeTab,
            });
          }
        }
      } else {
        // Create new members
        const reportId = Date.now().toString();
        const memberId = (Date.now() + 1).toString();

        const newReportMember: Member = {
          id: reportId,
          name: newName.trim(),
          category: activeTab,
          phone: '',
          email: '',
          address: '',
          status: 'ativo',
          responsibilities: responsibilities,
          notes: '',
          codigo_acesso: generatedCode,
          is_report_user: true,
          alternate_id: memberId,
        };

        const newGeneralMember: Member = {
          id: memberId,
          name: newName.trim(),
          category: activeTab === 'anciao' ? 'anciaos' : activeTab === 'servo' ? 'servos' : activeTab === 'publicador' ? 'publicadores' : activeTab,
          phone: '',
          email: '',
          address: '',
          status: 'ativo',
          responsibilities: [],
          notes: 'Criado via Relatórios',
          codigo_acesso: '',
          is_report_user: false,
        };

        await dataManager.addMember(newReportMember);
        await dataManager.addMember(newGeneralMember);
      }

      await loadData();
      setShowAddModal(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      alert('Erro ao salvar o membro.');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir ${name}? (O acesso e os relatórios deste usuário serão removidos permanentemente.)`)) {
      try {
        const memberToDelete = members.find(m => m.id === id);

        await dataManager.deleteMember(id);

        // Also delete the linked general member if it exists
        if (memberToDelete?.alternate_id) {
          try {
            await dataManager.deleteMember(memberToDelete.alternate_id);
          } catch (altError) {
            console.warn('Erro ao deletar membro vinculado:', altError);
          }
        }

        await loadData();
      } catch (error) {
        console.error('Erro ao deletar membro:', error);
        alert('Erro ao excluir membro. Verifique o console.');
      }
    }
  };

  const currentTabMembers = members.filter((m) => {
    if (m.status === 'inativo') return false;
    // Only hide if explicitly marked as a non-report user
    if (m.is_report_user === false) return false;

    // Normalization because category could have been 'publicadores' or 'anciaos' before
    const cat = m.category.toLowerCase();
    if (activeTab === 'publicador') return cat.includes('publicador');
    if (activeTab === 'pioneiro') return cat.includes('pioneiro');
    if (activeTab === 'servo') return cat.includes('servo');
    if (activeTab === 'anciao') return cat.includes('anciao') || cat.includes('anciões');
    return false;
  }).filter(m => filterName ? m.name.toLowerCase().includes(filterName.toLowerCase()) : true);

  // Get the report for a given member and the selected month
  const getLatestReportForMember = (memberId: string) => {
    const memberReports = reports.filter(r => r.member_id === memberId && (r.month === selectedFilterMonth || (!r.month && selectedFilterMonth === getFilterMonths()[0].value)));
    if (memberReports.length === 0) return null;
    // Sort by created_at desc
    return memberReports.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })[0];
  };

  const tabs = [
    { id: 'publicador', label: 'Publicador' },
    { id: 'pioneiro', label: 'Pioneiro' },
    { id: 'servo', label: 'Servo' },
    { id: 'anciao', label: 'Ancião' }
  ] as const;

  return (
    <div className="p-3 md:p-6 max-w-full">
      {/* Header hero */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              Relatórios de Serviço
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2 md:flex md:gap-4">
            <div className="bg-white/20 rounded-xl p-2 md:px-4 md:py-2 text-center backdrop-blur-sm flex flex-col justify-center min-w-0">
              <p className="text-xl md:text-2xl font-bold truncate">{currentTabMembers.length}</p>
              <p className="text-[10px] md:text-xs text-green-100 uppercase font-semibold">Cadastrados</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2 md:px-4 md:py-2 text-center backdrop-blur-sm flex flex-col justify-center min-w-0">
              <p className="text-xl md:text-2xl font-bold truncate text-white">
                {currentTabMembers.filter(m => getLatestReportForMember(m.id) !== null).length}
              </p>
              <p className="text-[10px] md:text-xs text-green-100 uppercase font-semibold">Relataram</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2 md:px-4 md:py-2 text-center backdrop-blur-sm flex flex-col justify-center min-w-0 border border-white/10">
              <p className="text-xl md:text-2xl font-bold truncate text-amber-200">
                {currentTabMembers.filter(m => getLatestReportForMember(m.id) === null).length}
              </p>
              <p className="text-[10px] md:text-xs text-green-100 uppercase font-semibold">Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
              ? 'bg-green-600 text-white shadow-green-200 shadow-md scale-105'
              : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-700 border border-gray-200'
              }`}
          >
            <Users size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters + Action bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
              />
            </div>
            <select
              value={selectedFilterMonth}
              onChange={(e) => setSelectedFilterMonth(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700 h-[40px]"
            >
              {getFilterMonths().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-all text-sm font-semibold shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <Plus size={16} />
            Adicionar {tabs.find(t => t.id === activeTab)?.label}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                  {activeTab === 'pioneiro' ? (
                    <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Horas</th>
                  ) : (
                    <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Ativo</th>
                  )}
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Bíblico</th>
                  {activeTab === 'pioneiro' && (
                    <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tags</th>
                  )}
                  <th className="py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentTabMembers.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'pioneiro' ? 6 : 5} className="text-center py-16">
                      <div className="flex flex-col items-center text-gray-400">
                        <Users size={40} className="mb-3 opacity-30" />
                        <p className="font-medium">Nenhum registro encontrado</p>
                        <p className="text-sm text-gray-400 mt-1">Clique em "Adicionar" para cadastrar um membro</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentTabMembers.map((member) => {
                    const latestReport = getLatestReportForMember(member.id);
                    const hasReport = latestReport !== null;
                    return (
                      <tr key={member.id} className="hover:bg-green-50/30 transition-colors group">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${hasReport ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                              {!hasReport && <p className="text-xs text-amber-500 font-medium">⏳ Aguardando relatório</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold tracking-widest">
                            {member.codigo_acesso || '—'}
                          </span>
                        </td>

                        {activeTab === 'pioneiro' ? (
                          <td className="py-3.5 px-5">
                            {latestReport && latestReport.horas_trabalhadas !== undefined ? (
                              <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded text-sm">
                                {Number(latestReport.horas_trabalhadas).toFixed(2).replace('.', ',')}h
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Pendente</span>
                            )}
                          </td>
                        ) : (
                          <td className="py-3.5 px-5">
                            {latestReport && latestReport.ativo ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${latestReport.ativo === 'Sim'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {latestReport.ativo === 'Sim' ? '✓ Sim' : '✗ Não'}
                              </span>
                            ) : <span className="text-gray-400 italic text-xs">Pendente</span>}
                          </td>
                        )}

                        <td className="py-3.5 px-5 text-sm text-gray-700">
                          {latestReport && latestReport.estudo_biblico ? (
                            <span className="font-medium">{latestReport.estudo_biblico}</span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Pendente</span>
                          )}
                        </td>

                        {activeTab === 'pioneiro' && (
                          <td className="py-3.5 px-5">
                            {member.responsibilities && member.responsibilities.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {member.responsibilities.map((tagName, idx) => {
                                  const tagInfo = availableTags.find(t => t.name === tagName);
                                  const colors = tagInfo ? tagColors[tagInfo.colorIndex] : tagColors[0];
                                  return (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-[10px] font-bold rounded-full uppercase tracking-wider border ${colors.border}`}
                                    >
                                      {tagName}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                        )}

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50"
                              title="Editar"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {currentTabMembers.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                <span>Exibindo {currentTabMembers.length} {currentTabMembers.length === 1 ? 'membro' : 'membros'}</span>
                <span className="text-green-600 font-medium">
                  {currentTabMembers.filter(m => getLatestReportForMember(m.id) !== null).length} relataram no mês
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingMember ? 'Editar' : 'Adicionar'} {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditingMember(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Gerado (Acesso)
                </label>
                <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 font-mono text-gray-700 font-bold tracking-widest">
                  {generatedCode}
                </div>
                <p className="text-xs text-gray-500 mt-1">Este código é gerado automaticamente e único.</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setShowNameDropdown(e.target.value.trim() !== ''); }}
                  onBlur={() => setTimeout(() => setShowNameDropdown(false), 150)}
                  placeholder="Digite ou selecione um nome..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 bg-white"
                  autoFocus
                  required
                  autoComplete="off"
                />
                {showNameDropdown && newName.trim() !== '' && (() => {
                  let categories: string[] = [];
                  if (activeTab === 'publicador') categories = ['PubF', 'PubM'];
                  if (activeTab === 'pioneiro') categories = ['PubF', 'PubM', 'AcSer'];
                  if (activeTab === 'servo') categories = ['AcSer'];
                  if (activeTab === 'anciao') categories = ['Ac'];
                  const opts = Array.from(new Set(
                    assignments
                      .filter(a => categories.includes(a.category))
                      .map(a => a.name)
                      .filter(name => name && name.trim() !== '')
                  )).sort().filter(n => n.toLowerCase().includes(newName.toLowerCase()));
                  if (opts.length === 0) return null;
                  return (
                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {opts.map(name => (
                        <li
                          key={name}
                          onMouseDown={() => { setNewName(name); setShowNameDropdown(false); }}
                          className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-green-50 hover:text-green-800 transition-colors"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>

              {activeTab === 'pioneiro' && (
                <div className="flex flex-col gap-3 mt-2 p-3 bg-gray-50 rounded border border-gray-100">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</span>
                    <p className="text-[10px] text-gray-400 mb-2">Clique para selecionar/remover</p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {availableTags.map((tagObj, index) => {
                        const isSelected = selectedTags.includes(tagObj.name);
                        const colors = tagColors[tagObj.colorIndex];
                        return (
                          <div
                            key={index}
                            className={`group inline-flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-all border ${isSelected
                              ? `${colors.active} text-white border-transparent shadow-md scale-105`
                              : `bg-white ${colors.border} ${colors.text} hover:shadow-sm`
                              }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTags(selectedTags.filter(t => t !== tagObj.name));
                              } else {
                                setSelectedTags([...selectedTags, tagObj.name]);
                              }
                            }}
                          >
                            <span className="text-xs font-bold">{tagObj.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Deseja excluir a tag "${tagObj.name}" permanentemente do sistema?`)) {
                                  setAvailableTags(availableTags.filter((_, i) => i !== index));
                                  setSelectedTags(selectedTags.filter(t => t !== tagObj.name));
                                }
                              }}
                              className={`ml-1 hover:text-red-500 rounded-full p-0.5 transition-colors ${isSelected ? 'text-white/60' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                              title="Excluir tag do sistema"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Criar Nova Tag</span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Ex: Auxiliar..."
                        className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 bg-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTagName.trim() && !availableTags.some(t => t.name === newTagName.trim())) {
                              const newTag = {
                                name: newTagName.trim(),
                                colorIndex: availableTags.length % tagColors.length
                              };
                              setAvailableTags([...availableTags, newTag]);
                              setSelectedTags([...selectedTags, newTag.name]);
                              setNewTagName('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTagName.trim() && !availableTags.some(t => t.name === newTagName.trim())) {
                            const newTag = {
                              name: newTagName.trim(),
                              colorIndex: availableTags.length % tagColors.length
                            };
                            setAvailableTags([...availableTags, newTag]);
                            setSelectedTags([...selectedTags, newTag.name]);
                            setNewTagName('');
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all font-medium text-xs"
                      >
                        CRIAR
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveMember}
                disabled={!newName.trim()}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
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

export default ReportsSection;
