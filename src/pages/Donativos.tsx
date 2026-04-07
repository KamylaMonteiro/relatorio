import { Link } from 'react-router-dom';
import { ArrowLeft, Smartphone } from 'lucide-react';

const Donativos = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1 hover:bg-green-700 rounded">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Faça seu Donativo</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Contribuições Voluntárias</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* PIX */}
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="text-blue-600" size={24} />
                <h4 className="font-semibold text-lg text-gray-800">PIX</h4>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-100 p-4 rounded-lg text-sm">
                  <p className="font-medium text-base text-gray-900"><strong>Donativos para A CONGREGAÇÃO:</strong></p>
                  <br></br>
                  <p className="font-semibold text-gray-800"><strong>CHAVE PIX - CPF:</strong> 51550024604</p>
                  <p className="font-semibold text-gray-800"><strong>Nome do Beneficiário:</strong> MARCILIO AFONSO DE SOUZA</p>
                  <p className="font-semibold text-gray-800"><strong>No campo "REFERÊNCIA" coloque:</strong> DONATIVO CONGREGAÇÃO</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-sm">
                  <p className="font-medium text-base text-gray-900"><strong>Donativos para A OBRA MUNDIAL:</strong></p>
                  <br></br>
                  <p className="font-semibold text-gray-800"><strong>CHAVE PIX - CNPJ:</strong> 33755687000124</p>
                  <p className="font-semibold text-gray-800"><strong>Nome do Beneficiário:</strong> ASSOCIAÇÃO TORRE DE VIGIA DE BÍBLIAS E TRATADOS</p>
                  <p className="font-semibold text-gray-800"><strong>No campo "REFERÊNCIA" coloque:</strong> DONATIVO OBRA MUNDIAL</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 text-center">
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Donativos;