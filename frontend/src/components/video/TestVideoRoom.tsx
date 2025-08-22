import React, { useState } from 'react';
import { Plus, LogIn } from 'lucide-react';

const TestVideoRoom: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold text-red-600">COMPONENTE DE PRUEBA</h1>
      
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-100 p-4 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Salas de Videoconferencia</h2>
          <p className="text-gray-600">Gestiona tus sesiones de terapia virtual</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Unirse a Sala</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sala</span>
          </button>
        </div>
      </div>

      {/* Estado de los modales */}
      <div className="bg-green-100 p-4 rounded-lg">
        <p>ShowCreateModal: {showCreateModal.toString()}</p>
        <p>ShowJoinModal: {showJoinModal.toString()}</p>
      </div>

      {/* Modal simple de crear */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Crear Nueva Sala</h3>
            <input
              type="text"
              placeholder="Título de la sala"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Sala creada!');
                  setShowCreateModal(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Crear Sala
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal simple de unirse */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Unirse a Sala</h3>
            <input
              type="text"
              placeholder="Código de la sala"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Unido a la sala!');
                  setShowJoinModal(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Unirse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestVideoRoom;
