// calcelectric/app/api/dimensionamento/total/route.ts

import { NextResponse } from 'next/server';

// --- Interfaces de Entrada (iguais) ---
interface DadosParaCalculoTotal {
    rooms: ComodoDataParaTotal[];
    serviceVoltage: number;
}

interface ComodoDataParaTotal {
    id: string;
    nome_comodo: string;
    area: number;
    perimetro: number;
    tipo_comodo: 'geral' | 'molhado';
    equipamentos: number;
    iluminacao_va_calculado: number;
    tugs_va_calculado: number;
    total_comodo_va: number;
    iluminacao_pontos: number;
    tugs_pontos: number;
}

// --- NOVAS INTERFACES para a Estrutura de Circuitos Sugeridos ---
interface CargaAgrupadaPorTipo {
    tipo: 'iluminacao' | 'tugs' | 'tue';
    total_va: number;
    total_pontos: number; // Mais relevante para Ilum e TUGs
    comodos_afetados: { id: string; nome: string; va_individual: number; pontos_individual?: number }[]; // Lista de cômodos e suas cargas/pontos
}

interface CircuitoSugerido {
    id: string; // ID do circuito (ex: "C1", "C2")
    tipo: 'iluminacao' | 'tugs' | 'tue' | 'geral'; // Tipo de carga principal no circuito
    cargas_incluidas: { comodo_id: string; carga_tipo: 'iluminacao' | 'tugs' | 'tue'; va: number; pontos?: number }[]; // Detalhe das cargas que compõem o circuito
    total_va_circuito: number; // Soma das cargas neste circuito
    // Futuramente: corrente do circuito, disjuntor sugerido, condutor sugerido
}


// --- Interface para tipar os resultados totais da residência (AGORA INCLUI SUGESTÃO DE CIRCUITOS) ---
interface ResultadoTotalResidencia {
    total_iluminacao_va: number;
    total_tugs_va: number;
    total_equipamentos_va: number;
    potencia_total_instalada_va: number;
    corrente_total_calculada: number;
    // --- NOVO CAMPO: Sugestão de Circuitos ---
    circuitos_sugeridos: CircuitoSugerido[];
    // Futuramente: Resumo por tipo de carga antes de dividir em circuitos menores
    // cargas_agrupadas: CargaAgrupadaPorTipo[];
}

// --- Handler para requisições POST na rota /api/dimensionamento/total ---
export async function POST(request: Request) {
    try {
        const dadosRecebidos: DadosParaCalculoTotal = await request.json();
        const rooms = dadosRecebidos.rooms;
        const serviceVoltage = dadosRecebidos.serviceVoltage;

        if (!Array.isArray(rooms) || typeof serviceVoltage !== 'number' || serviceVoltage <= 0) {
             return NextResponse.json({ error: 'Dados de entrada inválidos: esperado array de cômodos e tensão válida (> 0)' }, { status: 400 });
        }

        let totalIluminacao = 0;
        let totalTugs = 0;
        let totalEquipamentos = 0;
        let potenciaTotalInstalada = 0;

        // --- Lógica para Agrupar Cargas e Sugerir Circuitos ---
        // Vamos criar um array para armazenar os circuitos sugeridos.
        const circuitosSugeridos: CircuitoSugerido[] = [];
        let contadorCircuitos = 1; // Para dar ID aos circuitos (ex: C1, C2)

        // 1. Separar TUEs (cada TUE em um circuito exclusivo)
        for (const room of rooms) {
            if (room.equipamentos > 0) {
                const circuitoTUE: CircuitoSugerido = {
                    id: `C${contadorCircuitos++}`,
                    tipo: 'tue',
                    cargas_incluidas: [{ comodo_id: room.id, carga_tipo: 'tue', va: room.equipamentos }],
                    total_va_circuito: room.equipamentos,
                };
                circuitosSugeridos.push(circuitoTUE);
                totalEquipamentos += room.equipamentos; // Soma para o total geral
            }
             // Soma para os totais gerais de Ilum/TUGs enquanto iteramos
             totalIluminacao += room.iluminacao_va_calculado || 0;
             totalTugs += room.tugs_va_calculado || 0;
        }

        // 2. Agrupar Iluminação (inicialmente, somamos tudo para sugerir um ou mais circuitos depois)
        // Por enquanto, criamos UM circuito sugerido com o total de iluminação de todos os cômodos.
        // Depois, adicionaríamos lógica para dividir isto em circuitos menores (10A, 15A, etc.)
        if (totalIluminacao > 0) {
             const cargasIlumAgrupadas = rooms
                .filter(room => (room.iluminacao_va_calculado || 0) > 0)
                .map(room => ({
                    comodo_id: room.id,
                    carga_tipo: 'iluminacao' as 'iluminacao',
                    va: room.iluminacao_va_calculado || 0,
                    pontos: room.iluminacao_pontos || 0
                }));

             const circuitoIlumTotal: CircuitoSugerido = {
                 id: `C${contadorCircuitos++}`,
                 tipo: 'iluminacao',
                 cargas_incluidas: cargasIlumAgrupadas,
                 total_va_circuito: totalIluminacao,
             };
             circuitosSugeridos.push(circuitoIlumTotal);
        }


        // 3. Agrupar TUGs (inicialmente, somamos tudo para sugerir um ou mais circuitos depois)
         // Por enquanto, criamos UM circuito sugerido com o total de TUGs de todos os cômodos.
         // Depois, adicionaríamos lógica para dividir isto em circuitos menores (10A, 15A, etc.)
        if (totalTugs > 0) {
             const cargasTugsAgrupadas = rooms
                .filter(room => (room.tugs_va_calculado || 0) > 0)
                .map(room => ({
                    comodo_id: room.id,
                    carga_tipo: 'tugs' as 'tugs',
                    va: room.tugs_va_calculado || 0,
                    pontos: room.tugs_pontos || 0
                }));

             const circuitoTugsTotal: CircuitoSugerido = {
                 id: `C${contadorCircuitos++}`,
                 tipo: 'tugs',
                 cargas_incluidas: cargasTugsAgrupadas,
                 total_va_circuito: totalTugs,
             };
             circuitosSugeridos.push(circuitoTugsTotal);
        }


        // Calcula a Potência Total Instalada (soma de todos os totais)
        potenciaTotalInstalada = totalIluminacao + totalTugs + totalEquipamentos;


        // Calcula a Corrente Total
        const correnteTotalCalculada = serviceVoltage > 0 ? potenciaTotalInstalada / serviceVoltage : 0;


        // Prepara o resultado total (AGORA INCLUI SUGESTÃO DE CIRCUITOS)
        const resultadoTotal: ResultadoTotalResidencia = {
            total_iluminacao_va: totalIluminacao,
            total_tugs_va: totalTugs,
            total_equipamentos_va: totalEquipamentos,
            potencia_total_instalada_va: potenciaTotalInstalada,
            corrente_total_calculada: correnteTotalCalculada,
            circuitos_sugeridos: circuitosSugeridos, // Adicionado a lista de circuitos sugeridos
        };

        return NextResponse.json(resultadoTotal, { status: 200 });

    } catch (error) {
        console.error('Erro ao calcular total da residência:', error);
        return NextResponse.json({ error: 'Erro interno ao calcular total da residência' }, { status: 500 });
    }
}