import {
  supabase,
  isSupabaseConfigured,
  testSupabaseConnection,
} from './supabaseClient';

export interface Meeting {
  id: string;
  date: string;
  type: 'meio-semana' | 'fim-semana';
  presidente: string;
  status: string;
  audioVideo: string;
  indicador: string;
  indicadorPalco: string;
  microfoneVolante: string;
  limpeza: string;

  // Campos específicos para meio-semana
  presidencia?: string;
  canticoInicial?: string;
  oracao?: string;
  comentariosIniciais?: string;
  temaTesouro?: string;
  designadoTesouro?: string;
  joiasEspirituais?: string;
  leituraBiblia?: string;
  ministerio?: Array<{
    tipo: string;
    tempo: string;
    estudante: string;
    ajudante?: string;
  }>;
  canticoMeio?: string;
  responsavelCanticoMeio?: string;
  necessidadesLocais?: {
    tema: string;
    designado: string;
  };
  estudoBiblico?: {
    designado: string;
    ajudante: string;
  };
  comentariosFinais?: string;
  canticoFinal?: string;
  numeroCanticoFinal?: string;

  // Campos específicos para fim-semana
  discursoPublico?: {
    tema: string;
    orador: string;
    congregacao: string;
  };
  sentinela?: {
    tema: string;
    dirigente: string;
    leitor: string;
  };
}

export interface Member {
  id: string;
  name: string;
  category: 'anciaos' | 'servos' | 'publicadores' | string;
  phone?: string;
  email?: string;
  address?: string;
  grupo?:
    | 'Salão Do Reino'
    | 'Jardim Tropical Ville'
    | 'Despraiado'
    | 'Jardim Novo Colorado';
  status?: 'ativo' | 'inativo';
  responsibilities?: string[];
  notes?: string;
}

export interface FieldGroup {
  id: string;
  name: string;
  memberIds: string[];
  territory?: string;
  meetingTime?: string;
  meetingLocation?: string;
}

export interface Assignment {
  id: string;
  name: string;
  category: string;
  description?: string;
  assignedTo?: string;
  date?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface Territory {
  id: string;
  nome: string;
  responsavel: string;
  status: 'Disponível' | 'Em andamento' | 'Trabalhado';
  ultimaVisita: string;
  proximaVisita: string;
  descricao?: string;
  observacoes?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  groupName: string;
  role?: string; // 'S.G' para Servo de Grupo, 'A' para Ancião
  isActive: boolean;
}

class DataManager {
  getAssignmentsFromSupabase() {
    throw new Error('Method not implemented.');
  }
  private static instance: DataManager;
  private useSupabase: boolean = false;
  private connectionTested: boolean = false;

  private constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    if (isSupabaseConfigured()) {
      try {
        const isConnected = await testSupabaseConnection();
        this.useSupabase = isConnected;
        this.connectionTested = true;

        if (isConnected) {
          console.log('Supabase conectado com sucesso!');
        } else {
          console.warn('Supabase configurado mas não foi possível conectar.');
        }
      } catch (error) {
        console.error('Erro ao testar conexão Supabase:', error);
        this.useSupabase = false;
        this.connectionTested = true;
      }
    } else {
      console.warn(
        'Supabase não configurado. Usando localStorage como fallback.'
      );
      this.connectionTested = true;
    }
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Método para verificar se está usando Supabase
  isUsingSupabase(): boolean {
    return this.useSupabase;
  }

