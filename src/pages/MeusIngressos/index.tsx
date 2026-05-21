import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useMetaMask } from '../../hooks/useMetaMask';
import QRCode from 'react-qr-code';

type Ingresso = {
    id: number;
    id_evento: number;
    evento: string;
    status: string;
    token_id: number | null;
    tx_hash: string | null;
    carteira_comprador: string | null;
    resale_price_wei: string | null;
    max_resale_price_wei: string | null;
};

export function MeusIngressos() {
    const navigate = useNavigate();
    const [ingressos, setIngressos] = useState<Ingresso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const { listForResale, cancelResaleListing, error: walletError } = useMetaMask();

    // Anunciar revenda
    const [revendaId, setRevendaId] = useState<number | null>(null);
    const [revendaEth, setRevendaEth] = useState('');
    const [revendaLoading, setRevendaLoading] = useState(false);
    const [revendaErro, setRevendaErro] = useState('');

    // Cancelar revenda
    const [cancelandoId, setCancelandoId] = useState<number | null>(null);

    // QR Code modal
    const [qrIngresso, setQrIngresso] = useState<Ingresso | null>(null);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [qrExpiraEm, setQrExpiraEm] = useState<number>(300);
    const [qrSegsRestantes, setQrSegsRestantes] = useState<number>(300);

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

    const handleAnunciarRevenda = async (ingresso: Ingresso) => {
        setRevendaErro('');
        const priceWei = revendaEth ? String(Math.round(parseFloat(revendaEth) * 1e18)) : '';
        if (!priceWei || priceWei === '0') {
            setRevendaErro('Informe um preço válido em ETH.');
            return;
        }
        if (ingresso.token_id === null) {
            setRevendaErro('Ingresso sem Token ID — não é possível anunciar revenda.');
            return;
        }

        // Valida teto de revenda definido pelo organizador no contrato
        if (ingresso.max_resale_price_wei && ingresso.max_resale_price_wei !== '0') {
            const maxWei = BigInt(ingresso.max_resale_price_wei);
            const reqWei = BigInt(priceWei);
            if (reqWei > maxWei) {
                const maxEth = (Number(maxWei) / 1e18).toFixed(4);
                setRevendaErro(`Preço acima do limite permitido pelo organizador (máx: ${maxEth} ETH).`);
                return;
            }
        }

        setRevendaLoading(true);
        try {
            // 1. Assinar listForResale() no contrato via MetaMask (só o dono do NFT pode fazer isso)
            const result = await listForResale(ingresso.token_id, priceWei);
            if (!result) {
                setRevendaErro(walletError ?? 'Transação cancelada ou falhou no MetaMask.');
                return;
            }

            // 2. Registrar no backend com o tx_hash da transação on-chain
            await api.post(`/api/ingressos/${ingresso.id}/anunciar-revenda`, {
                price_wei: priceWei,
                tx_hash: result.txHash,
            });

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

    const handleAbrirQr = async (ingresso: Ingresso) => {
        setQrIngresso(ingresso);
        setQrToken(null);
        try {
            const res = await api.get(`/api/ingressos/${ingresso.id}/gerar-qr`);
            setQrToken(res.data.qr_token);
            const ttl = res.data.expira_em ?? 300;
            setQrExpiraEm(ttl);
            setQrSegsRestantes(ttl);
        } catch {
            setQrToken('ERRO');
        }
    };

    // Contador regressivo do QR
    useEffect(() => {
        if (!qrIngresso || !qrToken || qrToken === 'ERRO') return;
        if (qrSegsRestantes <= 0) return;
        const t = setTimeout(() => setQrSegsRestantes(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [qrIngresso, qrToken, qrSegsRestantes]);

    const handleCancelarRevenda = async (ingresso: Ingresso) => {
        if (!window.confirm(`Cancelar o anúncio de revenda do Token #${ingresso.token_id}?`)) return;
        setCancelandoId(ingresso.id);
        try {
            const result = await cancelResaleListing(ingresso.token_id!);
            if (!result) {
                alert(walletError ?? 'Transação cancelada ou falhou no MetaMask.');
                return;
            }
            await api.post(`/api/ingressos/${ingresso.id}/cancelar-revenda`, {
                tx_hash: result.txHash,
            });
            carregarIngressos();
        } catch {
            alert('Erro ao cancelar revenda. Tente novamente.');
        } finally {
            setCancelandoId(null);
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
        <>
        {/* Modal QR Code */}
        {qrIngresso && (
            <div
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
                onClick={() => { setQrIngresso(null); setQrToken(null); }}
            >
                <div
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
                    onClick={e => e.stopPropagation()}
                >
                    <h2 className="text-xl font-extrabold text-[#0c1b35] mb-1">Ingresso NFT</h2>
                    <p className="text-slate-500 text-sm mb-4">
                        Apresente este QR Code na entrada do evento.
                    </p>

                    {/* QR ou loading */}
                    <div className="flex justify-center bg-white p-4 rounded-2xl border border-slate-200 mb-3 min-h-[216px] items-center">
                        {!qrToken ? (
                            <span className="text-sky-500 font-bold animate-pulse">Gerando QR...</span>
                        ) : qrToken === 'ERRO' ? (
                            <span className="text-red-500 text-sm">Erro ao gerar QR. Tente novamente.</span>
                        ) : qrSegsRestantes > 0 ? (
                            <QRCode value={qrToken} size={200} bgColor="#ffffff" fgColor="#0c1b35" />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-4xl">⏰</span>
                                <span className="text-slate-500 text-sm font-semibold">QR Code expirado</span>
                            </div>
                        )}
                    </div>

                    {/* Countdown */}
                    {qrToken && qrToken !== 'ERRO' && (
                        <div className={`text-sm font-bold mb-4 ${qrSegsRestantes <= 60 ? 'text-red-500' : 'text-slate-500'}`}>
                            {qrSegsRestantes > 0
                                ? `⏱ Válido por ${qrSegsRestantes}s`
                                : 'Expirado'}
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 text-sm mb-5">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Evento</span>
                            <span className="font-bold text-slate-800 max-w-40 text-right truncate">{qrIngresso.evento}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Token NFT</span>
                            <span className="font-mono font-bold text-sky-600">#{qrIngresso.token_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Status</span>
                            <span className="font-semibold text-green-600">Ativo</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {qrSegsRestantes <= 0 && (
                            <button
                                onClick={() => handleAbrirQr(qrIngresso)}
                                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Renovar QR
                            </button>
                        )}
                        <button
                            onClick={() => { setQrIngresso(null); setQrToken(null); }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        )}

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
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            <button
                                                onClick={() => handleAbrirQr(ing)}
                                                className="text-xs font-bold text-sky-600 border border-sky-200 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                🎫 Ver QR Code
                                            </button>
                                            <button
                                                onClick={() => { setRevendaId(ing.id); setRevendaEth(''); setRevendaErro(''); }}
                                                className="text-xs font-bold text-amber-600 border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Anunciar Revenda
                                            </button>
                                        </div>
                                    )}
                                    {ing.status === 'a_venda' && ing.token_id !== null && (
                                        <button
                                            onClick={() => handleCancelarRevenda(ing)}
                                            disabled={cancelandoId === ing.id}
                                            className="mt-1 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {cancelandoId === ing.id ? 'Aguarde MetaMask...' : 'Cancelar Anúncio'}
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
                                            onClick={() => handleAnunciarRevenda(ing)}
                                            disabled={revendaLoading}
                                            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                                        >
                                            {revendaLoading ? 'Aguarde MetaMask...' : 'Confirmar'}
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
        </>
    );
}
