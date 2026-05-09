import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../services/api';

export function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();

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
            const user = JSON.parse(userStr);
            if (user.tipo !== 'organizacao') {
                navigate('/');
            }
        } else {
            navigate('/login');
        }

        loadEventDetails();
    }, [id, navigate]);

    const loadEventDetails = async () => {
        try {
            const response = await api.get(`/api/eventos/${id}`);
            setEventData(response.data);
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
            const payload = {
                ...eventData,
                quantidade_ingressos: Number(eventData.quantidade_ingressos)
            };

            await api.put(`/api/eventos/${id}`, payload);
            alert('Evento atualizado com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            setErrorMessage(error.response?.data?.mensagem || 'Erro ao alterar evento.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
            try {
                await api.delete(`/eventos/${id}`);
                alert('Evento excluído!');
                navigate('/dashboard');
            } catch (error) {
                setErrorMessage('Erro ao excluir evento.');
            }
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
                            Editar <span className="text-sky-400">Evento NFT</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Atualize as informações do seu evento.</p>
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
                                {isLoading ? 'SALVANDO...' : 'ALTERAR EVENTO'}
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-8 py-4 border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all"
                            >
                                EXCLUIR
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}