  // Método para aguardar a inicialização
  private async waitForInitialization(): Promise<void> {
    while (!this.connectionTested) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Métodos auxiliares para sincronização
  private async syncToSupabase(table: string, data: any[]): Promise<void> {
    await this.waitForInitialization();

    if (!this.useSupabase || !supabase) return;

    try {
      // Primeiro, limpa a tabela
      await supabase.from(table).delete().neq('id', '');

      // Depois, insere os novos dados se houver
      if (data.length > 0) {
        // Para a tabela meetings, agora mantemos os objetos como estão (JSONB nativo)
        const processedData = data.map((item) => {
          const processed = { ...item };

          if (table === 'meetings') {
            // Campos obrigatórios básicos
            processed.audioVideo = processed.audioVideo || '';
            processed.indicador = processed.indicador || '';
            processed.indicadorPalco = processed.indicadorPalco || '';
            processed.microfoneVolante = processed.microfoneVolante || '';
            processed.limpeza = processed.limpeza || '';
            processed.status = processed.status || 'Rascunho';
            processed.presidente = processed.presidente || '';

            // Campos específicos de texto
            processed.presidencia = processed.presidencia || '';
            processed.canticoInicial = processed.canticoInicial || '';
            processed.oracao = processed.oracao || '';
            processed.comentariosIniciais = processed.comentariosIniciais || '';
            processed.temaTesouro = processed.temaTesouro || '';
            processed.designadoTesouro = processed.designadoTesouro || '';
            processed.joiasEspirituais = processed.joiasEspirituais || '';
            processed.leituraBiblia = processed.leituraBiblia || '';
            processed.canticoMeio = processed.canticoMeio || '';
            processed.responsavelCanticoMeio =
              processed.responsavelCanticoMeio || '';
            processed.comentariosFinais = processed.comentariosFinais || '';
            processed.canticoFinal = processed.canticoFinal || '';
            processed.numeroCanticoFinal = processed.numeroCanticoFinal || '';

            // Campos JSONB - mantemos como objetos (Supabase vai converter automaticamente)
            processed.ministerio = processed.ministerio || [];
            processed.necessidadesLocais = processed.necessidadesLocais || {};
            processed.estudoBiblico = processed.estudoBiblico || {};
            processed.discursoPublico = processed.discursoPublico || {};
            processed.sentinela = processed.sentinela || {};
          }

          return processed;
        });

        const { error } = await supabase.from(table).insert(processedData);
        if (error) {
          console.error(`Erro detalhado ao inserir em ${table}:`, error);
          throw error;
        }
      }
    } catch (error) {
      console.error(`Erro ao sincronizar ${table} com Supabase:`, error);
      throw error;
    }
  }

  private async loadFromSupabase(table: string): Promise<any[]> {
    await this.waitForInitialization();

    if (!this.useSupabase || !supabase) return [];

    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`Erro ao carregar ${table} do Supabase:`, error);
        return [];
      }

