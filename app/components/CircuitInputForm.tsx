// calcelectric/app/components/CircuitInputForm.tsx
'use client'; // <-- Adicione esta linha!

import React from 'react';
import { Circuit } from '../../types/circuit';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CircuitInputFormProps {
  circuit: Circuit;
  index: number;
  onCircuitChange: (circuit: Circuit) => void;
  onRemoveCircuit: (id: string) => void;
}

const CircuitInputForm: React.FC<CircuitInputFormProps> = ({ circuit, index, onCircuitChange, onRemoveCircuit }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newErrors = { ...circuit.errors };
    delete newErrors[name];

    onCircuitChange({
      ...circuit,
      [name]: value,
      errors: newErrors,
    });
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 relative">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b pb-2">
        Circuito {index + 1}: {circuit.name || 'Novo Circuito'}
      </h3>

      <button
        onClick={() => onRemoveCircuit(circuit.id)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-red-500 hover:text-red-700 transition duration-200"
        title="Remover este circuito"
      >
        <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Nome do Circuito */}
        <div className="flex flex-col">
          <label htmlFor={`name-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Nome do Circuito
          </label>
          <input
            type="text"
            id={`name-${circuit.id}`}
            name="name"
            value={circuit.name}
            onChange={handleChange}
            placeholder="Ex: Iluminação Sala"
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {circuit.errors.name && <p className="text-red-500 text-xs mt-1">{circuit.errors.name}</p>}
        </div>

        {/* Tipo de Circuito */}
        <div className="flex flex-col">
          <label htmlFor={`type-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Tipo de Circuito
          </label>
          <select
            id={`type-${circuit.id}`}
            name="type"
            value={circuit.type}
            onChange={handleChange}
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.type ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecione...</option>
            <option value="iluminacao">Iluminação</option>
            <option value="tomadas">Tomadas de Uso Geral (TUG)</option>
            <option value="tues">Tomadas de Uso Específico (TUE)</option>
            <option value="chuveiro">Chuveiro</option>
            <option value="ar_condicionado">Ar Condicionado</option>
          </select>
          {circuit.errors.type && <p className="text-red-500 text-xs mt-1">{circuit.errors.type}</p>}
        </div>

        {/* Potência (W) */}
        <div className="flex flex-col">
          <label htmlFor={`power-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Potência (W)
          </label>
          <input
            type="number"
            id={`power-${circuit.id}`}
            name="power"
            value={circuit.power}
            onChange={handleChange}
            placeholder="Ex: 1500"
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.power ? 'border-red-500' : 'border-gray-300'}`}
          />
          {circuit.errors.power && <p className="text-red-500 text-xs mt-1">{circuit.errors.power}</p>}
        </div>

        {/* Tensão (V) */}
        <div className="flex flex-col">
          <label htmlFor={`voltage-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Tensão (V)
          </label>
          <input
            type="number"
            id={`voltage-${circuit.id}`}
            name="voltage"
            value={circuit.voltage}
            onChange={handleChange}
            placeholder="Ex: 127 ou 220"
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.voltage ? 'border-red-500' : 'border-gray-300'}`}
          />
          {circuit.errors.voltage && <p className="text-red-500 text-xs mt-1">{circuit.errors.voltage}</p>}
        </div>

        {/* Método de Instalação */}
        <div className="flex flex-col">
          <label htmlFor={`installationMethod-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Método de Instalação
          </label>
          <select
            id={`installationMethod-${circuit.id}`}
            name="installationMethod"
            value={circuit.installationMethod}
            onChange={handleChange}
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.installationMethod ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecione...</option>
            <option value="b1">B1 (Eletroduto em alvenaria)</option>
            <option value="b2">B2 (Cabo multipolar em eletroduto)</option>
          </select>
          {circuit.errors.installationMethod && <p className="text-red-500 text-xs mt-1">{circuit.errors.installationMethod}</p>}
        </div>

        {/* Número de Condutores Carregados */}
        <div className="flex flex-col">
          <label htmlFor={`numberOfLoadedConductors-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Nº de Condutores Carregados
          </label>
          <select
            id={`numberOfLoadedConductors-${circuit.id}`}
            name="numberOfLoadedConductors"
            value={circuit.numberOfLoadedConductors}
            onChange={handleChange}
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.numberOfLoadedConductors ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecione...</option>
            <option value="2">2 (Fase-Fase ou Fase-Neutro)</option>
            <option value="3">3 (3 Fases ou 2 Fases + Neutro)</option>
          </select>
          {circuit.errors.numberOfLoadedConductors && <p className="text-red-500 text-xs mt-1">{circuit.errors.numberOfLoadedConductors}</p>}
        </div>

        {/* Temperatura Ambiente */}
        <div className="flex flex-col">
          <label htmlFor={`ambientTemperature-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Temperatura Ambiente (°C)
          </label>
          <input
            type="number"
            id={`ambientTemperature-${circuit.id}`}
            name="ambientTemperature"
            value={circuit.ambientTemperature}
            onChange={handleChange}
            placeholder="Padrão: 30"
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.ambientTemperature ? 'border-red-500' : 'border-gray-300'}`}
          />
          {circuit.errors.ambientTemperature && <p className="text-red-500 text-xs mt-1">{circuit.errors.ambientTemperature}</p>}
          <p className="text-gray-500 text-xs mt-1">
            Temperatura do local da instalação. Padrão NBR 5410: 30°C.
          </p>
        </div>

        {/* Número de Circuitos Agrupados */}
        <div className="flex flex-col">
          <label htmlFor={`numberOfGroupedCircuits-${circuit.id}`} className="text-sm font-medium text-gray-700 mb-1">
            Nº de Circuitos Agrupados
          </label>
          <input
            type="number"
            id={`numberOfGroupedCircuits-${circuit.id}`}
            name="numberOfGroupedCircuits"
            value={circuit.numberOfGroupedCircuits}
            onChange={handleChange}
            placeholder="Padrão: 1"
            min="1"
            className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm ${circuit.errors.numberOfGroupedCircuits ? 'border-red-500' : 'border-gray-300'}`}
          />
          {circuit.errors.numberOfGroupedCircuits && <p className="text-red-500 text-xs mt-1">{circuit.errors.numberOfGroupedCircuits}</p>}
          <p className="text-gray-500 text-xs mt-1">
            Número de circuitos que passam juntos no mesmo eletroduto/bandeja. Padrão: 1 (sem agrupamento).
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircuitInputForm;