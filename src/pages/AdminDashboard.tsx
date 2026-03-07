import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import MeetingModal from '../components/MeetingModal';
import MemberModal from '../components/admin/MemberModal';
import MembersListModal from '../components/admin/MembersListModal';
import Sidebar from '../components/admin/Sidebar';
import MeetingsSection from '../components/admin/MeetingsSection';
import MembersSection from '../components/admin/MembersSection';
import FieldGroupsSection from '../components/admin/FieldGroupsSection';
import DesignacaoSection from '../components/admin/designacao';
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

  const handleDeleteMember = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (confirm(`Tem certeza que deseja excluir ${member ? member.name : 'este membro'}?`)) {
      await dataManager.deleteMember(id);
      await loadData();
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleNewMeeting = () => {
    setEditingMeeting(null);
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
            members={members}
            onNewMember={handleNewMember}
            onViewMembers={handleViewMembers}
          />
        );
      case 'fieldGroups':
        return (
          <FieldGroupsSection members={members} onDataChange={loadData} />
        );
      case 'designacoes':
        return (
          <DesignacaoSection />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-green-700 rounded hover:bg-green-600 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6">
          {loadingError && <div className="text-red-500 mb-4">{loadingError}</div>}
          {renderContent()}
        </main>
      </div>

      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => {
          setShowMeetingModal(false);
          setEditingMeeting(null);
        }}
        onSave={handleSaveMeeting}
        editingMeeting={editingMeeting}
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
        members={members}
        category={selectedCategory}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
};

export default AdminDashboard;