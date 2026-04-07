import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, ChevronDown } from 'lucide-react';

interface MidweekMeeting {
  id?: string;
  date: string;
  type: 'meio-semana';
  presidente?: string;
  status: string;
  audioVideo: string;
  indicador: string;
  indicadorPalco: string;
  microfoneVolante: string;
  limpeza: string;
  presidencia: string;
  canticoInicial: string;
  oracao: string;
  comentariosIniciais: string;
  temaTesouro: string;
  designadoTesouro: string;
  joiasEspirituais: string;
  leituraBiblia: string;
  ministerio: Array<{
    tipo: string;
    tempo: string;
    estudante: string;
    ajudante?: string;
  }>;
  canticoMeio: string;
  responsavelCanticoMeio?: string;
  necessidadesLocais: {
    tema: string;
    designado: string;
  };
  estudoBiblico: {
    designado: string;
    ajudante: string;
  };
  comentariosFinais: string;
  canticoFinal: string;
  numeroCanticoFinal: string;
}

interface WeekendMeeting {
  id?: string;
  date: string;
  type: 'fim-semana';
  presidente: string;
  status: string;
  audioVideo: string;
  indicador: string;
  indicadorPalco: string;
  microfoneVolante: string;
  limpeza: string;
  discursoPublico: {
    tema: string;
    orador: string;
    congregacao: string;
  };
  sentinela: {
    tema: string;
    dirigente: string;
    leitor: string;
  };
}

type Meeting = MidweekMeeting | WeekendMeeting;

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
  editingMeeting?: Meeting | null;
  getCombinedAssignments: (categories: string[]) => string[]; // Adicionado para receber a função
  filterNames: (names: string[], searchText: string) => string[]; // Adicionado para receber a função
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMeeting,
  getCombinedAssignments,
  filterNames,
}) => {
  const [meetingData, setMeetingData] = useState<Meeting>(() => {
    if (editingMeeting) {
      return { ...editingMeeting };
    }
    return {
      date: '',
      type: 'meio-semana',
      presidente: undefined,
      status: 'Rascunho',
      audioVideo: '',
      indicador: '',
      indicadorPalco: '',
      microfoneVolante: '',
      limpeza: '',
      presidencia: '',
      canticoInicial: '',
      oracao: '',
      comentariosIniciais: '',
      temaTesouro: '',
      designadoTesouro: '',
      joiasEspirituais: '',
      leituraBiblia: '',
      ministerio: [
        {
          tipo: 'Iniciando conversas',
          tempo: '1',
          estudante: '',
          ajudante: '',
        },
        {
          tipo: 'Cultivando o interesse',
          tempo: '3',
          estudante: '',
          ajudante: '',
        },
        { tipo: 'Discurso', tempo: '5', estudante: '' },
      ],
      canticoMeio: '',
      responsavelCanticoMeio: '',
      necessidadesLocais: { tema: '', designado: '' },
      estudoBiblico: { designado: '', ajudante: '' },
      comentariosFinais: '',
      canticoFinal: '',
      numeroCanticoFinal: '',
    } as MidweekMeeting;
  });

  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (editingMeeting) {
      setMeetingData({ ...editingMeeting });
    } else {
      setMeetingData({
        date: '',
        type: 'meio-semana',
        presidente: undefined,
        status: 'Rascunho',
        audioVideo: '',
        indicador: '',
        indicadorPalco: '',
        microfoneVolante: '',
        limpeza: '',
        presidencia: '',
        canticoInicial: '',
        oracao: '',
        comentariosIniciais: '',
        temaTesouro: '',
        designadoTesouro: '',
        joiasEspirituais: '',
        leituraBiblia: '',
        ministerio: [
          {
            tipo: 'Iniciando conversas',
            tempo: '1',
            estudante: '',
            ajudante: '',
          },
          {
            tipo: 'Cultivando o interesse',
            tempo: '3',
            estudante: '',
            ajudante: '',
          },
          { tipo: 'Discurso', tempo: '5', estudante: '' },
        ],
        canticoMeio: '',
        responsavelCanticoMeio: '',
        necessidadesLocais: { tema: '', designado: '' },
        estudoBiblico: { designado: '', ajudante: '' },
        comentariosFinais: '',
        canticoFinal: '',
        numeroCanticoFinal: '',
      } as MidweekMeeting);
    }
  }, [editingMeeting]);

  const handleSave = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };
    const meetingDate = parseDate(meetingData.date);

    if (!meetingData.date) {
      alert('Por favor, insira uma data.');
      return;
    }
    if (meetingDate < today) {
      alert('A data da reunião não pode ser anterior à data atual.');
      return;
    }
    onSave(meetingData);
    onClose();
  };

  const handleTypeChange = (type: 'meio-semana' | 'fim-semana') => {
    const baseMeeting = {
      id: meetingData.id,
      date: meetingData.date,
      status: meetingData.status,
      audioVideo: meetingData.audioVideo,
      indicador: meetingData.indicador,
      indicadorPalco: meetingData.indicadorPalco,
      microfoneVolante: meetingData.microfoneVolante,
      limpeza: meetingData.limpeza,
    };

    if (type === 'meio-semana') {
      setMeetingData({
        ...baseMeeting,
        type: 'meio-semana',
        presidencia: (meetingData as MidweekMeeting).presidencia || '',
        canticoInicial: (meetingData as MidweekMeeting).canticoInicial || '',
        oracao: (meetingData as MidweekMeeting).oracao || '',
        comentariosIniciais:
          (meetingData as MidweekMeeting).comentariosIniciais || '',
        temaTesouro: (meetingData as MidweekMeeting).temaTesouro || '',
        designadoTesouro:
          (meetingData as MidweekMeeting).designadoTesouro || '',
        joiasEspirituais:
          (meetingData as MidweekMeeting).joiasEspirituais || '',
        leituraBiblia: (meetingData as MidweekMeeting).leituraBiblia || '',
        ministerio: (meetingData as MidweekMeeting).ministerio || [
          { tipo: 'Iniciando conversas', tempo: '1', estudante: '', ajudante: '' },
          { tipo: 'Cultivando o interesse', tempo: '3', estudante: '', ajudante: '' },
          { tipo: 'Discurso', tempo: '5', estudante: '' },
        ],
        canticoMeio: (meetingData as MidweekMeeting).canticoMeio || '',
        responsavelCanticoMeio:
          (meetingData as MidweekMeeting).responsavelCanticoMeio || '',
        necessidadesLocais: (meetingData as MidweekMeeting).necessidadesLocais || { tema: '', designado: '' },
        estudoBiblico: (meetingData as MidweekMeeting).estudoBiblico || {
          designado: '',
          ajudante: '',
        },
        comentariosFinais:
          (meetingData as MidweekMeeting).comentariosFinais || '',
        canticoFinal: (meetingData as MidweekMeeting).canticoFinal || '',
        numeroCanticoFinal:
          (meetingData as MidweekMeeting).numeroCanticoFinal || '',
      } as MidweekMeeting);
    } else {
      setMeetingData({
        ...baseMeeting,
        type: 'fim-semana',
        presidente: (meetingData as WeekendMeeting).presidente || '',
        discursoPublico: (meetingData as WeekendMeeting).discursoPublico || {
          tema: '',
          orador: '',
          congregacao: '',
        },
        sentinela: (meetingData as WeekendMeeting).sentinela || {
          tema: '',
          dirigente: '',
          leitor: '',
        },
      } as WeekendMeeting);
    }
  };

  const addMinisterioItem = () => {
    if (meetingData.type === 'meio-semana' && 'ministerio' in meetingData) {
      setMeetingData({
        ...meetingData,
        ministerio: [
          ...(meetingData as MidweekMeeting).ministerio,
          { tipo: '', tempo: '', estudante: '', ajudante: '' },
        ],
      } as MidweekMeeting);
    }
  };

  const removeMinisterioItem = (index: number) => {
    if (meetingData.type === 'meio-semana' && 'ministerio' in meetingData) {
      const updatedMinisterio = (
        meetingData as MidweekMeeting
      ).ministerio.filter((_, i) => i !== index);
      setMeetingData({
        ...meetingData,
        ministerio: updatedMinisterio,
      } as MidweekMeeting);
    }
  };

  const updateMinisterioItem = (
    index: number,
    field: string,
    value: string
  ) => {
    if (meetingData.type === 'meio-semana' && 'ministerio' in meetingData) {
      const updatedMinisterio = [...(meetingData as MidweekMeeting).ministerio];
      updatedMinisterio[index] = {
        ...updatedMinisterio[index],
        [field]: value,
      };
      setMeetingData({
        ...meetingData,
        ministerio: updatedMinisterio,
      } as MidweekMeeting);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setMeetingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (
    field: string,
    subField: string,
    value: string
  ) => {
    setMeetingData((prev) => ({
      ...prev,
      [field]: {
        ...(prev as any)[field],
        [subField]: value,
      },
    }));
  };

  const handleSelectName = (
    field: string,
    name: string,
    isNested = false,
    subField = ''
  ) => {
    if (isNested) {
      handleNestedInputChange(field, subField, name);
    } else {
      handleInputChange(field, name);
    }
    setShowDropdown(null);
  };

  const handleSelectMinisterioName = (
    index: number,
    field: string,
    name: string
  ) => {
    updateMinisterioItem(index, field, name);
    setShowDropdown(null);
  };

  const renderNameInputWithDropdown = (
    field: string,
    value: string,
    categories: string[],
    isNested = false,
    subField = ''
  ) => {
    const allNames = getCombinedAssignments(categories);
    const filteredNames = filterNames(allNames, value);
    const dropdownId = isNested ? `${field}-${subField}` : field;
    const shouldShowDropdown =
      showDropdown === dropdownId &&
      (value.length > 0 || filteredNames.length > 0);

    return (
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              if (isNested) {
                handleNestedInputChange(field, subField, newValue);
              } else {
                handleInputChange(field, newValue);
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
            onClick={() =>
              setShowDropdown(showDropdown === dropdownId ? null : dropdownId)
            }
            className="absolute right-0 top-0 h-full px-2 flex items-center justify-center"
          >
            <ChevronDown size={16} />
          </button>
        </div>
        {shouldShowDropdown && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto"
            style={{ top: '100%' }}
          >
            {filteredNames.length > 0 ? (
              filteredNames.map((name, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    handleSelectName(field, name, isNested, subField)
                  }
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                {value.length > 0
                  ? 'Nenhum nome encontrado'
                  : 'Digite para buscar nomes'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMinisterioInputWithDropdown = (
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
    const shouldShowDropdown =
      showDropdown === dropdownId &&
      (value.length > 0 || filteredNames.length > 0);

    return (
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              updateMinisterioItem(index, field, newValue);
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
            onClick={() =>
              setShowDropdown(showDropdown === dropdownId ? null : dropdownId)
            }
            className="absolute right-0 top-0 h-full px-2 flex items-center justify-center"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        {shouldShowDropdown && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto"
            style={{ top: '100%' }}
          >
            {filteredNames.length > 0 ? (
              filteredNames.map((name, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectMinisterioName(index, field, name)}
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-xs">
                {value.length > 0
                  ? 'Nenhum nome encontrado'
                  : 'Digite para buscar nomes'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {editingMeeting ? 'Editar Reunião' : 'Nova Reunião'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="text"
                value={meetingData.date}
                onChange={(e) =>
                  setMeetingData({ ...meetingData, date: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Ex: 03/07/2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={meetingData.type}
                onChange={(e) =>
                  handleTypeChange(
                    e.target.value as 'meio-semana' | 'fim-semana'
                  )
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="meio-semana">Meio de Semana</option>
                <option value="fim-semana">Fim de Semana</option>
              </select>
            </div>
            {meetingData.type === 'fim-semana' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presidente
                </label>
                {renderNameInputWithDropdown(
                  'presidente',
                  (meetingData as WeekendMeeting).presidente || '',
                  ['PubM', 'PubF']
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-4">
              Designações de Serviço
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Áudio e Vídeo - Suporte
                </label>
                {meetingData.type === 'meio-semana' ? (
                  renderNameInputWithDropdown(
                    'audioVideo',
                    meetingData.audioVideo,
                    ['PubM']
                  )
                ) : (
                  <input
                    type="text"
                    value={meetingData.audioVideo}
                    onChange={(e) =>
                      handleInputChange('audioVideo', e.target.value)
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indicador
                </label>
                {meetingData.type === 'meio-semana' ? (
                  renderNameInputWithDropdown(
                    'indicador',
                    meetingData.indicador,
                    ['PubM']
                  )
                ) : (
                  <input
                    type="text"
                    value={meetingData.indicador}
                    onChange={(e) =>
                      handleInputChange('indicador', e.target.value)
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indicador de Palco
                </label>
                {renderNameInputWithDropdown(
                  'indicadorPalco',
                  meetingData.indicadorPalco,
                  ['PubM']
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Microfone Volante
                </label>
                {renderNameInputWithDropdown(
                  'microfoneVolante',
                  meetingData.microfoneVolante,
                  ['PubM']
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limpeza
                </label>
                <input
                  type="text"
                  value={meetingData.limpeza}
                  onChange={(e) =>
                    setMeetingData({ ...meetingData, limpeza: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {meetingData.type === 'meio-semana' && (
            <>
              <div className="bg-blue-100 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-4">PRESIDÊNCIA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Presidência
                    </label>
                    {renderNameInputWithDropdown(
                      'presidencia',
                      (meetingData as MidweekMeeting).presidencia || '',
                      ['PubM']
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cântico e Oração (número)
                    </label>
                    <input
                      type="text"
                      value={
                        (meetingData as MidweekMeeting).canticoInicial || ''
                      }
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          canticoInicial: e.target.value,
                        } as MidweekMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                      placeholder="Ex: 154"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oração (5 min)
                    </label>
                    {renderNameInputWithDropdown(
                      'oracao',
                      (meetingData as MidweekMeeting).oracao || '',
                      ['AcSer', 'PubM']
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentários Iniciais
                    </label>
                    {renderNameInputWithDropdown(
                      'comentariosIniciais',
                      (meetingData as MidweekMeeting).comentariosIniciais || '',
                      ['PubM']
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-4">
                  💎 TESOUROS DA PALAVRA DE DEUS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tema
                    </label>
                    <input
                      type="text"
                      value={(meetingData as MidweekMeeting).temaTesouro || ''}
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          temaTesouro: e.target.value,
                        } as MidweekMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designado
                    </label>
                    {renderNameInputWithDropdown(
                      'designadoTesouro',
                      (meetingData as MidweekMeeting).designadoTesouro || '',
                      ['PubM']
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joias Espirituais
                    </label>
                    <input
                      type="text"
                      value={
                        (meetingData as MidweekMeeting).joiasEspirituais || ''
                      }
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          joiasEspirituais: e.target.value,
                        } as MidweekMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leitura da Bíblia (4 min)
                    </label>
                    {renderNameInputWithDropdown(
                      'leituraBiblia',
                      (meetingData as MidweekMeeting).leituraBiblia || '',
                      ['PubM']
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-100 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-4">
                  🗣️ FAÇA SEU MELHOR NO MINISTÉRIO
                </h4>
                <div className="space-y-4">
                  {(meetingData as MidweekMeeting).ministerio.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4"
                      >
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                          </label>
                          <select
                            value={item.tipo}
                            onChange={(e) =>
                              updateMinisterioItem(
                                index,
                                'tipo',
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">Selecione</option>
                            <option value="Iniciando conversas">
                              Iniciando conversas
                            </option>
                            <option value="Cultivando o interesse">
                              Cultivando o interesse
                            </option>
                            <option value="Discurso">Discurso</option>
                            <option value="Necessidades Locais">
                              Necessidades Locais
                            </option>
                            <option value="Estudo Bíblico">
                              Estudo Bíblico
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tempo
                          </label>
                          <input
                            type="text"
                            value={item.tempo}
                            onChange={(e) =>
                              updateMinisterioItem(
                                index,
                                'tempo',
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estudante
                          </label>
                          {renderMinisterioInputWithDropdown(
                            index,
                            'estudante',
                            item.estudante,
                            item.tipo
                          )}
                        </div>
                        {item.tipo !== 'Discurso' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ajudante
                            </label>
                            {renderMinisterioInputWithDropdown(
                              index,
                              'ajudante',
                              item.ajudante || '',
                              item.tipo
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => removeMinisterioItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  <button
                    type="button"
                    onClick={addMinisterioItem}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={20} className="mr-1" /> Adicionar Item
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-4">
                  📖 NOSSA VIDA CRISTÃ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cântico do Meio (número)
                    </label>
                    <input
                      type="text"
                      value={(meetingData as MidweekMeeting).canticoMeio || ''}
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          canticoMeio: e.target.value,
                        } as MidweekMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                      placeholder="Ex: 084"
                    />
                  </div>
                  {/* Campo Responsável removido */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Necessidades Locais - Tema
                    </label>
                    <input
                      type="text"
                      value={
                        (meetingData as MidweekMeeting).necessidadesLocais
                          .tema || ''
                      }
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          necessidadesLocais: {
                            ...(meetingData as MidweekMeeting)
                              .necessidadesLocais,
                            tema: e.target.value,
                          },
                        } as MidweekMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Necessidades Locais - Designado
                    </label>
                    {renderNameInputWithDropdown(
                      'necessidadesLocais',
                      (meetingData as MidweekMeeting).necessidadesLocais
                        .designado || '',
                      ['PubM'],
                      true,
                      'designado'
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estudo Bíblico de Congregação - Dirigente
                    </label>
                    {renderNameInputWithDropdown(
                      'estudoBiblico',
                      (meetingData as MidweekMeeting).estudoBiblico.designado ||
                        '',
                      ['PubM'],
                      true,
                      'designado'
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estudo Bíblico de Congregação - Ajudante
                    </label>
                    {renderNameInputWithDropdown(
                      'estudoBiblico',
                      (meetingData as MidweekMeeting).estudoBiblico.ajudante ||
                        '',
                      ['PubM'],
                      true,
                      'ajudante'
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentários Finais
                    </label>
                    {renderNameInputWithDropdown(
                      'comentariosFinais',
                      (meetingData as MidweekMeeting).comentariosFinais || '',
                      ['PubM']
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cântico Final (número)
                    </label>
                    <input
                      type="text"
                      value={(meetingData as MidweekMeeting).canticoFinal || ''}
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          canticoFinal: e.target.value,
                        } as MidweekMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                      placeholder="Ex: 120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oração Final
                    </label>
                    {renderNameInputWithDropdown(
                      'numeroCanticoFinal',
                      (meetingData as MidweekMeeting).numeroCanticoFinal || '',
                      ['PubM']
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {meetingData.type === 'fim-semana' && (
            <>
              <div className="bg-blue-100 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-4">
                  🗣️ DISCURSO PÚBLICO
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tema
                    </label>
                    <input
                      type="text"
                      value={
                        (meetingData as WeekendMeeting).discursoPublico.tema ||
                        ''
                      }
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          discursoPublico: {
                            ...(meetingData as WeekendMeeting).discursoPublico,
                            tema: e.target.value,
                          },
                        } as WeekendMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orador
                    </label>
                    <input
                      type="text"
                      value={
                        (meetingData as WeekendMeeting).discursoPublico
                          .orador || ''
                      }
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          discursoPublico: {
                            ...(meetingData as WeekendMeeting).discursoPublico,
                            orador: e.target.value,
                          },
                        } as WeekendMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Congregação
                    </label>
                    <input
                      type="text"
                      value={
                        (meetingData as WeekendMeeting).discursoPublico
                          .congregacao || ''
                      }
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          discursoPublico: {
                            ...(meetingData as WeekendMeeting).discursoPublico,
                            congregacao: e.target.value,
                          },
                        } as WeekendMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-4">
                  📚 ESTUDO DE A SENTINELA
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tema
                    </label>
                    <input
                      type="text"
                      value={
                        (meetingData as WeekendMeeting).sentinela.tema || ''
                      }
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          sentinela: {
                            ...(meetingData as WeekendMeeting).sentinela,
                            tema: e.target.value,
                          },
                        } as WeekendMeeting)
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirigente
                    </label>
                    {renderNameInputWithDropdown(
                      'sentinela',
                      (meetingData as WeekendMeeting).sentinela.dirigente || '',
                      ['PubM'],
                      true,
                      'dirigente'
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leitor
                    </label>
                    {renderNameInputWithDropdown(
                      'sentinela',
                      (meetingData as WeekendMeeting).sentinela.leitor || '',
                      ['PubM'],
                      true,
                      'leitor'
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X size={18} className="inline-block mr-1" /> Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save size={18} className="inline-block mr-1" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;
