import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useMetaMask } from '../../../hooks/useMetaMask';

const CONTRACT_ADDRESS = '0x998B81b2DA9677e84B892d0A02Aa2c4238676CD6';

type SuccessData = {
    id: number;
    nome: string;
    blockchain_event_id: number;
    ticket_price_wei: string;
    max_resale_price_wei: string;
    quantidade_ingressos: number;
    royalty_bps: number;
};

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
        teto_revenda_eth: '',
        royalty_pct: '10',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successData, setSuccessData] = useState<SuccessData | null>(null);

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
            let dataHoraFormatada = '';
            if (eventData.data_evento) {
                const [datePart, timePart] = eventData.data_evento.split('T');
                const timeWithSeconds = timePart.length === 5 ? `${timePart}:00` : timePart;
                dataHoraFormatada = `${datePart} ${timeWithSeconds}`;
            }

            const ticketPriceWei = eventData.preco_eth
                ? String(Math.round(parseFloat(eventData.preco_eth) * 1e18))
                : undefined;

            const royalty_bps = Math.round(parseFloat(eventData.royalty_pct || '10') * 100);

            const payload: any = {
                nome: eventData.nome,
                quantidade_ingressos: Number(eventData.quantidade_ingressos),
                data_hora: dataHoraFormatada,
                local_evento: eventData.local_evento,
                descricao_evento: eventData.descricao,
            };

            if (ticketPriceWei) {
                payload.ticket_price_wei = ticketPriceWei;
                payload.max_resale_price_wei = eventData.teto_revenda_eth
                    ? String(Math.round(parseFloat(eventData.teto_revenda_eth) * 1e18))
                    : '0';
                payload.royalty_bps = royalty_bps;
            }

            const res = await api.post('/api/eventos', payload, { timeout: 150000 });

            setSuccessData({
                id: res.data.id,
                nome: res.data.nome,
                blockchain_event_id: res.data.blockchain_event_id,
                ticket_price_wei: res.data.ticket_price_wei,
                max_resale_price_wei: res.data.max_resale_price_wei,
                quantidade_ingressos: res.data.quantidade_ingressos,
                royalty_bps,
            });

        } catch (error: any) {
            console.error("Erro completo:", error.response?.data);
            const msgErro = error.response?.data?.mensagem
                || error.response?.data?.erro
                || (error.code === 'ECONNABORTED' ? 'Timeout — a transação está sendo confirmada na blockchain. Aguarde e tente novamente com o mesmo nome.' : null)
                || (!error.response ? 'Sem resposta do servidor. Backend está rodando?' : null)
                || `Erro ${error.response?.status}: Erro ao salvar evento.`;
            setErrorMessage(msgErro);
        } finally {
            setIsLoading(false);
        }
    };

    const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
    const weiToEth = (wei: string | null) =>
        !wei || wei === '0' ? '—' : (Number(wei) / 1e18).toFixed(4) + ' ETH';

    // ── TELA DE SUCESSO ──────────────────────────────────────────────
    if (successData) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-2xl font-extrabold text-[#0c1b35] mb-2">Evento Criado!</h2>
                <p className="text-slate-500 mb-6">
                    O evento foi registrado no sistema e na blockchain Sepolia.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Nome</span>
                        <span className="font-bold text-slate-800 text-right max-w-52 truncate">{successData.nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Event ID on-chain</span>
                        <span className="font-mono font-bold text-sky-600">#{successData.blockchain_event_id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Preço</span>
                        <span className="font-bold text-emerald-600">{weiToEth(successData.ticket_price_wei)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Teto de revenda</span>
                        <span className="font-bold text-slate-700">
                            {successData.max_resale_price_wei === '0' || !successData.max_resale_price_wei
                                ? 'Sem limite'
                                : weiToEth(successData.max_resale_price_wei)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Royalty</span>
                        <span className="font-bold text-slate-700">{(successData.royalty_bps / 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Capacidade</span>
                        <span className="font-bold text-slate-700">{successData.quantidade_ingressos} ingressos</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Organizador</span>
                        <span className="font-mono text-slate-600">{account ? shortAddr(account) : '—'}</span>
                    </div>
                    <div className="text-sm pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium block mb-1">Contrato na Sepolia</span>
                        <a
                            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-sky-600 hover:underline break-all text-xs"
                        >
                            {CONTRACT_ADDRESS}
                        </a>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-[#0d59f7] hover:bg-[#0047e0] text-white font-extrabold py-3 rounded-xl transition-colors"
                    >
                        Ir para o Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setSuccessData(null);
                            setEventData({ nome: '', descricao: '', data_evento: '', local_evento: '', preco_eth: '', quantidade_ingressos: '', teto_revenda_eth: '', royalty_pct: '10' });
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                    >
                        Criar Outro Evento
                    </button>
                </div>
            </div>
        </div>
    );

    // ── FORMULÁRIO ───────────────────────────────────────────────────
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
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium whitespace-pre-line">
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
                                    <label className="text-sm font-bold text-slate-700">Royalty por Revenda (%)</label>
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
                                    <p className="text-xs text-slate-400">Porcentagem que vai para a organização a cada revenda. Máx: 50%.</p>
                                </div>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-700 text-sm font-medium">
                                <svg className="w-5 h-5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                                Registrando evento na blockchain Sepolia... Aguarde a confirmação da transação (pode levar até 60s).
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !account}
                            className="w-full bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:bg-slate-400 mt-4"
                        >
                            {isLoading ? 'REGISTRANDO NA BLOCKCHAIN...' : !account ? 'CONECTE SUA METAMASK' : 'CRIAR EVENTO'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
