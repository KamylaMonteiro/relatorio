import React, { useState, useEffect } from 'react';
import { Trash2, Save, ChevronDown, Plus, Calendar, Loader2 } from 'lucide-react';
import DataManager, { Meeting, Assignment } from '../../utils/dataManager';

interface MeetingsSectionProps {
  meetings: Meeting[];
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
  onUpdateMeetings: () => void;
}

const MeetingsSection: React.FC<MeetingsSectionProps> = ({
  meetings,
  onEditMeeting: _onEditMeeting,
  onDeleteMeeting,
  onUpdateMeetings: _onUpdateMeetings,
}) => {
  const [activeTab, setActiveTab] = useState<'meio-semana' | 'fim-semana'>('meio-semana');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [displayMeetings, setDisplayMeetings] = useState<Meeting[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const loadedAssignments = await dataManager.getAssignments();
        console.log('Designações carregadas:', loadedAssignments); // Debug
        setAssignments(loadedAssignments || []);
      } catch (error) {
        console.error('Erro ao carregar designações:', error);
        setAssignments([]);
      }
    };
    loadAssignments();
  }, []);

  // Filtra as designações por categoria e retorna apenas os nomes das pessoas
  const getAssignmentsByCategory = (category: string) => {
    const filtered = assignments.filter(a => a.category === category && a.name && a.name.trim() !== '');
    console.log(`Nomes para categoria ${category}:`, filtered.map(a => a.name)); // Debug
    return filtered.map(a => a.name);
  };

  // Combina múltiplas categorias
  const getCombinedAssignments = (categories: string[]) => {
    const combined: string[] = [];
    categories.forEach(cat => {
      const names = getAssignmentsByCategory(cat);
      combined.push(...names);
    });
    const uniqueNames = [...new Set(combined)]; // Remove duplicatas
    console.log(`Nomes combinados para categorias ${categories.join(', ')}:`, uniqueNames); // Debug
    return uniqueNames;
  };

  const filterNames = (names: string[], searchText: string) => {
    if (!searchText) return names;
    return names.filter(name =>
      name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getNextNDatesByWeekday = (n: number, weekday: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let next = new Date(today);
    while (next.getDay() !== weekday) {
      next.setDate(next.getDate() + 1);
    }
    for (let i = 0; i < n; i++) {
      const dd = String(next.getDate()).padStart(2, '0');
      const mm = String(next.getMonth() + 1).padStart(2, '0');
      const yyyy = next.getFullYear();
      dates.push(`${dd}/${mm}/${yyyy}`);
      next.setDate(next.getDate() + 7);
    }
    return dates;
  };

  const initializeMeetingForDate = async () => {
    const dateOptions = getNextNDatesByWeekday(20, activeTab === 'meio-semana' ? 3 : 6);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };
    const validDates = dateOptions.filter(date => {
      const dateObj = parseDate(date);
      return dateObj >= today;
    });
    if (!selectedDate && validDates.length > 0) {
      setSelectedDate(validDates[0]);
    }
    if (!selectedDate) return;
    try {
      const allMeetings = (await dataManager.getMeetings()) ?? [];
      const existingMeeting = allMeetings.find(m => m.date === selectedDate && m.type === activeTab);
      if (existingMeeting) {
        const normalizedMeeting: Meeting = {
          ...existingMeeting,
          ...(activeTab === 'meio-semana' && {
            presidencia: existingMeeting.presidencia || '',
            canticoInicial: existingMeeting.canticoInicial || '',
            oracao: existingMeeting.oracao || '',
            comentariosIniciais: existingMeeting.comentariosIniciais || '',
            temaTesouro: existingMeeting.temaTesouro || '',
            designadoTesouro: existingMeeting.designadoTesouro || '',
            joiasEspirituais: existingMeeting.joiasEspirituais || '',
            leituraBiblia: existingMeeting.leituraBiblia || '',
            ministerio: existingMeeting.ministerio || [
              { tipo: 'Iniciando conversas', tempo: '1', estudante: '', ajudante: '' },
              { tipo: 'Cultivando o interesse', tempo: '3', estudante: '', ajudante: '' },
              { tipo: 'Discurso', tempo: '5', estudante: '' },
            ],
            canticoMeio: existingMeeting.canticoMeio || '',
            responsavelCanticoMeio: existingMeeting.responsavelCanticoMeio || '',
            necessidadesLocais: existingMeeting.necessidadesLocais || { tema: '', designado: '' },
            estudoBiblico: existingMeeting.estudoBiblico || { designado: '', ajudante: '' },
            comentariosFinais: existingMeeting.comentariosFinais || '',
            canticoFinal: existingMeeting.canticoFinal || '',
            numeroCanticoFinal: existingMeeting.numeroCanticoFinal || '',
          }),
          ...(activeTab === 'fim-semana' && {
            presidente: existingMeeting.presidente || '',
            discursoPublico: existingMeeting.discursoPublico || { tema: '', orador: '', congregacao: '' },
            sentinela: existingMeeting.sentinela || { tema: '', dirigente: '', leitor: '' },
          }),
        };
        setDisplayMeetings([normalizedMeeting]);
      } else if (selectedDate) {
        const uniqueId = `${selectedDate.replace(/\//g, '')}-${activeTab}-${Date.now()}`;
        const newMeeting: Meeting = {
          id: uniqueId,
          date: selectedDate,
          type: activeTab,
          presidente: activeTab === 'fim-semana' ? '' : '',
          status: 'Rascunho',
          audioVideo: '',
          indicador: '',
          indicadorPalco: '',
          microfoneVolante: '',
          limpeza: '',
          ...(activeTab === 'meio-semana' && {
            presidencia: '',
            canticoInicial: '',
            oracao: '',
            comentariosIniciais: '',
            temaTesouro: '',
            designadoTesouro: '',
            joiasEspirituais: '',
            leituraBiblia: '',
            ministerio: [
              { tipo: 'Iniciando conversas', tempo: '1', estudante: '', ajudante: '' },
              { tipo: 'Cultivando o interesse', tempo: '3', estudante: '', ajudante: '' },
              { tipo: 'Discurso', tempo: '5', estudante: '' },
            ],
            canticoMeio: '',
            responsavelCanticoMeio: '',
            necessidadesLocais: { tema: '', designado: '' },
            estudoBiblico: { designado: '', ajudante: '' },
            comentariosFinais: '',
            canticoFinal: '',
            numeroCanticoFinal: '',
          }),
          ...(activeTab === 'fim-semana' && {
            discursoPublico: { tema: '', orador: '', congregacao: '' },
            sentinela: { tema: '', dirigente: '', leitor: '' },
          }),
        };
        setDisplayMeetings([newMeeting]);
      }
    } catch (error) {
      console.error('Erro ao inicializar reunião:', error);
      setDisplayMeetings([]);
    }
  };

  useEffect(() => {
    const initializeAsync = async () => {
      await initializeMeetingForDate();
    };
    initializeAsync();
  }, [selectedDate, activeTab, meetings]);

  const handleSaveMeeting = async (meeting: Meeting) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };
      const meetingDate = parseDate(meeting.date);
      if (meetingDate < today) {
        alert('A data da reunião não pode ser anterior à data atual.');
        return;
      }
      const allMeetings = (await dataManager.getMeetings()) ?? [];
      const existingMeetingIndex = allMeetings.findIndex(m =>
        m.date === meeting.date && m.type === meeting.type
      );
      if (existingMeetingIndex !== -1) {
        const updatedMeeting = {
          ...meeting,
          id: allMeetings[existingMeetingIndex].id
        };
        await dataManager.updateMeeting(updatedMeeting);
      } else {
        await dataManager.addMeeting(meeting);
      }
      const updatedAllMeetings = (await dataManager.getMeetings()) ?? [];
      const updatedMeeting = updatedAllMeetings.find(m =>
        m.date === meeting.date && m.type === meeting.type
      );
      if (updatedMeeting) {
        setDisplayMeetings([updatedMeeting]);
      }
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
      alert('Erro ao salvar reunião. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setDisplayMeetings(prev =>
      prev.map(meeting =>
        meeting.id === id
          ? { ...meeting, [field]: value }
          : meeting
      )
    );
  };

  const handleNestedInputChange = (id: string, field: string, subField: string, value: string) => {
    setDisplayMeetings(prev =>
      prev.map(meeting =>
        meeting.id === id
          ? {
              ...meeting,
              [field]: {
                ...(meeting[field as keyof Meeting] as object ?? {}),
                [subField]: value,
              },
            }
          : meeting
      )
    );
  };

  const handleMinisterioChange = (id: string, index: number, field: string, value: string) => {
    setDisplayMeetings(prev =>
      prev.map(meeting =>
        meeting.id === id && 'ministerio' in meeting
          ? {
              ...meeting,
              ministerio: (meeting.ministerio || []).map((item, i) =>
                i === index
                  ? {
                      ...item,
                      [field]: value,
                      ...(field === 'tipo' && value === 'Discurso' ? { ajudante: '' } : {}),
                    }
                  : item
              ),
            }
          : meeting
      )
    );
  };

  const addMinisterioItem = (id: string) => {
    setDisplayMeetings(prev =>
      prev.map(meeting =>
        meeting.id === id && 'ministerio' in meeting
          ? {
              ...meeting,
              ministerio: [
                ...(meeting.ministerio || []),
                { tipo: '', tempo: '', estudante: '', ajudante: '' },
              ],
            }
          : meeting
      )
    );
  };

  const removeMinisterioItem = (id: string, index: number) => {
    setDisplayMeetings(prev =>
      prev.map(meeting =>
        meeting.id === id && 'ministerio' in meeting
          ? {
              ...meeting,
              ministerio: (meeting.ministerio || []).filter((_, i) => i !== index),
            }
          : meeting
      )
    );
  };

  const toggleDropdown = (field: string) => {
    setShowDropdown(showDropdown === field ? null : field);
  };

  const handleSelectName = (id: string, field: string, name: string, isNested = false, subField = '') => {
    if (isNested) {
      handleNestedInputChange(id, field, subField, name);
    } else {
      handleInputChange(id, field, name);
    }
    setShowDropdown(null);
  };

  const handleSelectMinisterioName = (id: string, index: number, field: string, name: string) => {
    handleMinisterioChange(id, index, field, name);
    setShowDropdown(null);
  };

  const renderNameInputWithDropdown = (
    id: string,
    field: string,
    value: string,
    categories: string[],
    isNested = false,
    subField = ''
  ) => {
    const allNames = getCombinedAssignments(categories);
    const filteredNames = filterNames(allNames, value);
    const dropdownId = isNested ? `${field}-${subField}` : field;
    const shouldShowDropdown = showDropdown === dropdownId && (value.length > 0 || filteredNames.length > 0);
    
    return (
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              if (isNested) {
                handleNestedInputChange(id, field, subField, newValue);
              } else {
                handleInputChange(id, field, newValue);
              }
              if (newValue.length > 0 && showDropdown !== dropdownId) {
                setShowDropdown(dropdownId);
              }
            }}
            onFocus={() => setShowDropdown(dropdownId)}
            className="w-full border rounded px-3 py-2 pr-8"
            placeholder="Digite para buscar ou selecione..."
          />
          <button
            type="button"
            onClick={() => toggleDropdown(dropdownId)}
            className="absolute right-0 top-0 h-full px-2 flex items-center justify-center"
          >
            <ChevronDown size={16} />
          </button>
        </div>
        {shouldShowDropdown && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto" style={{ top: '100%' }}>
            {filteredNames.length > 0 ? (
              filteredNames.map((name, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectName(id, field, name, isNested, subField)}
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                {value.length > 0 ? 'Nenhum nome encontrado' : 'Digite para buscar nomes'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMinisterioInputWithDropdown = (
    id: string,
    index: number,
    field: string,
    value: string,
    itemType: string
  ) => {
    let categories = ['PubF', 'PubM'];
    if (itemType === 'Discurso') {
      categories = ['PubM'];
    }
    const allNames = getCombinedAssignments(categories);
    const filteredNames = filterNames(allNames, value);
    const dropdownId = `ministerio-${index}-${field}`;
    const shouldShowDropdown = showDropdown === dropdownId && (value.length > 0 || filteredNames.length > 0);
    
    return (
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              handleMinisterioChange(id, index, field, newValue);
              if (newValue.length > 0 && showDropdown !== dropdownId) {
                setShowDropdown(dropdownId);
              }
            }}
            onFocus={() => setShowDropdown(dropdownId)}
            className="w-full border rounded px-2 py-1 text-sm pr-8"
            placeholder="Digite para buscar..."
          />
          <button
            type="button"
            onClick={() => toggleDropdown(dropdownId)}
            className="absolute right-0 top-0 h-full px-2 flex items-center justify-center"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        {shouldShowDropdown && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto" style={{ top: '100%' }}>
            {filteredNames.length > 0 ? (
              filteredNames.map((name, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectMinisterioName(id, index, field, name)}
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-xs">
                {value.length > 0 ? 'Nenhum nome encontrado' : 'Digite para buscar nomes'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLimpezaDropdown = (id: string, value: string) => {
    const limpezaOptions = ['Salão Do Reino', 'Jardim Tropical Ville', 'Despraiado', 'Jardim Novo Colorado'];
    const filteredOptions = filterNames(limpezaOptions, value);
    const dropdownId = `limpeza`;
    const shouldShowDropdown = showDropdown === dropdownId && (value.length > 0 || filteredOptions.length > 0);
    
    return (
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(id, 'limpeza', e.target.value)}
            onFocus={() => setShowDropdown(dropdownId)}
            className="w-full border rounded px-3 py-2 pr-8"
            placeholder="Selecione uma opção..."
          />
          <button
            type="button"
            onClick={() => toggleDropdown(dropdownId)}
            className="absolute right-0 top-0 h-full px-2 flex items-center justify-center"
          >
            <ChevronDown size={16} />
          </button>
        </div>
        {shouldShowDropdown && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto" style={{ top: '100%' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectName(id, 'limpeza', option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                {value.length > 0 ? 'Nenhuma opção encontrada' : 'Digite ou selecione uma opção'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reuniões</h2>

        {/* Date selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Calendar size={15} className="text-gray-400 flex-shrink-0" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer pr-2"
          >
            <option value="">Selecione uma data</option>
            {getNextNDatesByWeekday(20, activeTab === 'meio-semana' ? 3 : 6).map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
        {(['meio-semana', 'fim-semana'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedDate(''); }}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'meio-semana' ? 'Meio de Semana' : 'Fim de Semana'}
          </button>
        ))}
      </div>
      {/* Meeting container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {!selectedDate ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Calendar size={48} className="mb-3" />
            <p className="text-base font-medium text-gray-400">Selecione uma data acima</p>
            <p className="text-sm text-gray-300 mt-1">para carregar ou criar a reunião</p>
          </div>
        ) : (
          <div className="space-y-6">
          {displayMeetings.map((meeting) => (
              <div key={meeting.id} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                      <Calendar size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Reunião</p>
                      <h4 className="font-bold text-gray-800 leading-tight">{meeting.date}</h4>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveMeeting(meeting)}
                      disabled={isSaving}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                        isSaving
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                      }`}
                      title="Salvar"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => onDeleteMeeting(meeting.id)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTab === 'fim-semana' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Presidente</label>
                    {renderNameInputWithDropdown(meeting.id, 'presidente', meeting.presidente || '', ['Ac'])}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Áudio e Vídeo</label>
                  {renderNameInputWithDropdown(meeting.id, 'audioVideo', meeting.audioVideo, ['PubM'])}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indicador</label>
                  {renderNameInputWithDropdown(meeting.id, 'indicador', meeting.indicador, ['PubM'])}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indicador de Palco</label>
                  {renderNameInputWithDropdown(meeting.id, 'indicadorPalco', meeting.indicadorPalco, ['PubM'])}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Microfone Volante</label>
                  {renderNameInputWithDropdown(meeting.id, 'microfoneVolante', meeting.microfoneVolante, ['PubM'])}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limpeza</label>
                  {renderLimpezaDropdown(meeting.id, meeting.limpeza)}
                </div>
              </div>
              {activeTab === 'meio-semana' && 'presidencia' in meeting && (
                <div className="mt-4">
                  <div className="bg-blue-600 text-white px-4 py-3">
                    <h5 className="font-bold">PRESIDÊNCIA</h5>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Presidente</label>
                        {renderNameInputWithDropdown(meeting.id, 'presidencia', meeting.presidencia || '', ['Ac'])}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cântico Inicial</label>
                        <input
                          type="text"
                          value={meeting.canticoInicial || ''}
                          onChange={(e) => handleInputChange(meeting.id, 'canticoInicial', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Oração</label>
                        {renderNameInputWithDropdown(meeting.id, 'oracao', meeting.oracao || '', ['AcSer', 'PubM'])}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comentários Iniciais(1 min)</label>
                        {renderNameInputWithDropdown(meeting.id, 'comentariosIniciais', meeting.comentariosIniciais || '', ['Ac'])}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'meio-semana' && 'temaTesouro' in meeting && (
                <div className="mt-4">
                  <div className="bg-[#656164] text-white px-1 py-0.09 flex items-center gap-0.5">
                    <img src="https://congregacao.tpe.net.br/imagens/rms20.jpg" alt="Tesouros" style={{ maxWidth: '50px', marginRight: '' }} />
                    <h5 className="font-bold">TESOUROS DA PALAVRA DE DEUS</h5>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tema Principal(10 min)</label>
                        <input
                          type="text"
                          value={meeting.temaTesouro || ''}
                          onChange={(e) => handleInputChange(meeting.id, 'temaTesouro', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> </label>
                        {renderNameInputWithDropdown(meeting.id, 'designadoTesouro', meeting.designadoTesouro || '', ['AcSer'])}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Joias Espirituais(10 min)</label>
                        {renderNameInputWithDropdown(meeting.id, 'joiasEspirituais', meeting.joiasEspirituais || '', ['AcSer'])}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leitura da Bíblia(4 min)</label>
                        {renderNameInputWithDropdown(meeting.id, 'leituraBiblia', meeting.leituraBiblia || '', ['PubM'])}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'meio-semana' && 'ministerio' in meeting && (
                <section className="bg-yellow-50 rounded-lg mt-4 relative" style={{ zIndex: 10 }}>
                  <div className="bg-[#a56803] text-white px-1 py-0.09 flex items-center gap-0.5">
                    <img src="https://congregacao.tpe.net.br/imagens/rms30.jpg" alt="Ministério" style={{ maxWidth: '50px', marginRight: '' }} />
                    <h5 className="font-bold">FAÇA SEU MELHOR NO MINISTÉRIO</h5>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {(meeting.ministerio || []).map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-sm">{item.tipo || 'Nova Parte'}</span>
                              <span className="text-xs text-gray-500 ml-2">({item.tempo} min)</span>
                            </div>
                            <button
                              onClick={() => removeMinisterioItem(meeting.id, index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Excluir Parte"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                              <select
                                value={item.tipo}
                                onChange={(e) => handleMinisterioChange(meeting.id, index, 'tipo', e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">Selecione</option>
                                <option value="Iniciando conversas">Iniciando conversas</option>
                                <option value="Cultivando o interesse">Cultivando o interesse</option>
                                <option value="Fazendo discípulos">Fazendo discípulos</option>
                                <option value="Explicando suas crenças">Explicando suas crenças</option>
                                <option value="Discurso">Discurso</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Tempo (min)</label>
                              <input
                                type="text"
                                value={item.tempo}
                                onChange={(e) => handleMinisterioChange(meeting.id, index, 'tempo', e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Estudante</label>
                              {renderMinisterioInputWithDropdown(
                                meeting.id,
                                index,
                                'estudante',
                                item.estudante,
                                item.tipo
                              )}
                            </div>
                            {item.tipo !== 'Discurso' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ajudante</label>
                                {renderMinisterioInputWithDropdown(
                                  meeting.id,
                                  index,
                                  'ajudante',
                                  item.ajudante || '',
                                  item.tipo
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addMinisterioItem(meeting.id)}
                        className="flex items-center text-blue-600 hover:text-blue-800 mt-4"
                      >
                        <Plus size={16} className="mr-1" /> Adicionar Parte
                      </button>
                    </div>
                  </div>
                </section>
              )}
              {activeTab === 'meio-semana' && 'canticoMeio' in meeting && meeting.necessidadesLocais && meeting.estudoBiblico && (
                <section className="bg-red-50 rounded-lg mt-8 relative" style={{ zIndex: 10 }}>
                  <div className="bg-[#99131e] text-white px-1 py-0.09 flex items-center gap-0.5">
                    <img src="https://congregacao.tpe.net.br/imagens/rms40.jpg" alt="Vida Cristã" style={{ maxWidth: '50px', marginRight: '' }} />
                    <h5 className="font-bold">NOSSA VIDA CRISTÃ</h5>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cântico (5 min)</label>
                          <input
                            type="text"
                            value={meeting.canticoMeio || ''}
                            onChange={(e) => handleInputChange(meeting.id, 'canticoMeio', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        {/* Campo Responsável removido */}
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <h6 className="font-medium mb-3">Necessidades Locais (15 min)</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                            <input
                              type="text"
                              value={meeting.necessidadesLocais.tema || ''}
                              onChange={(e) => handleNestedInputChange(meeting.id, 'necessidadesLocais', 'tema', e.target.value)}
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designado</label>
                            {renderNameInputWithDropdown(meeting.id, 'necessidadesLocais', meeting.necessidadesLocais.designado || '', ['AcSer'], true, 'designado')}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <h6 className="font-medium mb-3">Estudo Bíblico de Congregação (30 min)</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirigente</label>
                            {renderNameInputWithDropdown(meeting.id, 'estudoBiblico', meeting.estudoBiblico.designado || '', ['Ac'], true, 'designado')}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ajudante</label>
                            {renderNameInputWithDropdown(meeting.id, 'estudoBiblico', meeting.estudoBiblico.ajudante || '', ['PubM'], true, 'ajudante')}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comentários Finais (3 min)</label>
                        {renderNameInputWithDropdown(meeting.id, 'comentariosFinais', meeting.comentariosFinais || '', ['Ac'])}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cântico Final</label>
                          <input
                            type="text"
                            value={meeting.canticoFinal || ''}
                            onChange={(e) => handleInputChange(meeting.id, 'canticoFinal', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Oração Final</label>
                          {renderNameInputWithDropdown(meeting.id, 'numeroCanticoFinal', meeting.numeroCanticoFinal || '', ['AcSer','PubM'])}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {activeTab === 'fim-semana' && meeting.discursoPublico && meeting.sentinela && (
                <>
                  <div className="mt-4">
                    <div className="bg-blue-600 text-white px-4 py-3">
                      <h5 className="font-bold">DISCURSO PÚBLICO</h5>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                          <input
                            type="text"
                            value={meeting.discursoPublico?.tema || ''}
                            onChange={(e) => handleNestedInputChange(meeting.id, 'discursoPublico', 'tema', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Orador</label>
                          <input
                            type="text"
                            value={meeting.discursoPublico?.orador || ''}
                            onChange={(e) => handleNestedInputChange(meeting.id, 'discursoPublico', 'orador', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Congregação</label>
                          <input
                            type="text"
                            value={meeting.discursoPublico?.congregacao || ''}
                            onChange={(e) => handleNestedInputChange(meeting.id, 'discursoPublico', 'congregacao', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="bg-gray-600 text-white px-4 py-3">
                      <h5 className="font-bold">ESTUDO DE A SENTINELA</h5>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                          <input
                            type="text"
                            value={meeting.sentinela?.tema || ''}
                            onChange={(e) => handleNestedInputChange(meeting.id, 'sentinela', 'tema', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dirigente</label>
                          {renderNameInputWithDropdown(meeting.id, 'sentinela', meeting.sentinela.dirigente || '', ['Ac'], true, 'dirigente')}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Leitor</label>
                          {renderNameInputWithDropdown(meeting.id, 'sentinela', meeting.sentinela.leitor || '', ['PubM'], true, 'leitor')}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsSection;