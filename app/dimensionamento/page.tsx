// calcelectric/app/dimensionamento/page.tsx

'use client';

import React, { useState, FormEvent } from 'react';

// --- Definição das Interfaces ---
// Estas interfaces ajudam o código a entender a "forma" dos dados.
// Idealmente, estariam num ficheiro compartilhado para usar em vários locais.

// Interface para os dados que vêm do formulário de UM cômodo
interface FormComodoData {
    nome_comodo: string;
    area: number; // Área em m²
    perimetro: number; // Perímetro em m
    tipo_comodo: 'geral' | 'molhado'; // 'geral' ou 'molhado'
    equipamentos: number; // Potência dos TUEs em VA
}

// Interface para os resultados que a API /api/dimensionamento retorna para UM cômodo
interface ApiResultadoComodo {
    nome: string; // Nome retornado pela API (pode ser usado para confirmação)
    area: number;
    perimetro: number;
    tipo: string; // Tipo retornado pela API
    equipamentos_va: number;
    iluminacao_va_calculado: number;
    tugs_va_calculado: number;
    total_comodo_va: number;
    iluminacao_pontos: number;
    tugs_pontos: number;
}

// Interface para a estrutura dos objetos que guardamos na NOSSA LISTA 'rooms' no frontend
// Combina os dados originais do formulário com os resultados calculados pela API individual
interface ComodoDataNaLista {
    id: string; // ID único para cada item na lista (para o React gerenciar e remover)
    nome_comodo: string;
    area: number;
    perimetro: number;
    tipo_comodo: 'geral' | 'molhado';
    equipamentos: number; // Potência dos TUEs em VA
    // Resultados calculados (agora OBRIGATÓRIOS quando o cômodo está nesta lista)
    iluminacao_va_calculado: number;
    tugs_va_calculado: number;
    total_comodo_va: number; // Total individual (Ilum + TUGs + TUEs)
    iluminacao_pontos: number;
    tugs_pontos: number;
}

// --- NOVAS INTERFACES para a Estrutura de Circuitos Sugeridos (copiar da API de total) ---
// Definimos a estrutura dos objetos que vêm na lista 'circuitos_sugeridos' da API total
interface CargaAgrupadaNoCircuito { // Nome adaptado para o contexto frontend
    comodo_id: string;
    carga_tipo: 'iluminacao' | 'tugs' | 'tue';
    va: number;
    pontos?: number; // Opcional, nem sempre relevante para TUEs
}

interface CircuitoSugeridoDisplay { // Nome adaptado para o contexto frontend
    id: string; // ID do circuito (ex: "C1")
    tipo: 'iluminacao' | 'tugs' | 'tue' | 'geral'; // Tipo de carga principal no circuito
    cargas_incluidas: CargaAgrupadaNoCircuito[]; // Lista detalhada das cargas que compõem este circuito
    total_va_circuito: number; // Soma das cargas neste circuito
    // Futuramente: corrente do circuito, disjuntor sugerido, condutor sugerido, etc.
}

// Interface para a estrutura dos resultados totais que a API /api/dimensionamento/total retorna
// Agora inclui o campo 'circuitos_sugeridos'
interface ResultadoTotalResidencia {
    total_iluminacao_va: number;
    total_tugs_va: number;
    total_equipamentos_va: number;
    potencia_total_instalada_va: number;
    // Corrente Total calculada pela API total
    corrente_total_calculada: number; // Corrente em Ampères (A)
    // --- NOVO CAMPO: Sugestão de Circuitos ---
    circuitos_sugeridos: CircuitoSugeridoDisplay[]; // A lista de circuitos sugeridos
    // Futuramente: Disjuntor geral, etc.
}

// --- Fim da Definição das Interfaces ---


export default function DimensionamentoPage() {
    // Estado (variáveis que o React "observa" para atualizar a página)

    // Estado para os dados do formulário de adicionar cômodo
    const [formData, setFormData] = useState<FormComodoData>({
        nome_comodo: '',
        area: 0,
        perimetro: 0,
        tipo_comodo: 'geral', // Valor inicial
        equipamentos: 0,
    });

    // Estado para a Tensão Nominal de Serviço informada pelo usuário
    const [serviceVoltage, setServiceVoltage] = useState<number | ''>(220); // Valor inicial sugerido: 220V


    // Estado para a lista de cômodos que foram adicionados
    const [rooms, setRooms] = useState<ComodoDataNaLista[]>([]);


    // Estado para guardar o resultado do cálculo TOTAL da residência
    const [resultadoTotal, setResultadoTotal] = useState<ResultadoTotalResidencia | null>(null);
    // Estado para saber se o cálculo TOTAL está a carregar
    const [carregandoTotal, setCarregandoTotal] = useState(false);

    // Estado para mostrar mensagens de erro na página
    const [erro, setErro] = useState<string | null>(null);
    // Estado para saber se está a adicionar um cômodo (e a chamar a API individual)
    const [adicionando, setAdicionando] = useState(false);


    // Função chamada quando algo muda nos campos do formulário (tanto de cômodo quanto de tensão)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Lida especificamente com o campo da tensão
        if (name === 'service_voltage') {
             const voltageValue = parseFloat(value);
             // Verifica se o valor é um número válido. Se não for (NaN), define como vazio.
             setServiceVoltage(isNaN(voltageValue) ? '' : voltageValue);
        } else {
            // Lida com os campos do formulário de adicionar cômodo
            // Converte área, perímetro e equipamentos para número, usando 0 se o campo estiver vazio inicialmente
            const numericValue = name === 'area' || name === 'perimetro' || name === 'equipamentos' ? parseFloat(value) || 0 : value;
            // No campo tipo_comodo (select), o valor já é a string ('geral' ou 'molhado')
            const tipoComodoValue = name === 'tipo_comodo' ? value as "geral" | "molhado" : numericValue;

             setFormData({
                 ...formData, // Copia os dados atuais do formulário
                 [name]: tipoComodoValue, // Atualiza o campo que mudou
             });
        }
    };


    // Função CHAMA A API INDIVIDUAL PARA CALCULAR E DEPOIS ADICIONA À LISTA
    const handleAddRoom = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Evita que a página recarregue
        setAdicionando(true); // Começa a indicar que está a adicionar
        setErro(null); // Limpa mensagens de erro antigas
        setResultadoTotal(null); // Limpa resultado total anterior ao adicionar um novo cômodo


        // Validação básica dos campos OBRIGATÓRIOS do formulário de cômodo
        if (!formData.nome_comodo || formData.area <= 0 || formData.perimetro <= 0) {
             setErro('Por favor, preencha o nome, área (> 0) e perímetro (> 0) do cômodo antes de adicionar.');
             setAdicionando(false);
             return;
        }

         try {
            // --- CHAMA A PRIMEIRA API (/api/dimensionamento) para calcular as cargas E PONTOS de ESTE cômodo ---
            // Enviamos os dados que o usuário preencheu no formulário de adicionar cômodo
            const response = await fetch('/api/dimensionamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Envia os dados do formulário
            });

            // Verifica se a resposta da API individual foi bem-sucedida
            if (!response.ok) {
                // Se a API retornou um erro (ex: status 400, 500), tenta ler a mensagem do erro
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao calcular cargas e pontos individuais do cômodo.');
            }

            // Lê os resultados calculados que vêm da resposta da API individual
            // Estes resultados incluem as potências e os pontos para este cômodo específico
            const resultadosIndividuais: ApiResultadoComodo = await response.json(); // Tipamos com a interface correta da resposta da API

             // Gera um ID único para este cômodo que vamos adicionar à lista
            const newRoomId = Date.now().toString(); // Usa o timestamp atual como ID (simples, mas funciona)

            // Cria o NOVO OBJETO que representa este cômodo completo na nossa lista 'rooms'
            // Este objeto combina os dados originais do formulário E os resultados que a API calculou
            const newRoomParaLista: ComodoDataNaLista = {
                id: newRoomId, // ID único gerado
                nome_comodo: formData.nome_comodo, // Dados originais do formulário
                area: formData.area,
                perimetro: formData.perimetro,
                tipo_comodo: formData.tipo_comodo,
                equipamentos: formData.equipamentos,
                // Inclui os resultados calculados pela API individual:
                iluminacao_va_calculado: resultadosIndividuais.iluminacao_va_calculado,
                tugs_va_calculado: resultadosIndividuais.tugs_va_calculado,
                total_comodo_va: resultadosIndividuais.total_comodo_va,
                iluminacao_pontos: resultadosIndividuais.iluminacao_pontos,
                tugs_pontos: resultadosIndividuais.tugs_pontos
            };

            // Adiciona este novo objeto (com dados originais + resultados) à lista de cômodos que já temos
            // setRooms é usado com uma nova lista que inclui todos os cômodos antigos + o novo
            setRooms([...rooms, newRoomParaLista]);

            // Limpa o formulário para que o usuário possa adicionar o próximo cômodo facilmente
            setFormData({
                nome_comodo: '',
                area: 0,
                perimetro: 0,
                tipo_comodo: 'geral', // Reseta para o valor inicial
                equipamentos: 0,
            });

        } catch (error: any) {
             // Captura e mostra qualquer erro que aconteça durante a chamada à API individual
             setErro(error.message || 'Ocorreu um erro ao adicionar o cômodo.');
        } finally {
            // Este bloco é executado no final, quer tenha dado sucesso ou erro na chamada da API individual
            setAdicionando(false); // Termina de indicar que está a adicionar
        }
    };

    // Função chamada quando o botão REMOVER de um cômodo é clicado
    const handleRemoveRoom = (idParaRemover: string) => {
        // Cria uma nova lista que inclui todos os cômodos EXCETO aquele com o ID a remover
        setRooms(rooms.filter(room => room.id !== idParaRemover));
         setResultadoTotal(null); // Limpa o resultado total se a lista de cômodos mudar
         setErro(null); // Limpa qualquer erro
    };


    // --- Função chamada quando o botão CALCULAR TOTAL DA RESIDÊNCIA é clicado ---
    const calcularTotalResidencia = async () => {
         // Validações antes de calcular o total
         if (rooms.length === 0) {
            setErro('Adicione pelo menos um cômodo para calcular o total.');
            setResultadoTotal(null);
            return;
        }
         if (!serviceVoltage || serviceVoltage <= 0) {
             setErro('Por favor, informe uma Tensão Nominal de Serviço válida (> 0) antes de calcular o total.');
             setResultadoTotal(null);
             return;
         }


        setCarregandoTotal(true); // Começa a indicar que está a calcular o total
        setErro(null); // Limpa erros antigos
        setResultadoTotal(null); // Limpa resultado total anterior

        try {
            // --- CHAMA A SEGUNDA API (/api/dimensionamento/total) com a LISTA COMPLETA de cômodos E A TENSÃO ---
            // Enviamos um objeto que contém a lista 'rooms' (todos os cômodos adicionados) e a tensão
            const response = await fetch('/api/dimensionamento/total', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // O corpo da requisição é um objeto JSON com a lista de cômodos e a tensão
                body: JSON.stringify({
                    rooms: rooms, // A lista de cômodos (ComodoDataNaLista[]), que já inclui resultados individuais
                    serviceVoltage: serviceVoltage // A tensão informada pelo usuário (number)
                }),
            });

            // Verifica se a resposta da API de total foi bem-sucedida
            if (!response.ok) {
                // Se a API retornou um erro, tenta ler a mensagem
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao calcular o total da residência.');
            }

            // Lê o resultado total que vem da resposta da API de total
            // Este resultado tem a estrutura definida na interface ResultadoTotalResidencia
            const data: ResultadoTotalResidencia = await response.json();
            setResultadoTotal(data); // Atualiza o estado com o resultado total para mostrá-lo na tela

        } catch (error: any) {
             // Captura e mostra qualquer erro que aconteça durante a chamada à API de total
            setErro(error.message || 'Ocorreu um erro ao calcular o total.');
        } finally {
            // Este bloco é executado no final, quer tenha dado sucesso ou erro na chamada da API de total
            setCarregandoTotal(false); // Termina de indicar que está a calcular o total
        }
    };


   // --- JSX: Define a estrutura visual da página com layout aprimorado e cores ---
   return (
    // Container principal da página: fundo cinza suave, padding, margem, largura máxima no centro
    <div className="min-h-screen bg-blue-50 py-10"> {/* Fundo azul bem claro, padding vertical aumentado */}
        <div className="container mx-auto px-4 max-w-lg"> {/* Centralizado, padding horizontal, largura máxima ligeiramente maior */}

             {/* Cabeçalho principal */}
            <h1 className="text-4xl font-extrabold text-blue-800 mb-4 text-center">Calculadora de Dimensionamento Elétrico</h1> {/* Título maior, negrito extra, cor azul escura */}
            <p className="mb-8 text-blue-700 text-center text-lg">Insira os dados dos cômodos e informações gerais para o dimensionamento.</p> {/* Parágrafo com fonte um pouco maior, cor azul */}

            {/* Formulário para adicionar UM NOVO cômodo - Estilo de Cartão */}
            <div className="bg-white p-7 rounded-2xl shadow-xl mb-8 border border-blue-100"> {/* Fundo branco, padding aumentado, cantos mais arredondados, sombra maior, margem inferior, borda azul clara */}
                <h2 className="text-2xl font-bold text-blue-700 mb-6">Adicionar Novo Cômodo</h2> {/* Subtítulo negrito, cor azul, mais margem inferior */}

                {/* Campos do formulário - Ajustes de margem, foco e texto */}
                 <div className="mb-5"> {/* Margem inferior um pouco maior */}
                    <label htmlFor="nome_comodo" className="block text-base font-medium text-gray-700 mb-2">Nome do Cômodo:</label> {/* Rótulo com fonte base, mais margem inferior */}
                    <input type="text" id="nome_comodo" name="nome_comodo" value={formData.nome_comodo} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"/> {/* Texto do input cor mais escura, placeholder */}
                </div>
                 <div className="mb-5">
                    <label htmlFor="area" className="block text-base font-medium text-gray-700 mb-2">Área (m²):</label>
                    <input type="number" id="area" name="area" value={formData.area} onChange={handleInputChange} step="0.01" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"/>
                </div>
                 <div className="mb-5">
                    <label htmlFor="perimetro" className="block text-base font-medium text-gray-700 mb-2">Perímetro (m):</label>
                    <input type="number" id="perimetro" name="perimetro" value={formData.perimetro} onChange={handleInputChange} step="0.01" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"/>
                </div>
                 <div className="mb-5">
                    <label htmlFor="tipo_comodo" className="block text-base font-medium text-gray-700 mb-2">Tipo de Cômodo:</label>
                    <select id="tipo_comodo" name="tipo_comodo" value={formData.tipo_comodo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white appearance-none text-gray-800"> {/* Texto do select cor mais escura */}
                        <option value="geral">Geral</option>
                        <option value="molhado">Molhado</option>
                    </select>
                </div>
                 <div className="mb-6">
                    <label htmlFor="equipamentos" className="block text-base font-medium text-gray-700 mb-2">Potência de Equipamentos Específicos (VA):</label>
                    <input type="number" id="equipamentos" name="equipamentos" value={formData.equipamentos} onChange={handleInputChange} step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"/>
                </div>

                {/* Botão para ADICIONAR o Cômodo - Estilo aprimorado com cor primária */}
                <button
                    type="submit"
                    disabled={adicionando}
                    className={`w-full text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-semibold transition duration-200 text-lg ${
                        adicionando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    }`} 
                >
                    {adicionando ? 'Adicionando...' : 'Adicionar Cômodo'}
                </button>
            </div>

            {/* --- CAMPO: Tensão Nominal de Serviço - Estilo de Cartão --- */}
             <div className="bg-white p-7 rounded-2xl shadow-xl mb-8 border border-blue-100"> {/* Estilo de cartão consistente */}
                <h2 className="text-2xl font-bold text-blue-700 mb-6">Informações Gerais da Residência</h2> {/* Título consistente */}
                 <div className="mb-4">
                    <label htmlFor="service_voltage" className="block text-base font-medium text-gray-700 mb-2">Tensão Nominal de Serviço (V):</label>
                    <input
                        type="number"
                        id="service_voltage"
                        name="service_voltage"
                        value={serviceVoltage}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"
                    />
                </div>
             </div>


            {/* Área para mostrar o erro - Estilo aprimorado */}
            {erro && (
                <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6 font-medium"> {/* Fonte média */}
                    <strong>Erro:</strong> {erro}
                </div>
            )}

            {/* --- Área para Listar os Cômodos Adicionados - Estilo de Cartão --- */}
            {rooms.length > 0 && (
                <div className="bg-white p-7 rounded-2xl shadow-xl mb-8 border border-blue-100"> {/* Container no estilo cartão */}
                    <h2 className="text-2xl font-bold text-blue-700 mb-4">Cômodos Adicionados:</h2> {/* Título */}
                    <ul className="list-none p-0 m-0">
                        {rooms.map(room => (
                            <li key={room.id} className="bg-gray-50 p-4 rounded-lg mb-4 flex justify-between items-center border-b border-gray-200 last:border-b-0"> {/* Estilo de item de lista aprimorado */}
                                <div>
                                    <span className="font-semibold text-gray-900 text-lg">{room.nome_comodo}</span> {/* Nome maior, cor mais escura */}
                                    <p className="text-sm text-gray-700 mt-1"> {/* Cor do texto */}
                                        Área: {room.area} m², Perím.: {room.perimetro} m, Tipo: {room.tipo_comodo === 'geral' ? 'Geral' : 'Molhado'}, Equip.: {room.equipamentos} VA
                                    </p>
                                     {/* MOSTRANDO OS RESULTADOS CALCULADOS INDIVIDUAIS (COM PONTOS) */}
                                    <p className="text-sm text-gray-800 mt-2 font-medium"> {/* Mais margem superior, negrito leve */}
                                        Ilum.: {room.iluminacao_va_calculado} VA ({room.iluminacao_pontos} pts)
                                    </p>
                                     <p className="text-sm text-gray-800 mt-1 font-medium"> {/* Mais margem superior, negrito leve */}
                                        TUGs: {room.tugs_va_calculado} VA ({room.tugs_pontos} pts)
                                     </p>
                                      <p className="text-sm text-gray-800 mt-1 font-medium"> {/* Mais margem superior, negrito leve */}
                                        Total Cômodo: {room.total_comodo_va} VA
                                     </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveRoom(room.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200 font-medium" 
                                >
                                    Remover
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Botão para calcular o TOTAL da residência - Estilo aprimorado com cor secundária */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={calcularTotalResidencia}
                            disabled={carregandoTotal || rooms.length === 0 || !serviceVoltage || serviceVoltage <= 0}
                             className={`py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-semibold transition duration-200 text-lg ${
                                carregandoTotal || rooms.length === 0 || !serviceVoltage || serviceVoltage <= 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                             }`} 
                        >
                           {carregandoTotal ? 'Calculando Total...' : 'Calcular Total da Residência'}
                        </button>
                    </div>
                </div>
            )}

          
            {resultadoTotal && ( // Só aparece se houver um resultado total no estado
                 <div className="bg-white p-7 rounded-2xl shadow-xl mb-8 border-t-4 border-purple-600"> {/* Estilo de cartão, padding aumentado, cantos arredondados, sombra, margem inferior, borda superior roxa */}
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">Resultado Total da Residência:</h2> {/* Título cor roxa */}
                    <p className="mb-2 text-gray-800"><span className="font-medium">Total Iluminação:</span> {resultadoTotal.total_iluminacao_va} VA</p> {/* Margem inferior, cor do texto mais escura */}
                    <p className="mb-2 text-gray-800"><span className="font-medium">Total TUGs:</span> {resultadoTotal.total_tugs_va} VA</p>
                    <p className="mb-2 text-gray-800"><span className="font-medium">Total Equipamentos Específicos:</span> {resultadoTotal.total_equipamentos_va} VA</p>
                    <p className="mb-4 text-gray-800"><span className="font-medium">Potência Total Instalada:</span> {resultadoTotal.potencia_total_instalada_va} VA</p> {/* Mais margem antes da corrente */}
                    {/* MOSTRANDO A CORRENTE TOTAL CALCULADA */}
                     <p className="text-xl font-bold text-purple-700 mt-4"><span className="font-extrabold">Corrente Total Calculada:</span> {resultadoTotal.corrente_total_calculada.toFixed(2)} A</p> {/* Fonte maior, negrito, cor roxa, margem superior */}

                     {/* --- EXIBINDO A SUGESTÃO DE CIRCUITOS (Estilo aprimorado) --- */}
                     {/* Verifica se há circuitos sugeridos para exibir esta seção */}
                     {resultadoTotal.circuitos_sugeridos && resultadoTotal.circuitos_sugeridos.length > 0 && (
                         <div className="mt-6 border-t pt-4 border-gray-200"> {/* Margem superior, borda superior cinza, padding superior */}
                             <h3 className="text-xl font-semibold text-gray-800 mb-3">Circuitos Sugeridos:</h3> {/* Título da seção de circuitos */}
                             <ul className="list-disc pl-6 text-gray-800"> {/* Lista com marcadores, padding maior, cor do texto */}
                                 {/* Itera sobre a lista de circuitos recebida da API */}
                                 {resultadoTotal.circuitos_sugeridos.map(circuito => (
                                     // Cada item da lista de circuito
                                     <li key={circuito.id} className="mb-3 last:mb-0 text-base"> {/* Margem inferior (exceto no último item), fonte base */}
                                         <span className="font-medium text-gray-900">{circuito.id} ({circuito.tipo.toUpperCase()}):</span> {circuito.total_va_circuito} VA {/* Exibe ID, tipo em maiúsculas e total VA do circuito */}
                                          {/* Opcional: Mostrar quais cômodos e cargas estão neste circuito */}
                                          {/* Verifica se há cargas incluídas para exibir a sub-lista */}
                                          {circuito.cargas_incluidas && circuito.cargas_incluidas.length > 0 && (
                                              <ul className="list-none pl-4 text-sm text-gray-700 mt-1"> {/* Sub-lista sem marcadores, indentada, fonte menor, cor mais clara, margem superior */}
                                                  {/* Itera sobre as cargas individuais dentro deste circuito */}
                                                  {circuito.cargas_incluidas.map((carga, index) => (
                                                      // Item da sub-lista, mostrando o cômodo e detalhes da carga
                                                      <li key={index}>
                                                          {/* Encontra o nome do cômodo original na lista 'rooms' */}
                                                          - <span className="font-medium">{rooms.find(r => r.id === carga.comodo_id)?.nome_comodo}</span>: {carga.va} VA ({carga.carga_tipo.toUpperCase()}{carga.pontos !== undefined ? `, ${carga.pontos} pts` : ''})
                                                      </li>
                                                  ))}
                                              </ul>
                                          )}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     )}
                 </div>
            )}


        </div> {/* Fim do container principal */}
    </div> // Fim do div do fundo azul claro
);
}

