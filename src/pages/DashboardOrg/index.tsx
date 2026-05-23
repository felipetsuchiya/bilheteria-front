import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { Html5Qrcode } from 'html5-qrcode';

export function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState((location.state as any)?.mensagem || '');

    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(''), 4000);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    const [eventos, setEventos] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState<'eventos' | 'validar'>('eventos');

    // Validação de ingresso
    const [tokenIdInput, setTokenIdInput] = useState('');
    const [eventoIdSelecionado, setEventoIdSelecionado] = useState('');
    const [validandoStatus, setValidandoStatus] = useState<'idle' | 'loading' | 'ok' | 'erro'>('idle');
    const [validandoMsg, setValidandoMsg] = useState('');
    const [validandoDetalhe, setValidandoDetalhe] = useState<any>(null);
    const [scanAtivo, setScanAtivo] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

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

    const handleValidar = async (qrToken: string) => {
        const token = qrToken.trim();
        if (!token || !eventoIdSelecionado) {
            setValidandoStatus('erro');
            setValidandoMsg('Selecione o evento e escaneie ou cole o QR Token.');
            return;
        }
        setValidandoStatus('loading');
        setValidandoMsg('');
        setValidandoDetalhe(null);
        try {
            const res = await api.post('/api/ingressos/validar', {
                qr_token: token,
                evento_id: Number(eventoIdSelecionado),
            });
            setValidandoStatus('ok');
            setValidandoMsg(res.data.mensagem);
            setValidandoDetalhe(res.data);
            setTokenIdInput('');
        } catch (e: any) {
            setValidandoStatus('erro');
            setValidandoMsg(
                e.response?.data?.motivo ||
                e.response?.data?.erro ||
                'Erro ao validar ingresso.'
            );
        }
    };

    const iniciarCamera = async () => {
        setScanAtivo(true);
        setValidandoStatus('idle');
        setValidandoMsg('');
        setTimeout(async () => {
            try {
                const scanner = new Html5Qrcode('qr-reader');
                scannerRef.current = scanner;
                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        await scanner.stop();
                        scannerRef.current = null;
                        setScanAtivo(false);
                        setTokenIdInput(decodedText);
                        await handleValidar(decodedText);
                    },
                    () => {}
                );
            } catch {
                setScanAtivo(false);
                setValidandoStatus('erro');
                setValidandoMsg('Não foi possível acessar a câmera.');
            }
        }, 100);
    };

    const pararCamera = async () => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch {}
            scannerRef.current = null;
        }
        setScanAtivo(false);
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
                    <button
                        onClick={() => setAbaAtiva('eventos')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${abaAtiva === 'eventos' ? 'bg-[#16274a] text-white' : 'text-slate-400 hover:bg-[#16274a]/50 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span className="font-medium text-sm">Visão Geral</span>
                    </button>
                    <button
                        onClick={() => { setAbaAtiva('validar'); setValidandoStatus('idle'); setValidandoMsg(''); setValidandoDetalhe(null); pararCamera(); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${abaAtiva === 'validar' ? 'bg-[#16274a] text-white' : 'text-slate-400 hover:bg-[#16274a]/50 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-medium text-sm">Validar Ingresso</span>
                    </button>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {successMsg && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-xl flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {successMsg}
                    </div>
                )}

                {/* ABA: VALIDAR INGRESSO */}
                {abaAtiva === 'validar' && (
                    <div className="max-w-lg mx-auto">
                        <h1 className="text-3xl font-extrabold text-[#0c1b35] mb-2">Validar Ingresso</h1>
                        <p className="text-slate-500 mb-8">Escaneie o QR Code ou digite o Token ID para liberar a entrada.</p>

                        {/* Seleção de evento */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
                            <label className="text-sm font-bold text-slate-700 block mb-2">Evento</label>
                            <select
                                value={eventoIdSelecionado}
                                onChange={e => setEventoIdSelecionado(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                            >
                                <option value="">Selecione o evento...</option>
                                {eventos.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.nome}</option>
                                ))}
                            </select>
                        </div>

                        {/* Input manual */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
                            <label className="text-sm font-bold text-slate-700 block mb-2">
                                QR Token
                                <span className="text-slate-400 font-normal ml-1">— cole o conteúdo do QR ou use a câmera</span>
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="eyJhbGci..."
                                    value={tokenIdInput}
                                    onChange={e => setTokenIdInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleValidar(tokenIdInput)}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-800 text-xs"
                                />
                                <button
                                    onClick={() => handleValidar(tokenIdInput)}
                                    disabled={validandoStatus === 'loading'}
                                    className="bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {validandoStatus === 'loading' ? '...' : 'Validar'}
                                </button>
                            </div>
                        </div>

                        {/* Câmera */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-slate-700">Câmera / QR Code</span>
                                {!scanAtivo ? (
                                    <button
                                        onClick={iniciarCamera}
                                        className="text-sm font-bold text-sky-600 border border-sky-200 hover:bg-sky-50 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        📷 Abrir câmera
                                    </button>
                                ) : (
                                    <button
                                        onClick={pararCamera}
                                        className="text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        Parar
                                    </button>
                                )}
                            </div>
                            {scanAtivo && <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />}
                            {!scanAtivo && (
                                <p className="text-xs text-slate-400 text-center py-4">
                                    Clique em "Abrir câmera" para escanear o QR Code do ingresso.
                                </p>
                            )}
                        </div>

                        {/* Resultado */}
                        {validandoStatus === 'ok' && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                                <div className="text-4xl mb-3">✅</div>
                                <h3 className="text-lg font-extrabold text-green-700 mb-1">{validandoMsg}</h3>
                                {validandoDetalhe && (
                                    <div className="mt-3 text-sm text-green-600 space-y-1">
                                        <p>Token NFT <span className="font-mono font-bold">#{validandoDetalhe.token_id}</span></p>
                                        {validandoDetalhe.carteira_comprador && (
                                            <p className="font-mono text-xs text-green-500">
                                                {validandoDetalhe.carteira_comprador.slice(0, 10)}...{validandoDetalhe.carteira_comprador.slice(-6)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {validandoStatus === 'erro' && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                <div className="text-4xl mb-3">❌</div>
                                <h3 className="text-lg font-extrabold text-red-700">{validandoMsg}</h3>
                            </div>
                        )}
                    </div>
                )}

                {/* ABA: VISÃO GERAL */}
                {abaAtiva === 'eventos' && <>
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

                </>}

            </main>
        </div>
    );
}