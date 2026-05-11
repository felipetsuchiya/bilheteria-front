import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    const [eventos, setEventos] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('@App:usuario');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser.tipo !== 'organizacao') {
                navigate('/');
            } else {
                setUser(parsedUser);
                // Passamos o usuário recém-lido para a função
                carregarDashboard(parsedUser);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Agora a função recebe o usuário logado para poder fazer o filtro
    const carregarDashboard = async (currentUser: any) => {
        try {
            const response = await api.get('/api/eventos', {
                params: { id_usuario: currentUser.id }
            });

            console.log(response.data)

            const meusEventos = response.data.filter(
                (evento: any) => evento.id_usuario === currentUser.id
            );

            setEventos(meusEventos);
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">

            <aside className="w-full md:w-64 bg-[#0c1b35] shrink-0 border-r border-slate-800 shadow-xl z-10 md:min-h-screen">
                <div className="p-6">
                    <div className="text-xs font-bold text-sky-400 tracking-wider mb-2 uppercase">
                        Painel de Controle
                    </div>
                    <h2 className="text-xl font-bold text-white truncate">
                        {user.nome}
                    </h2>
                </div>

                <nav className="mt-2 flex flex-col gap-1 px-4">
                    <a href="/dashboard" className="flex items-center gap-3 bg-[#16274a] text-white px-4 py-3 rounded-xl transition-colors">
                        <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span className="font-medium text-sm">Visão Geral</span>
                    </a>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#0c1b35] tracking-tight">
                            Bem-vindo de volta!
                        </h1>
                        <p className="text-slate-500 mt-1">Acompanhe as métricas dos seus eventos e ingressos NFT.</p>
                    </div>
                    <button
                        onClick={() => navigate('/evento/novo')}
                        className="bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2 justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        CRIAR NOVO EVENTO
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#0c1b35] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl"></div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Meus Eventos Ativos</p>
                        <h3 className="text-3xl font-bold text-white mb-2">{eventos.length}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-[#0c1b35]">Meus Eventos</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 font-medium text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Nome do Evento</th>
                                    <th className="px-6 py-4">Qtd. Ingressos</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoadingData ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                            Carregando eventos...
                                        </td>
                                    </tr>
                                ) : eventos.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                            Nenhum evento criado ainda. Clique em "Criar Novo Evento" para começar.
                                        </td>
                                    </tr>
                                ) : (
                                    eventos.map((evento: any) => (
                                        <tr key={evento.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-[#0c1b35]">
                                                {evento.nome}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {evento.quantidade_ingressos}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/evento/editar/${evento.id}`)}
                                                    className="text-sky-500 hover:text-sky-700 font-semibold text-sm px-3 py-1 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}