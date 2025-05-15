// app/dimensionamento/page.tsx

'use client'; // Indica que este componente é executado no cliente (navegador)

import React, { useState, FormEvent } from 'react';
// Podemos criar interfaces compartilhadas depois, por agora, definimos aqui novamente
interface ComodoData {
    nome_comodo: string;
    area: number;
    perimetro: number;
    tipo_comodo: 'geral' | 'molhado';
    equipamentos: number;
}

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


export default function DimensionamentoPage() {
    // Estado para armazenar os dados do formulário
    const [formData, setFormData] = useState<ComodoData>({
        nome_comodo: '',
        area: 0,
        perimetro: 0,
        tipo_comodo: 'geral',
        equipamentos: 0,
    });

    // Estado para armazenar o resultado do cálculo
    const [resultado, setResultado] = useState<ResultadoCalculoComodo | null>(null);
    // Estado para lidar com mensagens de erro
    const [erro, setErro] = useState<string | null>(null);
     // Estado para indicar que está a carregar (a enviar a requisição)
    const [carregando, setCarregando] = useState(false);


    // Função para lidar com a mudança nos inputs do formulário
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'area' || name === 'perimetro' || name === 'equipamentos' ? parseFloat(value) : value,
        });
    };

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)
        setCarregando(true); // Inicia o estado de carregamento
        setErro(null); // Limpa qualquer erro anterior
        setResultado(null); // Limpa resultados anteriores


        try {
            // Envia os dados do formulário para a nossa rota de API
            const response = await fetch('/api/dimensionamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Converte os dados do formulário para JSON
            });

            // Verifica se a requisição foi bem-sucedida
            if (!response.ok) {
                // Se houver um erro, tenta ler a mensagem de erro da resposta
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao calcular dimensionamento');
            }

            // Se a requisição foi bem-sucedida, lê o resultado JSON
            const data: ResultadoCalculoComodo = await response.json();
            setResultado(data); // Atualiza o estado com o resultado

        } catch (error: any) {
            // Se ocorrer um erro (na requisição ou no código), define a mensagem de erro
            setErro(error.message || 'Ocorreu um erro desconhecido.');
        } finally {
            setCarregando(false); // Finaliza o estado de carregamento
        }
    };

    return (
        <div>
            <h1>Calculadora de Dimensionamento Elétrico NBR 5410</h1>
            <p>Informe os dados do cômodo para calcular as cargas mínimas.</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nome_comodo">Nome do Cômodo:</label>
                    <input
                        type="text"
                        id="nome_comodo"
                        name="nome_comodo"
                        value={formData.nome_comodo}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <br />
                <div>
                    <label htmlFor="area">Área (m²):</label>
                    <input
                        type="number"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                    />
                </div>
                 <br />
                <div>
                    <label htmlFor="perimetro">Perímetro (m):</label>
                    <input
                        type="number"
                        id="perimetro"
                        name="perimetro"
                        value={formData.perimetro}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                    />
                </div>
                 <br />
                <div>
                    <label htmlFor="tipo_comodo">Tipo de Cômodo:</label>
                    <select
                        id="tipo_comodo"
                        name="tipo_comodo"
                        value={formData.tipo_comodo}
                        onChange={handleInputChange}
                    >
                        <option value="geral">Geral</option>
                        <option value="molhado">Molhado</option>
                    </select>
                </div>
                 <br />
                 <div>
                    <label htmlFor="equipamentos">Potência de Equipamentos Específicos (VA):</label>
                    <input
                        type="number"
                        id="equipamentos"
                        name="equipamentos"
                        value={formData.equipamentos}
                        onChange={handleInputChange}
                        step="0.01"
                    />
                </div>
                 <br />
                <button type="submit" disabled={carregando}>
                    {carregando ? 'Calculando...' : 'Calcular Cargas'}
                </button>
            </form>

            {/* Área para mostrar o erro, se existir */}
            {erro && <div style={{ color: 'red', marginTop: '20px' }}>Erro: {erro}</div>}

            {/* Área para mostrar o resultado, se existir */}
            {resultado && (
                <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
                    <h2>Resultado para {resultado.nome}:</h2>
                    <p>Área: {resultado.area} m²</p>
                    <p>Perímetro: {resultado.perimetro} m</p>
                    <p>Tipo: {resultado.tipo === 'geral' ? 'Geral' : 'Molhado'}</p>
                    <p>Equipamentos Específicos (TUEs): {resultado.equipamentos_va} VA</p>
                    <p>Potência Mínima de Iluminação: {resultado.iluminacao_va_calculado} VA</p>
                    <p>Potência Mínima de TUGs: {resultado.tugs_va_calculado} VA</p>
                    <p><strong>Potência Total do Cômodo: {resultado.total_comodo_va} VA</strong></p>
                </div>
            )}

        </div>
    );
}