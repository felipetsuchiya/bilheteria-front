import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    // Proteção de Rota: Verifica se o usuário está logado e se é uma organização
    useEffect(() => {
        const userStr = localStorage.getItem('@NFTix:usuario');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser.tipo !== 'organizacao') {
                navigate('/'); // Se for cliente, manda pro catálogo
            } else {
                setUser(parsedUser);
            }
        } else {
            navigate('/login'); // Se não tiver logado, manda pro login
        }
    }, [navigate]);

    // Enquanto carrega/verifica, não renderiza nada para evitar "piscar" a tela
    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">

            {/* --- SIDEBAR (Barra Lateral) --- */}
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
                    <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-[#16274a]/50 px-4 py-3 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="font-medium text-sm">Meus Eventos</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-[#16274a]/50 px-4 py-3 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-medium text-sm">Vendas & Saques</span>
                    </a>
                </nav>
            </aside>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

                {/* Header do Dashboard */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#0c1b35] tracking-tight">
                            Bem-vindo de volta!
                        </h1>
                        <p className="text-slate-500 mt-1">Acompanhe as métricas dos seus eventos e ingressos NFT.</p>
                    </div>
                    <button className="bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2 justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        CRIAR NOVO EVENTO
                    </button>
                </div>

                {/* Cards de Estatísticas (Mockados por enquanto) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    <div className="bg-[#0c1b35] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl"></div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Receita Total</p>
                        <h3 className="text-3xl font-bold text-white mb-2">2.45 <span className="text-sky-400 text-lg">ETH</span></h3>
                        <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            +12% este mês
                        </p>
                    </div>

                    <div className="bg-[#0c1b35] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Ingressos Vendidos</p>
                        <h3 className="text-3xl font-bold text-white mb-2">1.284</h3>
                        <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            +54 na última semana
                        </p>
                    </div>

                    <div className="bg-[#0c1b35] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Eventos Ativos</p>
                        <h3 className="text-3xl font-bold text-white mb-2">3</h3>
                        <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                            Próximo evento em 12 dias
                        </p>
                    </div>

                </div>

                {/* Tabela de Eventos Recentes */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-[#0c1b35]">Eventos Recentes</h2>
                        <a href="#" className="text-sm font-semibold text-sky-500 hover:text-sky-600">Ver todos</a>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 font-medium text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Nome do Evento</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Vendas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Exemplo de Linha 1 */}
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-[#0c1b35]">
                                        Sunset Mega Funk 2025
                                    </td>
                                    <td className="px-6 py-4">15 Nov 2025</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">Ativo</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">850 / 1000</td>
                                </tr>
                                {/* Exemplo de Linha 2 */}
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-[#0c1b35]">
                                        F1 Watch Party VIP
                                    </td>
                                    <td className="px-6 py-4">02 Dez 2025</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold">Pausado</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">210 / 500</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}