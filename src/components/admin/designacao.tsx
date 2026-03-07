import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import DataManager, { Assignment } from '../../utils/dataManager';

// Define o tipo para o estado de salvamento por item
interface SavingState {
  [key: string]: boolean;
}

const DesignacaoSection = () => {
  const dataManager = DataManager.getInstance();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAssignments, setSavingAssignments] = useState<SavingState>({});

  // Estados para as listas
  const [lists, setLists] = useState({
    AcSer: [] as Assignment[],
    Ac: [] as Assignment[],
    PubM: [] as Assignment[],
    PubF: [] as Assignment[],
  });

  // Ref para armazenar timeouts de debounce
  const debounceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedAssignments = await dataManager.getAssignments();
      console.log('Dados carregados do DataManager:', loadedAssignments);
      setAssignments(loadedAssignments || []);

      // Organiza as designações por categoria
      const organizedLists = {
        AcSer: loadedAssignments.filter((a) => a.category === 'AcSer'),
        Ac: loadedAssignments.filter((a) => a.category === 'Ac'),
        PubM: loadedAssignments.filter((a) => a.category === 'PubM'),
        PubF: loadedAssignments.filter((a) => a.category === 'PubF'),
      };
      console.log('Listas organizadas:', organizedLists);
      setLists(organizedLists);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Erro ao carregar designações. Os dados locais serão mantidos.');
      // Não limpa assignments ou lists para evitar perda de dados
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
      setSavingAssignments((prev) => ({
        ...prev,
        [`${newAssignment.id}-${category}`]: true,
      }));
      await dataManager.addAssignment(newAssignment);
      // Atualiza o estado local diretamente
      setAssignments((prev) => [...prev, newAssignment]);
      setLists((prevLists) => ({
        ...prevLists,
        [category]: [
          ...prevLists[category as keyof typeof prevLists],
          newAssignment,
        ],
      }));
      console.log(
        `Adicionado assignment com ID ${newAssignment.id} na categoria ${category}`
      );
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Erro ao adicionar designação');
    } finally {
      setSavingAssignments((prev) => ({
        ...prev,
        [`${newAssignment.id}-${category}`]: false,
      }));
    }
  };

  const handleDeleteAssignment = async (id: string, category: string) => {
    try {
      setSavingAssignments((prev) => ({
        ...prev,
        [`${id}-${category}`]: true,
      }));
      await dataManager.deleteAssignment(id);
      // Atualiza o estado local diretamente
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setLists((prevLists) => ({
        ...prevLists,
        [category]: prevLists[category as keyof typeof prevLists].filter(
          (a) => a.id !== id
        ),
      }));
      console.log(`Removido assignment com ID ${id} da categoria ${category}`);
      // Verifica se a exclusão foi persistida no Supabase
      if (dataManager.isUsingSupabase()) {
        const supabaseAssignments =
          await dataManager.getAssignmentsFromSupabase();
        if (supabaseAssignments.some((a) => a.id === id)) {
          throw new Error('Item ainda presente no Supabase após exclusão');
        }
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Erro ao excluir designação. Tente novamente.');
      // Reverte a exclusão no estado local para manter consistência
      await loadAssignments();
    } finally {
      setSavingAssignments((prev) => ({
        ...prev,
        [`${id}-${category}`]: false,
      }));
    }
  };

  // Função otimizada para atualizar nome com debounce manual
  const handleNameChange = useCallback(
    (id: string, category: string, value: string) => {
      // Atualiza o estado local imediatamente para responsividade
      setLists((prevLists) => ({
        ...prevLists,
        [category]: prevLists[category as keyof typeof prevLists].map(
          (assignment) =>
            assignment.id === id ? { ...assignment, name: value } : assignment
        ),
      }));

      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === id ? { ...assignment, name: value } : assignment
        )
      );

      // Limpa o timeout anterior se existir
      const timeoutKey = `${id}-${category}`;
      if (debounceTimeouts.current[timeoutKey]) {
        clearTimeout(debounceTimeouts.current[timeoutKey]);
      }

      // Cria novo timeout para salvar no banco após 800ms
      debounceTimeouts.current[timeoutKey] = setTimeout(async () => {
        try {
          setSavingAssignments((prev) => ({ ...prev, [timeoutKey]: true }));
          await dataManager.updateAssignment({ id, name: value, category });
          console.log(
            `Atualizado assignment com ID ${id} na categoria ${category} com nome ${value}`
          );
        } catch (error) {
          console.error('Error updating assignment:', error);
          alert('Erro ao atualizar designação');
          // Reverte apenas o item afetado
          setLists((prevLists) => ({
            ...prevLists,
            [category]: prevLists[category as keyof typeof prevLists].map(
              (assignment) =>
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

  // Cleanup dos timeouts quando o componente é desmontado
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const renderList = (category: string, title: string) => (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button
          onClick={() => handleAddAssignment(category)}
          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <Plus size={12} />
          Adicionar
        </button>
      </div>
      <ul className="space-y-1">
        {lists[category as keyof typeof lists].map((assignment) => (
          <li
            key={assignment.id}
            className="flex items-center gap-1 bg-gray-50 p-1 rounded"
          >
            <input
              type="text"
              value={assignment.name}
              onChange={(e) =>
                handleNameChange(assignment.id, category, e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder={`Nome para ${title}`}
              autoComplete="off"
              spellCheck="false"
              disabled={savingAssignments[`${assignment.id}-${category}`]}
            />
            {savingAssignments[`${assignment.id}-${category}`] && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></span>
            )}
            <button
              onClick={() => handleDeleteAssignment(assignment.id, category)}
              className="text-red-600 hover:text-red-800 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                isLoading || savingAssignments[`${assignment.id}-${category}`]
              }
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadAssignments}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderList('AcSer', 'AcSer')}
        {renderList('Ac', 'Ac')}
        {renderList('PubM', 'PubM')}
        {renderList('PubF', 'PubF')}
      </div>
    </div>
  );
};

export default DesignacaoSection;
