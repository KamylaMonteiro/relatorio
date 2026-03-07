import React, { useState } from 'react';
import { Meeting } from '../../utils/dataManager';

interface HistorySectionProps {
  historicalMeetings: Meeting[];
}

const HistorySection: React.FC<HistorySectionProps> = ({ historicalMeetings }) => {
  const [historyFilterDate, setHistoryFilterDate] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState<'all' | 'meio-semana' | 'fim-semana'>('all');

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.includes('/')
      ? dateStr.split('/')
      : dateStr.split('-').reverse();
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const filteredHistoricalMeetings = historicalMeetings.filter(meeting => {
    const meetingDate = parseDate(meeting.date);
    const filterDate = historyFilterDate ? parseDate(historyFilterDate) : null;
    const matchesDate = !filterDate || (meetingDate && meetingDate.toDateString() === filterDate?.toDateString());
    const matchesType = historyFilterType === 'all' || meeting.type === historyFilterType;
    return matchesDate && matchesType;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Histórico das Reuniões Passadas</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Data</label>
            <input
              type="date"
              value={historyFilterDate}
              onChange={(e) => setHistoryFilterDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Tipo</label>
            <select
              value={historyFilterType}
              onChange={(e) => setHistoryFilterType(e.target.value as 'all' | 'meio-semana' | 'fim-semana')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="meio-semana">Meio de Semana</option>
              <option value="fim-semana">Fim de Semana</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presidente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistoricalMeetings.map((meeting) => (
              <tr 
                key={meeting.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  alert(`Detalhes da Reunião:\nData: ${meeting.date}\nTipo: ${meeting.type === 'meio-semana' ? 'Meio de Semana' : 'Fim de Semana'}\nPresidente: ${meeting.presidente}\nStatus: ${meeting.status}`);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {meeting.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    meeting.type === 'meio-semana' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {meeting.type === 'meio-semana' ? 'Meio de Semana' : 'Fim de Semana'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {meeting.presidente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {meeting.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHistoricalMeetings.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Nenhum histórico de reunião encontrado com os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySection;