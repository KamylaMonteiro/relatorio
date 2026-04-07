import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users } from 'lucide-react';
import DataManager, { FieldGroup, Territory, GroupMember } from '../utils/dataManager';

const GruposCampo = () => {
  const [activeTab, setActiveTab] = useState('grupos');
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carrega dados da nuvem primeiro
      await dataManager.loadAllDataFromCloud();
      
      const [loadedGroups, loadedTerritories, loadedGroupMembers] = await Promise.all([
        dataManager.getFieldGroups(),
        dataManager.getTerritories(),
        dataManager.getGroupMembers()
      ]);
      
      setFieldGroups(loadedGroups || []);
      setTerritories(loadedTerritories || []);
      setGroupMembers(loadedGroupMembers || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Organiza os membros dos grupos por nome do grupo
  const organizeGroupMembers = () => {
    const organized: { [key: string]: GroupMember[] } = {};
    
    groupMembers.forEach(member => {
      if (!organized[member.groupName]) {
        organized[member.groupName] = [];
      }
      organized[member.groupName].push(member);
    });
    
    return organized;
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      const tabs = ['grupos', 'territorios', 'lista-grupos'];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-800 text-white px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1 hover:bg-green-700 rounded">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Grupos de Saída de Campo</h1>
            </div>
          </div>
        </header>
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando grupos de campo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1 hover:bg-green-700 rounded">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Grupos de Saída de Campo</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
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
            <MapPin size={16} className="inline mr-2" />
            Status de Territórios
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
            Grupos
          </button>
        </div>
      </div>

      {/* Content */}
      <main 
        className="p-4 max-w-4xl mx-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {activeTab === 'grupos' && (
          <div className="space-y-4">

            {fieldGroups.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Nenhum grupo de campo encontrado
                </h3>
                <p className="text-gray-400">
                  Os grupos de campo serão exibidos aqui quando forem criados no painel administrativo.
                </p>
              </div>
            ) : (
              fieldGroups.map((grupo) => (
                <div key={grupo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3">
                    <h3 className="font-bold">{grupo.name}</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-4">
                      {grupo.meetingTime && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <div>
                            <span className="text-sm font-medium">Horário:</span>
                            <p className="text-sm text-gray-700">{grupo.meetingTime}</p>
                          </div>
                        </div>
                      )}

                      {grupo.territory && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-teal-600" />
                          <div>
                            <span className="text-sm font-medium">Território:</span>
                            <p className="text-sm text-gray-700">{grupo.territory}</p>
                          </div>
                        </div>
                      )}

                      {grupo.meetingLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          <div>
                            <span className="text-sm font-medium">Local de Encontro:</span>
                            <p className="text-sm text-gray-700">{grupo.meetingLocation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'territorios' && (
          <div className="space-y-4">

            {territories.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Nenhum território encontrado
                </h3>
                <p className="text-gray-400">
                  Os territórios serão exibidos aqui quando forem criados no painel administrativo.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {territories.map((territorio) => (
                  <div key={territorio.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white">{territorio.nome}</h3>
                        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded text-white font-mono">
                          {territorio.id}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Responsável:</span>
                          <p className="text-sm font-semibold text-gray-800">{territorio.responsavel || 'Não definido'}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <p className={`text-sm font-semibold ${
                            territorio.status === 'Disponível' ? 'text-green-600' :
                            territorio.status === 'Em andamento' ? 'text-yellow-600' :
                            territorio.status === 'Trabalhado' ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            {territorio.status || 'Não definido'}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-600">Última Visita:</span>
                          <p className="text-sm text-gray-800">{territorio.ultimaVisita || '--'}</p>
                        </div>
                      </div>
                      
                      {territorio.proximaVisita && territorio.proximaVisita !== '--' && territorio.proximaVisita !== '' && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-sm font-medium text-gray-600">Próxima Visita Prevista:</span>
                          <p className="text-sm text-blue-600 font-semibold">{territorio.proximaVisita}</p>
                        </div>
                      )}

                      {territorio.descricao && territorio.descricao.trim() !== '' && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-sm font-medium text-gray-600">Descrição:</span>
                          <p className="text-sm text-gray-700">{territorio.descricao}</p>
                        </div>
                      )}

                      {territorio.observacoes && territorio.observacoes.trim() !== '' && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-sm font-medium text-gray-600">Observações:</span>
                          <p className="text-sm text-gray-700">{territorio.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lista-grupos' && (
          <div className="space-y-4">

            {groupMembers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Nenhum grupo encontrado
                </h3>
                <p className="text-gray-400">
                  Os grupos serão exibidos aqui quando forem criados no painel administrativo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(organizeGroupMembers()).map(([nomeGrupo, membros]) => (
                  <div key={nomeGrupo} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-3">
                      <h3 className="font-bold text-sm">{nomeGrupo}</h3>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-2">
                        {membros
                          .filter(membro => membro.isActive)
                          .map((membro, index) => (
                            <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                              <span className="text-sm text-gray-800">{membro.name}</span>
                              {membro.role && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {membro.role}
                                </span>
                              )}
                            </div>
                          ))}
                        {membros.filter(membro => membro.isActive).length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Nenhum membro ativo neste grupo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default GruposCampo;