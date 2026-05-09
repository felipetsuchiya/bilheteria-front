import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';

export function CreateEvent() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    const [eventData, setEventData] = useState({
        nome: '', 
        descricao: '',
        data_evento: '',
        localizacao: '',
        preco_eth: '',
        quantidade_ingressos: ''
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
        setIsLoading(true);
        setErrorMessage('');

        try {
            // Montando o payload com o id da organização do usuário logado
            const payload = {
                ...eventData,
                quantidade_ingressos: Number(eventData.quantidade_ingressos),
                id_organizacao: user?.id 
            };

            await api.post('/api/eventos', payload);
            alert('Evento criado com sucesso!');
            navigate('/dashboard');

        } catch (error: any) {
            setErrorMessage(error.response?.data?.mensagem || 'Erro ao salvar evento.');
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
                                placeholder="Ex: Workshop Web3 Koym"
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
                                    name="localizacao"
                                    value={eventData.localizacao}
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:bg-slate-400 mt-4"
                        >
                            {isLoading ? 'SALVANDO...' : 'CRIAR EVENTO'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}