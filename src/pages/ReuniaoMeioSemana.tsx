import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import DataManager, { Meeting } from '../utils/dataManager';
const ReuniaoMeioSemana = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setIsLoading(true);
    try {
      await dataManager.getMeetings();
      
      const midweekMeetings = dataManager.getMeetingsByType('meio-semana');
      if (midweekMeetings.length > 0) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
       
        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('/').map(Number);
          return new Date(year, month - 1, day, 0, 0, 0, 0);
        };
        const validMeetings = midweekMeetings
          .map(meeting => ({
            ...meeting,
            dateObj: parseDate(meeting.date),
          }))
          .filter(meeting => meeting.dateObj && meeting.dateObj >= today)
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        setMeetings(validMeetings);
       
        if (validMeetings.length > 0) {
          setSelectedDate(validMeetings[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const currentMeeting = meetings.find(m => m.id === selectedDate);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-800 text-white px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1 hover:bg-green-700 rounded">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Reunião Meio de Semana</h1>
            </div>
          </div>
        </header>
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando reuniões...</p>
        </div>
      </div>
    );
  }
  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-800 text-white px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1 hover:bg-green-700 rounded">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="text-lg font-bold">Reunião Meio de Semana</h2>
            </div>
          </div>
        </header>
        <div className="p-4 text-center">
          <p className="text-gray-600">Nenhuma reunião de meio de semana encontrada.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1 hover:bg-green-700 rounded">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Reunião Meio de Semana</h1>
          </div>
        </div>
      </header>
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-600" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
          >
            {meetings.map((meeting) => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.date}
              </option>
            ))}
          </select>
        </div>
      </div>
      <main className="p-4 max-w-4xl mx-auto space-y-4">
        <section className="bg-blue-50 rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3">
            <h2 className="font-bold">PRESIDÊNCIA</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Áudio e Vídeo - Suporte</span>
                  <span className="ml-2 font-medium">{currentMeeting.audioVideo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Indicador</span>
                  <span className="ml-2 font-medium">{currentMeeting.indicador}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Indicador de Palco</span>
                  <span className="ml-2 font-medium">{currentMeeting.indicadorPalco}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Microfone Volante</span>
                  <span className="ml-2 font-medium">{currentMeeting.microfoneVolante}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Limpeza</span>
                  <span className="ml-2 font-medium">{currentMeeting.limpeza}</span>
                </div>
              </div>
            </div>
            <hr className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Presidente</span>
                <span className="ml-2 font-medium">{currentMeeting.presidencia}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Cântico {currentMeeting.canticoInicial} e oração (5 min)</span>
                <span className="ml-2 font-medium">{currentMeeting.oracao}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Comentários iniciais (1 min)</span>
                <span className="ml-2 font-medium">{currentMeeting.comentariosIniciais}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 rounded-lg overflow-hidden">
          <div className="bg-[#656164] text-white px-1 py-0.09 flex items-center gap-0.5">
            <img src="https://congregacao.tpe.net.br/imagens/rms20.jpg" alt="Diamante" style={{ maxWidth: '50px', marginRight: '' }} />
            <h2 className="font-bold">TESOUROS DA PALAVRA DE DEUS</h2>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{currentMeeting.temaTesouro} (10 min)</span>
              <span className="ml-2 font-medium">{currentMeeting.designadoTesouro}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Joias espirituais (10 min)</span>
              <span className="ml-2 font-medium">{currentMeeting.joiasEspirituais}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Leitura da Bíblia (4 min)</span>
              <span className="ml-2 font-medium">{currentMeeting.leituraBiblia}</span>
            </div>
          </div>
        </section>
        <section className="bg-yellow-50 rounded-lg overflow-hidden">
          <div className="bg-[#a56803] text-white px-1 py-0.09 flex items-center gap-0.5">
            <img src="https://congregacao.tpe.net.br/imagens/rms30.jpg" alt="Imagem Ministério" style={{ maxWidth: '50px', marginRight: '' }} />
            <h2 className="font-bold">FAÇA SEU MELHOR NO MINISTÉRIO</h2>
          </div>
          <div className="p-4 space-y-3">
            {currentMeeting.ministerio?.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-sm">{item.tipo}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.tempo} min)</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium"> {item.estudante}</span>
                  </div>
                  {item.ajudante && (
                    <div className="flex items-center">
                      <span className="font-medium">Ajudante: {item.ajudante}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-red-50 rounded-lg overflow-hidden">
          <div className="bg-[#99131e] text-white px-1 py-0.09 flex items-center gap-0.5">
            <img src="https://congregacao.tpe.net.br/imagens/rms40.jpg" alt="Imagem Vida Cristã" style={{ maxWidth: '50px', marginRight: '' }} />
            <h2 className="font-bold">NOSSA VIDA CRISTÃ</h2>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Cântico {currentMeeting.canticoMeio} (5 min)</span>
              <span className="ml-2 font-medium">{currentMeeting.responsavelCanticoMeio || ''}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{currentMeeting.necessidadesLocais?.tema}</span>
                  <span className="text-xs text-gray-500 ml-2">(15 min)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="font-medium"> {currentMeeting.necessidadesLocais?.designado}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">Estudo Bíblico de Congregação</span>
                  <span className="text-xs text-gray-500 ml-2">(30 min)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="font-medium"> {currentMeeting.estudoBiblico?.designado}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Leitor: {currentMeeting.estudoBiblico?.ajudante}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Comentários finais (3 min)</span>
              <span className="ml-2 font-medium">{currentMeeting.comentariosFinais}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Cântico   {currentMeeting.canticoFinal} e oração (5 min)</span>
              <span className="ml-2 font-medium">{currentMeeting.numeroCanticoFinal}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
export default ReuniaoMeioSemana;