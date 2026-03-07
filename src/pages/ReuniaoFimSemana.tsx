import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import DataManager, { Meeting } from '../utils/dataManager';

const ReuniaoFimSemana = () => {
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
      // Carrega apenas os dados necessários
      await dataManager.getMeetings();
      
      const weekendMeetings = dataManager.getMeetingsByType('fim-semana');
      if (weekendMeetings.length > 0) {
        const now = new Date(); // Data e hora atual real
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const parseDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('/').length === 3 ? dateStr.split('/') : dateStr.split('-');
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        };

        const validMeetings = weekendMeetings
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
              <h1 className="text-lg font-bold">Reunião Fim de Semana</h1>
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
              <h1 className="text-lg font-bold">Reunião Fim de Semana</h1>
            </div>
          </div>
        </header>
        <div className="p-4 text-center">
          <p className="text-gray-600">Nenhuma reunião de fim de semana encontrada.</p>
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
            <h1 className="text-lg font-bold">Reunião Fim de Semana</h1>
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
      <main className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-3 text-center">
            <h2 className="font-bold text-lg">Programação da Reunião de Fim de Semana</h2>
            <p className="text-blue-100">{currentMeeting.date}</p>
            <p className="text-blue-100 text-sm mt-1">Presidente: {currentMeeting.presidente}</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Áudio e Vídeo - Suporte</span>
                    <span>{currentMeeting.audioVideo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Indicador</span>
                    <span>{currentMeeting.indicador}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Indicador de Palco</span>
                    <span>{currentMeeting.indicadorPalco}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Microfone Volante</span>
                    <span>{currentMeeting.microfoneVolante}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Limpeza</span>
                    <span>{currentMeeting.limpeza}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-blue-600 mb-2">• Discurso Público:</h3>
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium text-sm mb-2">{currentMeeting.discursoPublico?.tema}</p>
                <div className="text-sm space-y-1">
                  <div className="flex">
                    <span className="w-24 font-medium">Orador:</span>
                    <span>{currentMeeting.discursoPublico?.orador}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-medium">Congregação:</span>
                    <span>{currentMeeting.discursoPublico?.congregacao}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold text-red-600 mb-2">• A Sentinela:</h3>
              <div className="bg-red-50 p-3 rounded">
                <p className="font-medium text-sm mb-2">{currentMeeting.sentinela?.tema}</p>
                <div className="text-sm space-y-1">
                  <div className="flex">
                    <span className="w-24 font-medium">Dirigente:</span>
                    <span>{currentMeeting.sentinela?.dirigente}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-medium">Leitor:</span>
                    <span>{currentMeeting.sentinela?.leitor}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-700 italic">"{currentMeeting.sentinela?.tema}"</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReuniaoFimSemana;