import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Heart, Map, Key, FileText } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigation = (section) => {
    // Redireciona para a seção correspondente
    switch (section) {
      case 'Login':
        navigate('/login');
        break;
      case 'Reunião Meio de Semana':
        navigate('/reuniao-meio-semana');
        break;
      case 'Reunião Fim de Semana':
        navigate('/reuniao-fim-semana');
        break;
      case 'Donativos':
        navigate('/donativos');
        break;
      case 'Grupos de Campo':
        navigate('/grupos-de-campo');
        break;
      case 'Relatório':
        navigate('/relatorio');
        break;
      default:
        alert(`Navegando para: ${section} (não implementado)`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white px-4 py-6 relative">
        <button 
          onClick={() => handleNavigation('Login')}
          className="absolute top-4 right-4 p-2 hover:bg-green-700 rounded-full transition-colors"
          title="Acesso Administrativo"
        >
          <Key size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">QUADRO DE ANÚNCIOS</h1>
          <p className="text-green-200">CONGREGAÇÃO RIBEIRÃO DO LIPA</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Reunião Meio de Semana */}
          <div 
            onClick={() => handleNavigation('Reunião Meio de Semana')}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="h-48 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center p-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/80 via-blue-400/80 to-purple-500/80"></div>
              <img 
                src="https://cms-imgp.jw-cdn.org/img/p/501400106/univ/art/501400106_univ_lsr_lg.jpg"
                alt="Reunião Meio de Semana"
                className="max-w-full max-h-full object-contain rounded relative z-10 drop-shadow-lg"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="p-4 bg-green-700 text-white">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <h3 className="font-semibold">Reunião Meio de Semana</h3>
              </div>
            </div>
          </div>

          {/* Reunião Fim de Semana */}
          <div 
            onClick={() => handleNavigation('Reunião Fim de Semana')}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="h-48 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center p-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/80 via-orange-400/80 to-red-500/80"></div>
              <img 
                src="https://cms-imgp.jw-cdn.org/img/p/502012477/univ/art/502012477_univ_lsr_lg.jpg"
                alt="Reunião Fim de Semana"
                className="max-w-full max-h-full object-contain rounded relative z-10 drop-shadow-lg"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="p-4 bg-green-700 text-white">
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <h3 className="font-semibold">Reunião Fim de Semana</h3>
              </div>
            </div>
          </div>

          {/* Donativos */}
          <div 
            onClick={() => handleNavigation('Donativos')}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 flex items-center justify-center p-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/80 via-purple-400/80 to-pink-500/80"></div>
              <img 
                src="https://cms-imgp.jw-cdn.org/img/p/202020331/univ/art/202020331_univ_lsr_lg.jpg"
                alt="Faça seu Donativo"
                className="max-w-full max-h-full object-contain rounded relative z-10 drop-shadow-lg"
                loading="lazy"
              />
            </div>
            <div className="p-4 bg-green-700 text-white">
              <div className="flex items-center gap-2">
                <Heart size={20} />
                <h3 className="font-semibold">Faça seu Donativo</h3>
              </div>
            </div>
          </div>

          {/* Grupos de Campo e Território */}
          <div 
            onClick={() => handleNavigation('Grupos de Campo')}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="h-48 bg-gradient-to-br from-rose-500 via-red-500 to-orange-600 flex items-center justify-center p-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-400/80 via-red-400/80 to-orange-500/80"></div>
              <img 
                src="https://cms-imgp.jw-cdn.org/img/p/502015242/univ/art/502015242_univ_lsr_lg.jpg"
                alt="Grupos de Campo"
                className="max-w-full max-h-full object-contain rounded relative z-10 drop-shadow-lg"
                loading="lazy"
              />
            </div>
            <div className="p-4 bg-green-700 text-white">
              <div className="flex items-center gap-2">
                <Map size={20} />
                <h3 className="font-semibold">Grupos de Saída de Campo</h3>
              </div>
            </div>
          </div>

          {/* Relatório */}
          <div 
            onClick={() => handleNavigation('Relatório')}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="h-48 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 flex items-center justify-center p-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400/80 via-emerald-400/80 to-green-500/80"></div>
              <img 
                src="https://cms-imgp.jw-cdn.org/img/p/502014631/univ/art/502014631_univ_lsr_lg.jpg"
                alt="Relatório"
                className="max-w-full max-h-full object-contain rounded relative z-10 drop-shadow-lg"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="p-4 bg-green-700 text-white">
              <div className="flex items-center gap-2">
                <FileText size={20} />
                <h3 className="font-semibold">Relatório</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-600 text-sm">
        </div>
      </main>
    </div>
  );
};

export default HomePage;