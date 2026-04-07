import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import MeetingModal from '../components/MeetingModal';
import MemberModal from '../components/admin/MemberModal';
import MembersListModal from '../components/admin/MembersListModal';
import Sidebar from '../components/admin/Sidebar';
import MeetingsSection from '../components/admin/MeetingsSection';
import MembersSection from '../components/admin/MembersSection';
import FieldGroupsSection from '../components/admin/FieldGroupsSection';
import DesignacaoSection from '../components/admin/designacao';
import ReportsSection from '../components/admin/ReportsSection';
import DataManager, { Meeting, Member } from '../utils/dataManager';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('meetings');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'anciaos' | 'servos' | 'publicadores' | string>('anciaos');
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMemberCategory, setNewMemberCategory] = useState<string | undefined>(undefined);

  const dataManager = DataManager.getInstance();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Primeiro, tenta carregar dados da nuvem
      await dataManager.loadAllDataFromCloud();

      const loadedMeetings = await dataManager.getMeetings() || [];
      const now = new Date(); // Data e hora atual real
      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date(0);
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      const meetingsWithDates = loadedMeetings.map(meeting => ({
        ...meeting,
        dateObj: parseDate(meeting.date),
      }));

      // Filtra reuniões futuras e do dia atual
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const futureMeetings = meetingsWithDates.filter(meeting => meeting.dateObj >= today);
      setMeetings(futureMeetings);

      const loadedMembers = await dataManager.getMembers() || [];
      setMembers(loadedMembers);
      setLoadingError(null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoadingError('Falha ao carregar dados. Verifique o console para detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const handleSaveMeeting = async (meeting: Meeting) => {
    try {
      if (editingMeeting && editingMeeting.id) {
        await dataManager.updateMeeting({ ...meeting, id: editingMeeting.id });
      } else {
        await dataManager.addMeeting({ ...meeting, id: Date.now().toString() });
      }
      await loadData();
      setShowMeetingModal(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error saving meeting:', error);
      setLoadingError('Falha ao salvar reunião. Verifique o console.');
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta reunião?')) {
      await dataManager.deleteMeeting(id);
      await loadData();
    }
  };

  const handleSaveMember = async (memberData: Partial<Member>) => {
    try {
      if (editingMember) {
        await dataManager.updateMember({ ...editingMember, ...memberData });
        setEditingMember(null);
      } else if (memberData.name) {
        await dataManager.addMember({
          id: Date.now().toString(),
          name: memberData.name,
          category: memberData.category || 'publicadores',
          phone: memberData.phone || '',
          email: memberData.email || '',
          address: memberData.address || '',
          grupo: memberData.grupo,
          status: memberData.status,
          responsibilities: memberData.responsibilities || [],
          notes: memberData.notes || '',
          codigo_acesso: memberData.codigo_acesso || '',
          is_report_user: false,
        });
      }
      await loadData();
      setShowNewMemberModal(false);
      setNewMemberCategory(undefined);
    } catch (error) {
      console.error('Error saving member:', error);
      setLoadingError('Falha ao salvar membro. Verifique o console.');
    }
  };

  const handleDeleteMember = async () => {
    // Deletion + confirmation is handled inside MembersListModal - just refresh data here
    await loadData();
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowMeetingModal(true);
  };



  const handleNewMember = (category?: string) => {
    setEditingMember(null);
    setNewMemberCategory(category);
    setShowNewMemberModal(true);
  };

  const handleViewMembers = (category: 'anciaos' | 'servos' | 'publicadores' | string) => {
    setSelectedCategory(category);
    setShowMembersModal(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMembersModal(false);
    setShowNewMemberModal(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'meetings':
        return (
          <MeetingsSection
            meetings={meetings}
            onEditMeeting={handleEditMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            onUpdateMeetings={loadData}
          />
        );
      case 'members':
        return (
          <MembersSection
            members={members.filter(m => m.is_report_user !== true)}
            onNewMember={handleNewMember}
            onViewMembers={handleViewMembers}
          />
        );
      case 'fieldGroups':
        return (
          <FieldGroupsSection onDataChange={loadData} />
        );
      case 'designacoes':
        return (
          <DesignacaoSection />
        );
      case 'relatorios':
        return (
          <ReportsSection />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-emerald-700 text-white px-6 py-3.5 shadow-md flex-shrink-0">
        <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">Painel Administrativo</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all border border-white/10"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {loadingError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {loadingError}
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => {
          setShowMeetingModal(false);
          setEditingMeeting(null);
        }}
        onSave={handleSaveMeeting as any}
        editingMeeting={editingMeeting as any}
        getCombinedAssignments={() => {
          // Mock implementation or fetch from dataManager if available
          return [];
        }}
        filterNames={(names, searchText) => {
          return names.filter(n => n.toLowerCase().includes(searchText.toLowerCase()));
        }}
      />

      <MemberModal
        isOpen={showNewMemberModal}
        onClose={() => {
          setShowNewMemberModal(false);
          setEditingMember(null);
          setNewMemberCategory(undefined);
        }}
        onSave={handleSaveMember}
        editingMember={editingMember}
        defaultCategory={newMemberCategory}
      />

      <MembersListModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={members.filter(m => m.is_report_user !== true)}
        category={selectedCategory}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
};

export default AdminDashboard;