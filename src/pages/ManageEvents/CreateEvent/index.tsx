import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useMetaMask } from '../../../hooks/useMetaMask';

export function CreateEvent() {
    const navigate = useNavigate();
    const [, setUser] = useState<any>(null);

    const { account, isConnecting, connect } = useMetaMask();

    const [eventData, setEventData] = useState({
        nome: '',
        descricao: '',
        data_evento: '',
        local_evento: '',
        preco_eth: '',
        quantidade_ingressos: '',
        teto_revenda_eth: '',    // vazio = sem limite
        royalty_pct: '10',       // padrão 10%
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('@App:usuario');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser.tipo !== 'organizacao') {
                navigate('/');
            } else {
                setUser(parsedUser);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) {
            setErrorMessage('Conecte sua MetaMask antes de criar o evento. Sua carteira é necessária para receber os pagamentos dos ingressos.');
            return;
        }
        setIsLoading(true);
        setErrorMessage('');

        try {
            // 1. Formatação blindada para o formato SQL que o backend espera no POST
            let dataHoraFormatada = '';
            if (eventData.data_evento) {
                // Divide "2026-06-15T00:00" em Data e Hora
                const [datePart, timePart] = eventData.data_evento.split('T');
                
                // Se a hora vier só com "HH:MM", adicionamos os segundos ":00"
                const timeWithSeconds = timePart.length === 5 ? `${timePart}:00` : timePart;
                
                // Junta tudo no formato esperado: "YYYY-MM-DD HH:MM:SS"
                dataHoraFormatada = `${datePart} ${timeWithSeconds}`;
            }

            // Converte ETH → wei (string para preservar precisão)
            const ticketPriceWei = eventData.preco_eth
                ? String(Math.round(parseFloat(eventData.preco_eth) * 1e18))
                : undefined;

            const payload: any = {
                nome: eventData.nome,
                quantidade_ingressos: Number(eventData.quantidade_ingressos),
                data_hora: dataHoraFormatada,
                local_evento: eventData.local_evento,
                descricao_evento: eventData.descricao,
            };

            if (ticketPriceWei) {
                payload.ticket_price_wei = ticketPriceWei;

                // Teto de revenda: vazio ou 0 = sem limite
                payload.max_resale_price_wei = eventData.teto_revenda_eth
                    ? String(Math.round(parseFloat(eventData.teto_revenda_eth) * 1e18))
                    : '0';

                // Royalty: converte % para basis points (10% → 1000)
                payload.royalty_bps = Math.round(parseFloat(eventData.royalty_pct || '10') * 100);
            }

            await api.post('/api/eventos', payload, { timeout: 150000 });
            navigate('/dashboard', { state: { mensagem: 'Evento criado com sucesso!' } });

        } catch (error: any) {
            console.error("Erro completo:", error.response?.data);
            const msgErro = error.response?.data?.mensagem
                || error.response?.data?.erro
                || (error.code === 'ECONNABORTED' ? 'Timeout — backend demorou demais.' : null)
                || (!error.response ? 'Sem resposta do servidor. Backend está rodando?' : null)
                || `Erro ${error.response?.status}: Erro ao salvar evento.`;
            setErrorMessage(msgErro);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0c1b35] mb-6 font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Voltar ao Dashboard
                </button>

                <div className="bg-white rounded-[30px] shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-[#0c1b35] p-8 text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            Criar Novo <span className="text-sky-400">Evento NFT</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Preencha as informações para emitir os ingressos na blockchain.</p>
                    </div>

                    <form onSubmit={handleSave} className="p-8 flex flex-col gap-6">
                        {!account && (
                            <div className="flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-300 rounded-xl">
                                <p className="text-amber-800 text-sm font-medium">
                                    🦊 MetaMask não conectada. Sua carteira é necessária para receber os pagamentos dos ingressos.
                                </p>
                                <button
                                    type="button"
                                    onClick={connect}
                                    disabled={isConnecting}
                                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isConnecting ? 'Conectando...' : 'Conectar'}
                                </button>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Nome do Evento</label>
                            <input
                                type="text"
                                name="nome"
                                value={eventData.nome}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Workshop Web3 Koyn"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Descrição do Evento</label>
                            <textarea
                                name="descricao"
                                value={eventData.descricao}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Descreva os detalhes do evento e benefícios do NFT..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Data e Hora</label>
                                <input
                                    type="datetime-local"
                                    name="data_evento"
                                    value={eventData.data_evento}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Localização / Link</label>
                                <input
                                    type="text"
                                    name="local_evento"
                                    value={eventData.local_evento}
                                    onChange={handleChange}
                                    required
                                    placeholder="Endereço físico ou URL"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Preço por Ingresso (ETH)</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="preco_eth"
                                    value={eventData.preco_eth}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.05"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Quantidade de Ingressos</label>
                                <input
                                    type="number"
                                    name="quantidade_ingressos"
                                    value={eventData.quantidade_ingressos}
                                    onChange={handleChange}
                                    required
                                    placeholder="100"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Regras de Revenda */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">Anti-cambismo</span>
                                Regras de Revenda
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">
                                        Teto de Revenda (ETH)
                                        <span className="text-slate-400 font-normal ml-1">— vazio = sem limite</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        name="teto_revenda_eth"
                                        value={eventData.teto_revenda_eth}
                                        onChange={handleChange}
                                        placeholder="Ex: 0.1 (deixe vazio para sem limite)"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">
                                        Royalty por Revenda (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="50"
                                        name="royalty_pct"
                                        value={eventData.royalty_pct}
                                        onChange={handleChange}
                                        placeholder="10"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none"
                                    />
                                    <p className="text-xs text-slate-400">
                                        Porcentagem que vai para a organização a cada revenda. Máx: 50%.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !account}
                            className="w-full bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:bg-slate-400 mt-4"
                        >
                            {isLoading ? 'SALVANDO...' : !account ? 'CONECTE SUA METAMASK' : 'CRIAR EVENTO'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}