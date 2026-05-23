import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../services/api';

export function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Campos editáveis (apenas off-chain)
    const [eventData, setEventData] = useState({
        nome: '',
        descricao_evento: '',
        data_evento: '',
        local_evento: '',
    });

    // Campos somente-leitura (gravados na blockchain)
    const [blockchainInfo, setBlockchainInfo] = useState({
        ticket_price_wei: '',
        quantidade_ingressos: '',
        blockchain_event_id: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('@App:usuario');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.tipo !== 'organizacao') navigate('/');
        } else {
            navigate('/login');
        }
        loadEventDetails();
    }, [id, navigate]);

    const loadEventDetails = async () => {
        try {
            const response = await api.get(`/api/eventos/${id}`);
            const data = response.data;

            let dataFormatadaParaInput = '';
            if (data.data_hora) {
                const dateObj = new Date(data.data_hora);
                dataFormatadaParaInput = dateObj.toISOString().slice(0, 16);
            }

            setEventData({
                nome: data.nome || '',
                descricao_evento: data.descricao_evento || '',
                data_evento: dataFormatadaParaInput,
                local_evento: data.local_evento || '',
            });

            // Preenche info blockchain para exibição (somente leitura)
            const priceEth = data.ticket_price_wei
                ? (Number(data.ticket_price_wei) / 1e18).toFixed(4)
                : '—';
            setBlockchainInfo({
                ticket_price_wei: priceEth,
                quantidade_ingressos: data.quantidade_ingressos || '—',
                blockchain_event_id: data.blockchain_event_id != null ? String(data.blockchain_event_id) : '—',
            });

        } catch (error) {
            setErrorMessage('Erro ao carregar detalhes do evento.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            let dataHoraFormatada = '';
            if (eventData.data_evento) {
                const [datePart, timePart] = eventData.data_evento.split('T');
                const timeWithSeconds = timePart.length === 5 ? `${timePart}:00` : timePart;
                dataHoraFormatada = `${datePart} ${timeWithSeconds}`;
            }

            // Envia apenas campos off-chain — nunca preco ou quantidade (blockchain)
            const payload = {
                nome: eventData.nome,
                data_hora: dataHoraFormatada,
                local_evento: eventData.local_evento,
                descricao_evento: eventData.descricao_evento,
            };

            await api.put(`/api/eventos/${id}`, payload);
            navigate('/dashboard', { state: { mensagem: 'Evento atualizado com sucesso!' } });
        } catch (error: any) {
            const msgErro = error.response?.data?.mensagem || error.response?.data?.erro || 'Erro ao alterar evento.';
            setErrorMessage(msgErro);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/eventos/${id}`);
            navigate('/dashboard', { state: { mensagem: 'Evento excluído com sucesso.' } });
        } catch (error) {
            setErrorMessage('Erro ao excluir evento.');
            setConfirmarExclusao(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0c1b35] mb-6 font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar ao Dashboard
                </button>

                <div className="bg-white rounded-[30px] shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-[#0c1b35] p-8 text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            Editar <span className="text-sky-400">Evento NFT</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Atualize as informações descritivas do evento.</p>
                    </div>

                    <div className="p-8 flex flex-col gap-6">
                        {errorMessage && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                                {errorMessage}
                            </div>
                        )}

                        {/* Banner blockchain — campos imutáveis */}
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <span className="text-amber-500 text-xl shrink-0">🔒</span>
                            <div>
                                <p className="text-sm font-bold text-amber-800 mb-1">
                                    Campos registrados na blockchain não podem ser alterados
                                </p>
                                <p className="text-xs text-amber-700">
                                    O contrato KoynTicket na Sepolia é imutável após o deploy. Preço, quantidade e ID on-chain
                                    ficam gravados permanentemente. Apenas as informações descritivas abaixo podem ser editadas.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-3 text-xs font-mono">
                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                                        Preço: {blockchainInfo.ticket_price_wei} ETH
                                    </span>
                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                                        Ingressos: {blockchainInfo.quantidade_ingressos}
                                    </span>
                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                                        Event ID on-chain: #{blockchainInfo.blockchain_event_id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Nome do Evento</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={eventData.nome}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Descrição do Evento</label>
                                <textarea
                                    name="descricao_evento"
                                    value={eventData.descricao_evento}
                                    onChange={handleChange}
                                    required
                                    rows={4}
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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col md:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:bg-slate-400"
                                >
                                    {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>

                                {!confirmarExclusao ? (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmarExclusao(true)}
                                        className="px-8 py-4 border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all"
                                    >
                                        EXCLUIR
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm font-semibold text-red-700">Tem certeza? Esta ação não pode ser desfeita.</p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition-colors"
                                            >
                                                Confirmar exclusão
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmarExclusao(false)}
                                                className="flex-1 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl hover:bg-slate-100 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
