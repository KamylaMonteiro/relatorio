import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, User, Users, RefreshCw, AlertCircle } from 'lucide-react';
import DataManager, { Assignment } from '../../utils/dataManager';

interface SavingState {
  [key: string]: boolean;
}

interface CategoryConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  headerBg: string;
  accentColor: string;
  badgeColor: string;
  placeholder: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'AcSer',
    label: 'AcSer',
    description: '',
    icon: <User size={18} />,
    color: 'emerald',
    headerBg: 'from-emerald-600 to-emerald-700',
    accentColor: 'ring-emerald-500 border-emerald-300 focus:border-emerald-500',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    placeholder: '',
  },
  {
    id: 'Ac',
    label: 'Ac',
    description: '',
    icon: <User size={18} />,
    color: 'sky',
    headerBg: 'from-sky-600 to-sky-700',
    accentColor: 'ring-sky-500 border-sky-300 focus:border-sky-500',
    badgeColor: 'bg-sky-100 text-sky-800',
    placeholder: '',
  },
  {
    id: 'PubM',
    label: 'PubM',
    description: '',
    icon: <User size={18} />,
    color: 'violet',
    headerBg: 'from-violet-600 to-violet-700',
    accentColor: 'ring-violet-500 border-violet-300 focus:border-violet-500',
    badgeColor: 'bg-violet-100 text-violet-800',
    placeholder: '',
  },
  {
    id: 'PubF',
    label: 'PubF',
    description: '',
    icon: <User size={18} />,
    color: 'rose',
    headerBg: 'from-rose-500 to-rose-600',
    accentColor: 'ring-rose-500 border-rose-300 focus:border-rose-500',
    badgeColor: 'bg-rose-100 text-rose-800',
    placeholder: '',
  },
];

const DesignacaoSection = () => {
  const dataManager = DataManager.getInstance();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAssignments, setSavingAssignments] = useState<SavingState>({});

  const [lists, setLists] = useState({
    AcSer: [] as Assignment[],
    Ac: [] as Assignment[],
    PubM: [] as Assignment[],
    PubF: [] as Assignment[],
  });

  const debounceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedAssignments = await dataManager.getAssignments();
      setAssignments(loadedAssignments || []);
      setLists({
        AcSer: loadedAssignments.filter((a) => a.category === 'AcSer'),
        Ac: loadedAssignments.filter((a) => a.category === 'Ac'),
        PubM: loadedAssignments.filter((a) => a.category === 'PubM'),
        PubF: loadedAssignments.filter((a) => a.category === 'PubF'),
      });
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Erro ao carregar designações. Os dados locais serão mantidos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignment = async (category: string) => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      name: '',
      category,
    };
    try {
      setSavingAssignments((prev) => ({ ...prev, [`${newAssignment.id}-${category}`]: true }));
      await dataManager.addAssignment(newAssignment);
      setAssignments((prev) => [...prev, newAssignment]);
      setLists((prevLists) => ({
        ...prevLists,
        [category]: [...prevLists[category as keyof typeof prevLists], newAssignment],
      }));
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Erro ao adicionar designação');
    } finally {
      setSavingAssignments((prev) => ({ ...prev, [`${newAssignment.id}-${category}`]: false }));
    }
  };

  const handleDeleteAssignment = async (id: string, category: string) => {
    // Atualiza a UI imediatamente (Optimistic UI update) para exclusão direta
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setLists((prevLists) => ({
      ...prevLists,
      [category]: prevLists[category as keyof typeof prevLists].filter((a) => a.id !== id),
    }));

    try {
      setSavingAssignments((prev) => ({ ...prev, [`${id}-${category}`]: true }));
      await dataManager.deleteAssignment(id);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      // Fallback: se der erro recarrega os dados para não ficar inconsistente sem alertar o usuário
      await loadAssignments();
    } finally {
      setSavingAssignments((prev) => ({ ...prev, [`${id}-${category}`]: false }));
    }
  };

  const handleNameChange = useCallback(
    (id: string, category: string, value: string) => {
      setLists((prevLists) => ({
        ...prevLists,
        [category]: prevLists[category as keyof typeof prevLists].map((assignment) =>
          assignment.id === id ? { ...assignment, name: value } : assignment
        ),
      }));
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === id ? { ...assignment, name: value } : assignment
        )
      );

      const timeoutKey = `${id}-${category}`;
      if (debounceTimeouts.current[timeoutKey]) {
        clearTimeout(debounceTimeouts.current[timeoutKey]);
      }

      debounceTimeouts.current[timeoutKey] = setTimeout(async () => {
        try {
          setSavingAssignments((prev) => ({ ...prev, [timeoutKey]: true }));
          await dataManager.updateAssignment({ id, name: value, category });
        } catch (error) {
          console.error('Error updating assignment:', error);
          alert('Erro ao atualizar designação');
          setLists((prevLists) => ({
            ...prevLists,
            [category]: prevLists[category as keyof typeof prevLists].map((assignment) =>
              assignment.id === id ? { ...assignment, name: '' } : assignment
            ),
          }));
          setAssignments((prev) =>
            prev.map((assignment) =>
              assignment.id === id ? { ...assignment, name: '' } : assignment
            )
          );
        } finally {
          setSavingAssignments((prev) => ({ ...prev, [timeoutKey]: false }));
          delete debounceTimeouts.current[timeoutKey];
        }
      }, 800);
    },
    [dataManager]
  );

  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const renderCard = (config: CategoryConfig) => {
    const items = lists[config.id as keyof typeof lists];
    const isSaving = Object.entries(savingAssignments).some(
      ([key, val]) => key.endsWith(`-${config.id}`) && val
    );

    return (
      <div
        key={config.id}
        className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-lg transition-shadow duration-200"
      >
        {/* Card Header */}
        <div className={`bg-gradient-to-br ${config.headerBg} px-5 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm text-white rounded-xl p-2">
                {config.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">{config.label}</h3>
                <p className="text-white/70 text-xs mt-0.5">{config.description}</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white`}>
              {items.length} {items.length === 1 ? 'pessoa' : 'pessoas'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col gap-0 flex-1 p-4">
          {/* List */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <Users size={32} className="mb-2" />
              <p className="text-sm">Nenhuma pessoa cadastrada</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((assignment, idx) => {
                const key = `${assignment.id}-${config.id}`;
                const isSavingItem = savingAssignments[key];
                return (
                  <li
                    key={assignment.id}
                    className="group flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors duration-150"
                  >
                    <span className="text-xs font-bold text-gray-300 w-5 text-center select-none">
                      {idx + 1}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={assignment.name}
                        onChange={(e) => handleNameChange(assignment.id, config.id, e.target.value)}
                        className={`w-full bg-white border rounded-lg px-3 py-1.5 text-sm text-gray-700
                          placeholder-gray-300 outline-none focus:ring-2 transition-all duration-150
                          ${config.accentColor}
                          ${isSavingItem ? 'opacity-60' : ''}
                        `}
                        placeholder={config.placeholder}
                        autoComplete="off"
                        spellCheck={false}
                        disabled={isSavingItem}
                      />
                      {isSavingItem && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2">
                          <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-green-500 rounded-full" />
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id, config.id)}
                      disabled={isLoading || isSavingItem}
                      title="Remover"
                      className="flex-shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150 disabled:pointer-events-none"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Add Button */}
          <button
            onClick={() => handleAddAssignment(config.id)}
            disabled={isLoading || isSaving}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 mt-4 rounded-xl text-sm font-medium border-2 border-dashed
              border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600
              disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50`}
          >
            <Plus size={15} />
            Adicionar pessoa
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-green-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando designações...</p>
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
          <button
            onClick={loadAssignments}
            className="flex items-center gap-2 mt-1 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const totalAssignments = assignments.length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Designações</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              {totalAssignments} {totalAssignments === 1 ? 'pessoa registrada' : 'pessoas registradas'}
            </span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CATEGORIES.map((config) => renderCard(config))}
      </div>
    </div>
  );
};

export default DesignacaoSection;
