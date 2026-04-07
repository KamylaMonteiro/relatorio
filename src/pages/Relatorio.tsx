import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Lock, Calendar, Clock, BookOpen, ChevronRight } from 'lucide-react';
import DataManager, { Member, Report } from '../utils/dataManager';

const Relatorio = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [horasTrabalhadas, setHorasTrabalhadas] = useState('');
  const [estudoBiblico, setEstudoBiblico] = useState('0');
  const [ativo, setAtivo] = useState('Sim');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const dataManager = DataManager.getInstance();
      const members = await dataManager.getMembers();
      const foundMember = members.find(
        (m) => m.codigo_acesso === accessCode.trim() && m.codigo_acesso && m.codigo_acesso.trim() !== ''
      );
      if (foundMember) {
        setMember(foundMember);
      } else {
        setError('Código de acesso inválido ou não encontrado.');
      }
    } catch {
      setError('Erro ao verificar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setLoading(true);
    setError('');
    try {
      const dataManager = DataManager.getInstance();
      const newReport: Report = {
        id: crypto.randomUUID(),
        member_id: member.id,
        member_name: member.name,
        month: selectedMonth,
        horas_trabalhadas: isPioneiro ? Number(horasTrabalhadas.replace(',', '.')) : undefined,
        estudo_biblico: estudoBiblico,
        ativo: !isPioneiro ? ativo : undefined,
        created_at: new Date().toISOString()
      };
      await dataManager.addReport(newReport);
      setSuccess(true);
    } catch {
      setError('Erro ao enviar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isPioneiro = member?.category.toLowerCase().includes('pioneiro');

  const getMonths = () => {
    const months = [];
    const d = new Date();
    for (let i = 0; i < 2; i++) {
      const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const val = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const labelDt = new Date(dt.getFullYear(), dt.getMonth(), 15);
      const label = labelDt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return months;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatório Enviado!</h2>
          <p className="text-gray-500 mb-1">Obrigado, <span className="font-semibold text-green-700">{member?.name}</span>.</p>
          <p className="text-gray-400 text-sm mb-8">Seu relatório foi recebido com sucesso e está sendo processado.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-green-800 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1 hover:bg-green-700 rounded transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Relatório de Serviço de Campo</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {!member ? (
          /* ── ACCESS CODE SCREEN ── */
          <div className="space-y-6">
            {/* Hero card */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Lock size={26} className="text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Acesso ao Relatório</h2>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código de Acesso
                  </label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-lg tracking-widest text-center text-gray-800 transition-colors"
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !accessCode.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Verificando...
                    </>
                  ) : (
                    <>
                      Acessar Relatório
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ── REPORT FORM SCREEN ── */
          <div className="space-y-5">
            {/* Member greeting card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{member.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {/* Always show the category */}
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    {member.category}
                  </span>
                  {/* Also show any extra tags if present */}
                  {member.responsibilities && member.responsibilities.length > 0 && member.responsibilities.map((tag, idx) => (
                    <span key={idx} className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleSubmitReport} className="space-y-5">
                {/* Month */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Calendar size={14} className="text-green-600" />
                    Mês do Relatório
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 bg-white transition-colors"
                    required
                  >
                    <option value="" disabled>Selecione o mês...</option>
                    {getMonths().map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {selectedMonth && (
                  <>
                    {/* Pioneiro: hours */}
                    {isPioneiro ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <Clock size={14} className="text-green-600" />
                          Horas Trabalhadas
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={horasTrabalhadas}
                            onChange={(e) => {
                              // Mask: only digits, auto-insert comma after 2 digits → format: 00,00
                              const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                              if (raw.length <= 2) {
                                setHorasTrabalhadas(raw);
                              } else {
                                setHorasTrabalhadas(raw.slice(0, raw.length - 2) + ',' + raw.slice(-2));
                              }
                            }}
                            onBlur={() => {
                              if (horasTrabalhadas) {
                                const raw = horasTrabalhadas.replace(/[^0-9]/g, '').padStart(4, '0');
                                setHorasTrabalhadas(raw.slice(0, 2) + ',' + raw.slice(2));
                              }
                            }}
                            placeholder="00,00"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 font-mono text-lg transition-colors pr-12"
                            required
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">hrs</span>
                        </div>
                      </div>
                    ) : (
                      /* Non-pioneer: active field */
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Participou no ministério este mês?
                        </label>
                        <div className="flex gap-3">
                          {['Sim', 'Não'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAtivo(opt)}
                              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${ativo === opt
                                ? opt === 'Sim'
                                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                  : 'bg-red-500 text-white border-red-500 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              {opt === 'Sim' ? '✓ Sim' : '✗ Não'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bible studies */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-green-600" />
                        Estudos Bíblicos
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEstudoBiblico(prev => String(Math.max(0, Number(prev) - 1)))}
                          className="w-11 h-11 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-xl hover:bg-gray-50 transition-colors flex-shrink-0"
                        >−</button>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={estudoBiblico}
                          onChange={(e) => setEstudoBiblico(e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-xl font-bold text-gray-800 transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setEstudoBiblico(prev => String(Number(prev) + 1))}
                          className="w-11 h-11 rounded-xl border-2 border-green-200 text-green-600 font-bold text-xl hover:bg-green-50 transition-colors flex-shrink-0"
                        >+</button>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedMonth}
                  className="w-full bg-green-600 text-white py-3.5 px-4 rounded-xl hover:bg-green-700 transition-all font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Enviar Relatório
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Relatorio;
