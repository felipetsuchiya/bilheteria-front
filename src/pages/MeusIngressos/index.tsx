import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

type Ingresso = {
    id: number;
    id_evento: number;
    evento: string;
    status: string;
    token_id: number | null;
    tx_hash: string | null;
    carteira_comprador: string | null;
    resale_price_wei: string | null;
};

export function MeusIngressos() {
    const navigate = useNavigate();
    const [ingressos, setIngressos] = useState<Ingresso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Revenda
    const [revendaId, setRevendaId] = useState<number | null>(null);
    const [revendaEth, setRevendaEth] = useState('');
    const [revendaLoading, setRevendaLoading] = useState(false);
    const [revendaErro, setRevendaErro] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('@App:usuario');
        if (!userStr) { navigate('/login'); return; }
        const user = JSON.parse(userStr);
        if (user.tipo !== 'cliente') { navigate('/'); return; }
        carregarIngressos();
    }, [navigate]);

    const carregarIngressos = () => {
        api.get('/api/ingressos/meus-ingressos')
            .then(r => setIngressos(
                r.data.ingressos?.flatMap((grupo: any) =>
                    grupo.ingressos.map((ing: any) => ({
                        ...ing,
                        evento: grupo.evento,
                    }))
                ) ?? []
            ))
            .catch(() => setError('Não foi possível carregar seus ingressos.'))
            .finally(() => setIsLoading(false));
    };

    const handleAnunciarRevenda = async (ingresso_id: number) => {
        setRevendaErro('');
        const priceWei = revendaEth ? String(Math.round(parseFloat(revendaEth) * 1e18)) : '';
        if (!priceWei || priceWei === '0') {
            setRevendaErro('Informe um preço válido em ETH.');
            return;
        }
        setRevendaLoading(true);
        try {
            await api.post(`/api/ingressos/${ingresso_id}/anunciar-revenda`, { price_wei: priceWei });
            setRevendaId(null);
            setRevendaEth('');
            setIsLoading(true);
            carregarIngressos();
        } catch (e: any) {
            setRevendaErro(e.response?.data?.erro || 'Erro ao anunciar revenda.');
        } finally {
            setRevendaLoading(false);
        }
    };

    const shortHash = (h: string) => `${h.slice(0, 10)}...${h.slice(-6)}`;
    const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
    const weiToEth = (w: string) => (Number(w) / 1e18).toFixed(4);

    const statusColor: Record<string, string> = {
        disponivel: 'bg-sky-100 text-sky-700',
        ativo: 'bg-green-100 text-green-700',
        a_venda: 'bg-amber-100 text-amber-700',
        utilizado: 'bg-slate-100 text-slate-500',
        pendente_blockchain: 'bg-red-100 text-red-600',
    };

    const statusLabel: Record<string, string> = {
        disponivel: 'Disponível',
        ativo: 'Ativo',
        a_venda: 'À Venda',
        utilizado: 'Utilizado',
        pendente_blockchain: 'Pendente',
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-[#0c1b35]">
                        Meus <span className="text-sky-500">Ingressos</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Seus NFTs de ingresso registrados na blockchain Sepolia.</p>
                </div>

                {isLoading && (
                    <div className="text-center text-sky-500 font-bold py-20 animate-pulse">
                        Carregando seus ingressos...
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                        {error}
                    </div>
                )}

                {!isLoading && !error && ingressos.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <div className="text-6xl mb-4">🎫</div>
                        <p className="text-lg font-semibold">Você ainda não tem ingressos.</p>
                        <Link to="/" className="mt-4 inline-block bg-[#0d59f7] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0047e0] transition-colors">
                            Ver eventos
                        </Link>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {ingressos.map(ing => (
                        <div key={ing.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">

                                <div className="flex gap-4 items-center">
                                    <img
                                        src={`https://picsum.photos/seed/${ing.id_evento}/80/80`}
                                        alt={ing.evento}
                                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                                    />
                                    <div>
                                        <div className="font-bold text-[#0c1b35] text-lg leading-tight">{ing.evento}</div>
                                        <div className="text-sm text-slate-400 mt-0.5">Ingresso #{ing.id}</div>
                                        <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[ing.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                            {statusLabel[ing.status] ?? ing.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 text-sm md:text-right">
                                    {ing.token_id !== null ? (
                                        <>
                                            <div className="font-semibold text-[#0c1b35]">
                                                Token ID: <span className="font-mono text-sky-600">#{ing.token_id}</span>
                                            </div>
                                            {ing.carteira_comprador && (
                                                <div className="text-slate-400 font-mono text-xs">
                                                    Dono: {shortAddr(ing.carteira_comprador)}
                                                </div>
                                            )}
                                            {ing.tx_hash && (
                                                <a
                                                    href={`https://sepolia.etherscan.io/tx/${ing.tx_hash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-500 hover:underline font-mono text-xs"
                                                >
                                                    {shortHash(ing.tx_hash)}
                                                </a>
                                            )}
                                            {ing.status === 'a_venda' && ing.resale_price_wei && (
                                                <div className="text-amber-600 font-bold text-xs">
                                                    À venda por {weiToEth(ing.resale_price_wei)} ETH
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">NFT não mintado</span>
                                    )}

                                    {ing.status === 'ativo' && ing.token_id !== null && (
                                        <button
                                            onClick={() => { setRevendaId(ing.id); setRevendaEth(''); setRevendaErro(''); }}
                                            className="mt-1 text-xs font-bold text-amber-600 border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Anunciar Revenda
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Painel de revenda inline */}
                            {revendaId === ing.id && (
                                <div className="border-t border-slate-100 bg-amber-50 px-6 py-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">
                                        Definir preço de revenda para Token #{ing.token_id}
                                    </p>
                                    <div className="flex gap-3 items-center flex-wrap">
                                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                                            <input
                                                type="number"
                                                step="0.001"
                                                min="0.001"
                                                placeholder="0.001"
                                                value={revendaEth}
                                                onChange={e => setRevendaEth(e.target.value)}
                                                className="w-28 outline-none text-sm font-mono text-slate-800"
                                            />
                                            <span className="text-slate-400 text-sm font-medium">ETH</span>
                                        </div>
                                        <button
                                            onClick={() => handleAnunciarRevenda(ing.id)}
                                            disabled={revendaLoading}
                                            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                                        >
                                            {revendaLoading ? 'Anunciando...' : 'Confirmar'}
                                        </button>
                                        <button
                                            onClick={() => setRevendaId(null)}
                                            className="text-slate-400 hover:text-slate-600 text-sm px-2 py-2"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                    {revendaErro && (
                                        <p className="text-red-500 text-xs mt-2">{revendaErro}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