      // Para meetings, os campos JSONB já vêm como objetos do Supabase
      // Não precisamos fazer parse manual
      return data || [];
    } catch (error) {
      console.error(`Erro ao carregar ${table} do Supabase:`, error);
      return [];
    }
  }

  private getFromLocalStorage(key: string): any[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
      return [];
    }
  }

  private saveToLocalStorage(key: string, data: any[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }

  // Gerenciamento de Reuniões
  async getMeetings(): Promise<Meeting[]> {
    await this.waitForInitialization();

    if (this.useSupabase) {
      try {
        const supabaseData = await this.loadFromSupabase('meetings');
        if (supabaseData.length >= 0) {
          // Salva no localStorage e retorna os dados do Supabase
          this.saveToLocalStorage('meetings', supabaseData);
          return supabaseData;
        }
      } catch (error) {
        console.error('Erro ao carregar reuniões do Supabase:', error);
      }
    }

    // Fallback para localStorage se Supabase não estiver disponível
    return this.getFromLocalStorage('meetings');
  }

  getMeetingsByType(type: 'meio-semana' | 'fim-semana'): Meeting[] {
    const meetings = this.getFromLocalStorage('meetings');
    return meetings.filter((meeting) => meeting.type === type);
  }

  async saveMeetings(meetings: Meeting[]): Promise<void> {
    // SEMPRE salva no localStorage primeiro
    this.saveToLocalStorage('meetings', meetings);

    // Sincroniza com Supabase se disponível
    if (this.useSupabase) {
      try {
        await this.syncToSupabase('meetings', meetings);
      } catch (error) {
        console.error('Erro ao sincronizar reuniões:', error);
        // Não propaga o erro para não quebrar a funcionalidade local
      }
    }
  }

  async addMeeting(meeting: Meeting): Promise<void> {
    const meetings = await this.getMeetings();
    meetings.push(meeting);
    await this.saveMeetings(meetings);
  }

  async updateMeeting(updatedMeeting: Meeting): Promise<void> {
    const meetings = await this.getMeetings();
    const index = meetings.findIndex((m) => m.id === updatedMeeting.id);
    if (index !== -1) {
      meetings[index] = updatedMeeting;
      await this.saveMeetings(meetings);
    }
  }

  async deleteMeeting(id: string): Promise<void> {
    const meetings = await this.getMeetings();
    const filteredMeetings = meetings.filter((m) => m.id !== id);
    await this.saveMeetings(filteredMeetings);
  }

  // Gerenciamento de Membros
  async getMembers(): Promise<Member[]> {
    await this.waitForInitialization();

    if (this.useSupabase) {
      try {
        const supabaseData = await this.loadFromSupabase('members');
        if (supabaseData.length >= 0) {
          this.saveToLocalStorage('members', supabaseData);
          return supabaseData;
        }
      } catch (error) {
        console.error('Erro ao carregar membros do Supabase:', error);
      }
    }

    return this.getFromLocalStorage('members');
  }

  async saveMembers(members: Member[]): Promise<void> {
    this.saveToLocalStorage('members', members);

    if (this.useSupabase) {
      try {
        await this.syncToSupabase('members', members);
      } catch (error) {
        console.error('Erro ao sincronizar membros:', error);
      }
    }
  }

  async addMember(member: Member): Promise<void> {
    const members = await this.getMembers();
    members.push(member);
    await this.saveMembers(members);
  }

  async updateMember(updatedMember: Member): Promise<void> {
    const members = await this.getMembers();
    const index = members.findIndex((m) => m.id === updatedMember.id);
    if (index !== -1) {
      members[index] = updatedMember;
      await this.saveMembers(members);
    }
  }

  async deleteMember(id: string): Promise<void> {
    const members = await this.getMembers();
    const filteredMembers = members.filter((m) => m.id !== id);
    await this.saveMembers(filteredMembers);
  }

  // Gerenciamento de Grupos de Campo
  async getFieldGroups(): Promise<FieldGroup[]> {
    await this.waitForInitialization();

    if (this.useSupabase) {
      try {
        const supabaseData = await this.loadFromSupabase('field_groups');
        if (supabaseData.length >= 0) {
          this.saveToLocalStorage('fieldGroups', supabaseData);
          return supabaseData;
        }
      } catch (error) {
        console.error('Erro ao carregar grupos de campo do Supabase:', error);
      }
    }

    return this.getFromLocalStorage('fieldGroups');
  }

  async saveFieldGroups(fieldGroups: FieldGroup[]): Promise<void> {
    this.saveToLocalStorage('fieldGroups', fieldGroups);

    if (this.useSupabase) {
      try {
        await this.syncToSupabase('field_groups', fieldGroups);
      } catch (error) {
        console.error('Erro ao sincronizar grupos de campo:', error);
      }
    }
  }

  async addFieldGroup(fieldGroup: FieldGroup): Promise<void> {
    const fieldGroups = await this.getFieldGroups();
    fieldGroups.push(fieldGroup);
    await this.saveFieldGroups(fieldGroups);
  }

  async updateFieldGroup(updatedFieldGroup: FieldGroup): Promise<void> {
    const fieldGroups = await this.getFieldGroups();
    const index = fieldGroups.findIndex((fg) => fg.id === updatedFieldGroup.id);
    if (index !== -1) {
      fieldGroups[index] = updatedFieldGroup;
      await this.saveFieldGroups(fieldGroups);
    }
  }

  async deleteFieldGroup(id: string): Promise<void> {
    const fieldGroups = await this.getFieldGroups();
    const filteredFieldGroups = fieldGroups.filter((fg) => fg.id !== id);
    await this.saveFieldGroups(filteredFieldGroups);
  }

  // Gerenciamento de Designações
  async getAssignments(): Promise<Assignment[]> {
    await this.waitForInitialization();

    if (this.useSupabase) {
      try {
        const supabaseData = await this.loadFromSupabase('assignments');
        if (supabaseData.length >= 0) {
          this.saveToLocalStorage('assignments', supabaseData);
          return supabaseData;
        }
      } catch (error) {
        console.error('Erro ao carregar designações do Supabase:', error);
      }
    }

    return this.getFromLocalStorage('assignments');
  }

  async saveAssignments(assignments: Assignment[]): Promise<void> {
    this.saveToLocalStorage('assignments', assignments);

    if (this.useSupabase) {
      try {
        await this.syncToSupabase('assignments', assignments);
      } catch (error) {
        console.error('Erro ao sincronizar designações:', error);
      }
    }
  }

  async addAssignment(assignment: Assignment): Promise<void> {
    const assignments = await this.getAssignments();
    assignments.push(assignment);
    await this.saveAssignments(assignments);
  }

  async updateAssignment(updatedAssignment: Assignment): Promise<void> {
    const assignments = await this.getAssignments();
    const index = assignments.findIndex((a) => a.id === updatedAssignment.id);
    if (index !== -1) {
      assignments[index] = updatedAssignment;
      await this.saveAssignments(assignments);
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    const assignments = await this.getAssignments();
    const filteredAssignments = assignments.filter((a) => a.id !== id);
    await this.saveAssignments(filteredAssignments);
  }

  // Gerenciamento de Territórios
  async getTerritories(): Promise<Territory[]> {
    await this.waitForInitialization();

    if (this.useSupabase) {
      try {
        const supabaseData = await this.loadFromSupabase('territories');
        if (supabaseData.length >= 0) {
          this.saveToLocalStorage('territories', supabaseData);
          return supabaseData;
        }
      } catch (error) {
        console.error('Erro ao carregar territórios do Supabase:', error);
      }
    }

    return this.getFromLocalStorage('territories');
  }

  async saveTerritories(territories: Territory[]): Promise<void> {
    this.saveToLocalStorage('territories', territories);

    if (this.useSupabase) {
      try {
        await this.syncToSupabase('territories', territories);
      } catch (error) {
        console.error('Erro ao sincronizar territórios:', error);
      }
    }
  }

  async addTerritory(territory: Territory): Promise<void> {
    const territories = await this.getTerritories();
    territories.push(territory);
    await this.saveTerritories(territories);
  }

  async updateTerritory(updatedTerritory: Territory): Promise<void> {
    const territories = await this.getTerritories();
    const index = territories.findIndex((t) => t.id === updatedTerritory.id);
    if (index !== -1) {
      territories[index] = updatedTerritory;
      await this.saveTerritories(territories);
    }
  }

  async deleteTerritory(id: string): Promise<void> {
    const territories = await this.getTerritories();
    const filteredTerritories = territories.filter((t) => t.id !== id);
    await this.saveTerritories(filteredTerritories);
  }

  // Gerenciamento de Membros dos Grupos
  async getGroupMembers(): Promise<GroupMember[]> {
    await this.waitForInitialization();

    if (this.useSupabase) {
      try {
        const supabaseData = await this.loadFromSupabase('group_members');
        if (supabaseData.length >= 0) {
          this.saveToLocalStorage('groupMembers', supabaseData);
          return supabaseData;
        }
      } catch (error) {
        console.error(
          'Erro ao carregar membros dos grupos do Supabase:',
          error
        );
      }
    }

    return this.getFromLocalStorage('groupMembers');
  }

  async saveGroupMembers(groupMembers: GroupMember[]): Promise<void> {
    this.saveToLocalStorage('groupMembers', groupMembers);

    if (this.useSupabase) {
      try {
        await this.syncToSupabase('group_members', groupMembers);
      } catch (error) {
        console.error('Erro ao sincronizar membros dos grupos:', error);
      }
    }
  }

  async addGroupMember(groupMember: GroupMember): Promise<void> {
    const groupMembers = await this.getGroupMembers();
    groupMembers.push(groupMember);
    await this.saveGroupMembers(groupMembers);
  }

  async updateGroupMember(updatedGroupMember: GroupMember): Promise<void> {
    const groupMembers = await this.getGroupMembers();
    const index = groupMembers.findIndex(
      (gm) => gm.id === updatedGroupMember.id
    );
    if (index !== -1) {
      groupMembers[index] = updatedGroupMember;
      await this.saveGroupMembers(groupMembers);
    }
  }

  async deleteGroupMember(id: string): Promise<void> {
    const groupMembers = await this.getGroupMembers();
    const filteredGroupMembers = groupMembers.filter((gm) => gm.id !== id);
    await this.saveGroupMembers(filteredGroupMembers);
  }

  async cleanupPastMeetings(): Promise<void> {
    try {
      const allMeetings = await this.getMeetings();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date(0);
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      // Filtra apenas reuniões futuras e do dia atual
      const futureMeetings = allMeetings.filter((meeting) => {
        const meetingDate = parseDate(meeting.date);
        return meetingDate >= today;
      });

      // Se houve mudança, salva apenas as reuniões futuras
      if (futureMeetings.length !== allMeetings.length) {
        await this.saveMeetings(futureMeetings);
        console.log(
          `Limpeza automática: ${
            allMeetings.length - futureMeetings.length
          } reuniões passadas foram removidas.`
        );
      }
    } catch (error) {
      console.error('Erro na limpeza automática de reuniões:', error);
    }
  }

  // Método para sincronização manual
  async syncAllData(): Promise<void> {
    await this.waitForInitialization();

    if (!this.useSupabase) {
      throw new Error('Supabase não está configurado ou conectado');
    }

    try {
      // Executa limpeza antes da sincronização
      await this.cleanupPastMeetings();

      const meetings = this.getFromLocalStorage('meetings');
      const members = this.getFromLocalStorage('members');
      const fieldGroups = this.getFromLocalStorage('fieldGroups');
      const assignments = this.getFromLocalStorage('assignments');
      const territories = this.getFromLocalStorage('territories');
      const groupMembers = this.getFromLocalStorage('groupMembers');

      await Promise.all([
        this.syncToSupabase('meetings', meetings),
        this.syncToSupabase('members', members),
        this.syncToSupabase('field_groups', fieldGroups),
        this.syncToSupabase('assignments', assignments),
        this.syncToSupabase('territories', territories),
        this.syncToSupabase('group_members', groupMembers),
      ]);

      console.log('Sincronização completa realizada com sucesso!');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }

  // Método para carregar todos os dados da nuvem
  async loadAllDataFromCloud(): Promise<void> {
    await this.waitForInitialization();

    if (!this.useSupabase) return;

    try {
      const [
        meetings,
        members,
        fieldGroups,
        assignments,
        territories,
        groupMembers,
      ] = await Promise.all([
        this.loadFromSupabase('meetings'),
        this.loadFromSupabase('members'),
        this.loadFromSupabase('field_groups'),
        this.loadFromSupabase('assignments'),
        this.loadFromSupabase('territories'),
        this.loadFromSupabase('group_members'),
      ]);

      // Salva todos os dados carregados no localStorage
      this.saveToLocalStorage('meetings', meetings);
      this.saveToLocalStorage('members', members);
      this.saveToLocalStorage('fieldGroups', fieldGroups);
      this.saveToLocalStorage('assignments', assignments);
      this.saveToLocalStorage('territories', territories);
      this.saveToLocalStorage('groupMembers', groupMembers);

      // Executa limpeza automática após carregar os dados
      await this.cleanupPastMeetings();

      console.log('Dados carregados da nuvem com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados da nuvem:', error);
      // Não propaga o erro para não quebrar a funcionalidade
    }
  }
}

export default DataManager;
