// app/api/dimensionamento/route.ts

import { NextResponse } from 'next/server';

// --- Interface para tipar os dados de entrada do cômodo ---
interface ComodoData {
    nome_comodo: string;
    area: number; // Área em m²
    perimetro: number; // Perímetro em m
    tipo_comodo: 'geral' | 'molhado'; // 'geral' ou 'molhado'
    equipamentos: number; // Potência dos TUEs em VA
}

// --- Interface para tipar os resultados do cálculo ---
interface ResultadoCalculoComodo {
    nome: string;
    area: number;
    perimetro: number;
    tipo: string;
    equipamentos_va: number;
    iluminacao_va_calculado: number;
    tugs_va_calculado: number;
    total_comodo_va: number;
}

// --- Função para calcular Iluminação e TUGs conforme NBR 5410 ---
function calcularCargasComodo(data: ComodoData): { iluminacao_va: number; tugs_va: number } {
    const { area, perimetro, tipo_comodo } = data;

    let iluminacao_va = 0;
    let tugs_va = 0;

    // Cálculo da Iluminação (NBR 5410)
    if (area <= 6) {
        iluminacao_va = 100;
    } else {
        iluminacao_va = 100; // Primeiros 6m²
        const areaRestante = area - 6;
        // Calcula acréscimos de 60 VA para cada 4m² ou fração
        const acrescimos60va = Math.floor(areaRestante / 4);
        if (areaRestante % 4 > 0) { // Fração de 4m²
            iluminacao_va += (acrescimos60va + 1) * 60;
        } else {
             iluminacao_va += acrescimos60va * 60;
        }

        // Correção: A regra é 100 para os primeiros 6m² MAIS 60 para cada 4m² ou fração > 6m².
        // A implementação acima estava somando 100 + (acrescimos * 60), o que está correto.
        // Vamos refinar a lógica para garantir que a contagem de acréscimos está exata para frações.
         iluminacao_va = 100; // Carga base para até 6m²
         if (area > 6) {
             const areaExcedente = area - 6;
             const numAcrescimos = Math.ceil(areaExcedente / 4); // Cada 4m² ou fração acima de 6m²
             iluminacao_va += numAcrescimos * 60;
         }

    }

    // Cálculo das TUGs (NBR 5410)
    if (tipo_comodo === "molhado") {
        // Áreas molhadas: 600 VA para os 3 primeiros pontos, 100 VA para os restantes por perímetro (a cada 3.5m)
        // Mínimo de 3 pontos em banheiros/cozinhas/area de serviço
        const numPontosPerimetroMolhado = Math.floor(perimetro / 3.5);
        const pontosPerimetroMolhado = perimetro % 3.5 > 0 ? numPontosPerimetroMolhado + 1 : numPontosPerimetroMolhado;

        // Garante o mínimo de 3 pontos para áreas molhadas (se necessário)
        const numPontosTugs = Math.max(pontosPerimetroMolhado, 3);

        // Calcula a potência dos TUGs em áreas molhadas
        const pontos600va = Math.min(numPontosTugs, 3); // Os primeiros 3 são de 600 VA
        const pontos100va = numPontosTugs - pontos600va; // Os restantes são de 100 VA

        tugs_va = (pontos600va * 600) + (pontos100va * 100);

    } else { // Tipo 'geral' (salas, quartos, corredores, etc.)
        // Áreas secas: 100 VA por ponto, a cada 5m de perímetro
        const numPontosPerimetroGeral = Math.floor(perimetro / 5);
        const pontosPerimetroGeral = perimetro % 5 > 0 ? numPontosPerimetroGeral + 1 : numPontosPerimetroGeral;

        // Garante o mínimo de 1 ponto para áreas gerais
        const numPontosTugs = Math.max(pontosPerimetroGeral, 1);

        tugs_va = numPontosTugs * 100;
    }

    return {
        iluminacao_va: iluminacao_va,
        tugs_va: tugs_va
    };
}

// --- Handler para requisições POST na rota /api/dimensionamento ---
export async function POST(request: Request) {
    try {
        // Lê os dados enviados no corpo da requisição (do frontend)
        const data: ComodoData = await request.json();

        // Verifica se os dados necessários estão presentes
        if (typeof data.nome_comodo !== 'string' || typeof data.area !== 'number' || typeof data.perimetro !== 'number' || !['geral', 'molhado'].includes(data.tipo_comodo) || typeof data.equipamentos !== 'number') {
             return NextResponse.json({ error: 'Dados de entrada inválidos' }, { status: 400 });
        }

        // Executa a função de cálculo
        const cargasCalculadas = calcularCargasComodo(data);

        const iluminacao_va_calculado = cargasCalculadas.iluminacao_va;
        const tugs_va_calculado = cargasCalculadas.tugs_va;
        const total_comodo_va = iluminacao_va_calculado + tugs_va_calculado + data.equipamentos;


        // Prepara o resultado a ser enviado de volta para o frontend
        const resultado: ResultadoCalculoComodo = {
            nome: data.nome_comodo,
            area: data.area,
            perimetro: data.perimetro,
            tipo: data.tipo_comodo,
            equipamentos_va: data.equipamentos,
            iluminacao_va_calculado: iluminacao_va_calculado,
            tugs_va_calculado: tugs_va_calculado,
            total_comodo_va: total_comodo_va
        };

        // Retorna o resultado em formato JSON com status 200 (OK)
        return NextResponse.json(resultado, { status: 200 });

    } catch (error) {
        console.error('Erro ao calcular dimensionamento:', error);
        // Em caso de erro, retorna uma resposta de erro com status 500
        return NextResponse.json({ error: 'Erro interno ao calcular dimensionamento' }, { status: 500 });
    }
}

// Você pode adicionar handlers para outros métodos HTTP (GET, PUT, DELETE) se necessário,
// mas para receber dados de um formulário, POST é o mais comum.
// export async function GET(request: Request) {}