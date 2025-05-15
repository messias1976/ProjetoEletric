// calcelectric/app/api/dimensionamento/route.ts

import { NextResponse } from 'next/server';

// --- Interface para tipar os dados de entrada do cômodo (igual) ---
interface ComodoData {
    nome_comodo: string;
    area: number; // Área em m²
    perimetro: number; // Perímetro em m
    tipo_comodo: 'geral' | 'molhado'; // 'geral' ou 'molhado'
    equipamentos: number; // Potência dos TUEs em VA
}

// --- Interface para tipar os resultados do cálculo (AGORA INCLUI PONTOS) ---
interface ResultadoCalculoComodo {
    nome: string;
    area: number;
    perimetro: number;
    tipo: string;
    equipamentos_va: number;
    iluminacao_va_calculado: number;
    tugs_va_calculado: number;
    total_comodo_va: number;
    // --- NOVOS CAMPOS: Número de Pontos ---
    iluminacao_pontos: number;
    tugs_pontos: number; // Número total de pontos de TUGs
}

// --- Função para calcular Iluminação e TUGs conforme NBR 5410 (AGORA CALCULA E RETORNA PONTOS) ---
function calcularCargasComodo(data: ComodoData): { iluminacao_va: number; tugs_va: number; iluminacao_pontos: number; tugs_pontos: number } {
    const { area, perimetro, tipo_comodo } = data;

    let iluminacao_va = 0;
    let tugs_va = 0;
    let iluminacao_pontos = 0; // Inicializa contador de pontos de iluminação
    let tugs_pontos = 0;     // Inicializa contador de pontos de TUGs

    // Cálculo da Iluminação (NBR 5410)
    // Sempre no mínimo 1 ponto de luz central (100 VA para até 6m²)
    iluminacao_pontos = 1; // Mínimo de 1 ponto

    if (area <= 6) {
        iluminacao_va = 100;
    } else {
        iluminacao_va = 100; // Carga base para até 6m²
        const areaExcedente = area - 6;
        const numAcrescimos = Math.ceil(areaExcedente / 4); // Cada 4m² ou fração acima de 6m²
        iluminacao_va += numAcrescimos * 60;
        // Nota: A NBR especifica a POTÊNCIA mínima baseada na área.
        // O número de pontos ADICIONAIS de iluminação (além do mínimo de 1 central)
        // não é rigidamente definido por esta regra de área/potência,
        // depende mais do projeto luminotécnico.
        // Mas podemos retornar 1 como o mínimo exigido pela regra baseada na área inicial.
        // Se quisermos um cálculo mais detalhado de pontos, precisaríamos de mais regras.
    }

    // Cálculo das TUGs (NBR 5410)
    if (tipo_comodo === "molhado") {
        // Áreas molhadas: 600 VA para os 3 primeiros pontos, 100 VA para os restantes por perímetro (a cada 3.5m)
        // Mínimo de 3 pontos em banheiros/cozinhas/area de serviço
        const numPontosPerimetroMolhado = Math.floor(perimetro / 3.5);
        const pontosPerimetroMolhado = perimetro % 3.5 > 0 ? numPontosPerimetroMolhado + 1 : numPontosPerimetroMolhado;

        // Garante o mínimo de 3 pontos para áreas molhadas
        tugs_pontos = Math.max(pontosPerimetroMolhado, 3);

        // Calcula a potência dos TUGs em áreas molhadas
        const pontos600va = Math.min(tugs_pontos, 3); // Os primeiros 3 são de 600 VA
        const pontos100va = tugs_pontos - pontos600va; // Os restantes são de 100 VA

        tugs_va = (pontos600va * 600) + (pontos100va * 100);

    } else { // Tipo 'geral' (salas, quartos, corredores, etc.)
        // Áreas secas: 100 VA por ponto, a cada 5m de perímetro
        const numPontosPerimetroGeral = Math.floor(perimetro / 5);
        const pontosPerimetroGeral = perimetro % 5 > 0 ? numPontosPerimetroGeral + 1 : numPontosPerimetroGeral;

        // Garante o mínimo de 1 ponto para áreas gerais
        tugs_pontos = Math.max(pontosPerimetroGeral, 1);

        // Calcula a potência dos TUGs em áreas gerais
        tugs_va = tugs_pontos * 100;
    }

    return {
        iluminacao_va: iluminacao_va,
        tugs_va: tugs_va,
        iluminacao_pontos: iluminacao_pontos, // Retorna o número de pontos de iluminação
        tugs_pontos: tugs_pontos           // Retorna o número de pontos de TUGs
    };
}

// --- Handler para requisições POST na rota /api/dimensionamento ---
export async function POST(request: Request) {
    try {
        const data: ComodoData = await request.json();

        if (typeof data.nome_comodo !== 'string' || typeof data.area !== 'number' || typeof data.perimetro !== 'number' || !['geral', 'molhado'].includes(data.tipo_comodo) || typeof data.equipamentos !== 'number') {
             return NextResponse.json({ error: 'Dados de entrada inválidos' }, { status: 400 });
        }

        // Executa a função de cálculo (agora retorna também os pontos)
        const cargasECalculos = calcularCargasComodo(data);

        const iluminacao_va_calculado = cargasECalculos.iluminacao_va;
        const tugs_va_calculado = cargasECalculos.tugs_va;
        const total_comodo_va = iluminacao_va_calculado + tugs_va_calculado + data.equipamentos;

        // Prepara o resultado a ser enviado de volta (AGORA INCLUI PONTOS)
        const resultado: ResultadoCalculoComodo = {
            nome: data.nome_comodo,
            area: data.area,
            perimetro: data.perimetro,
            tipo: data.tipo_comodo,
            equipamentos_va: data.equipamentos,
            iluminacao_va_calculado: iluminacao_va_calculado,
            tugs_va_calculado: tugs_va_calculado,
            total_comodo_va: total_comodo_va,
            iluminacao_pontos: cargasECalculos.iluminacao_pontos, // Adicionado
            tugs_pontos: cargasECalculos.tugs_pontos           // Adicionado
        };

        return NextResponse.json(resultado, { status: 200 });

    } catch (error) {
        console.error('Erro ao calcular dimensionamento:', error);
        return NextResponse.json({ error: 'Erro interno ao calcular dimensionamento' }, { status: 500 });
    }
}