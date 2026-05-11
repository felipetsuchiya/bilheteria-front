<<<<<<< Updated upstream
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api'; // Ajuste o caminho se necessário

export function EventDetails() {

    const navigate = useNavigate();

    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Estado para controlar a quantidade de ingressos que a pessoa quer comprar
    const [quantidade, setQuantidade] = useState(1);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/api/eventos/${id}`);
                setEvent(response.data);
            } catch (error) {
                console.error("Erro ao buscar os detalhes do evento:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    // Funções para formatar a data que vem do banco para o seu layout visual
    const getDia = (dataString?: string) => {
        if (!dataString) return "--";
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' });
    };

    const getMes = (dataString?: string) => {
        if (!dataString) return "---";
        const data = new Date(dataString);
        // Retorna "abr", "mai", etc., e nós deixamos maiúsculo
        return data.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').toUpperCase();
    };

    const getDiaSemanaEHora = (dataString?: string) => {
        if (!dataString) return "";
        const data = new Date(dataString);
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
        // Pega a hora. Como o GMT vem "00:00:00", se o seu banco salvar a hora certa, isso vai refletir aqui.
        const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

        // Ex: "quinta-feira às 22:00" -> Deixamos a primeira letra maiúscula
        const stringFormatada = `${diaSemana} às ${hora}h`;
        return stringFormatada.charAt(0).toUpperCase() + stringFormatada.slice(1);
    };

    // Funções do contador
    const handleIncrement = () => setQuantidade(prev => prev + 1);
    const handleDecrement = () => setQuantidade(prev => (prev > 1 ? prev - 1 : 1));

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-sky-500 font-bold text-xl">
                Carregando detalhes do evento...
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex justify-center items-center min-h-screen text-slate-500 font-bold text-xl">
                Evento não encontrado.
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen py-10 bg-slate-50">
            {/* HEADLINE DO EVENTO */}
            <div className="flex flex-col md:flex-row justify-center items-center max-w-5xl w-full px-6">
                <img
                    className="w-full md:w-103.5 h-auto md:h-127.5 object-cover rounded-3xl mx-3 shadow-2xl"
                    src={`https://picsum.photos/seed/${event.id}/414/510`}
                    alt={`Capa de ${event.nome}`}
                />
                <div className="flex flex-col mx-6 mt-8 md:mt-0 w-full">
                    <div className="text-[40px] md:text-[60px] font-bold text-[#0c1b35] leading-tight wrap-break-word">
                        {event.nome}
                    </div>

                    <div className="flex justify-start items-center gap-6 md:gap-10 mt-6">
                        <div className="flex flex-col text-red-600 items-center bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 min-w-25">
                            <div className="text-[50px] md:text-[60px] font-black leading-none tracking-tighter">
                                {getDia(event.data_hora)}
                            </div>
                            <div className="text-[30px] md:text-[40px] font-bold leading-none mt-1">
                                {getMes(event.data_hora)}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="text-[20px] md:text-[25px] font-bold text-slate-800">
                                {event.local_evento || "Localização a definir"}
                            </div>
                            <div className="text-[18px] font-bold text-red-600 mt-1">
                                {getDiaSemanaEHora(event.data_hora)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIÇÃO DO EVENTO */}
            <div className="w-full max-w-3xl px-6 my-12">
                <h1 className="font-extrabold text-2xl md:text-3xl text-[#0c1b35] mb-4 border-b-2 border-slate-200 pb-2">
                    DESCRIÇÃO DO EVENTO
                </h1>
                <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                    {event.descricao_evento || "Nenhuma descrição fornecida pela organização."}
                </div>
            </div>

            {/* ESCOLHA DO INGRESSO */}
            <div className="w-full max-w-3xl px-6 mb-10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c1b35] mb-4">
                    Escolha o seu ingresso
                </h1>

                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col text-center md:text-left">
                        <span className="font-bold text-xl text-slate-800">Ingresso Único</span>
                        {/* Se o backend ainda não retornar preço, deixamos um fallback de segurança */}
                        <span className="font-medium text-sky-500 mt-1">
                            {event.preco_eth ? `${event.preco_eth} ETH` : "Preço sob consulta"}
                        </span>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <button
                            onClick={handleDecrement}
                            className="rounded-full bg-[#0c1b35] hover:bg-[#16274a] text-white text-2xl w-12 h-12 flex items-center justify-center cursor-pointer transition-colors select-none shadow-sm"
                        >
                            -
                        </button>
                        <span className="font-black text-2xl text-slate-800 w-6 text-center select-none">
                            {quantidade}
                        </span>
                        <button
                            onClick={handleIncrement}
                            className="rounded-full bg-[#0c1b35] hover:bg-[#16274a] text-white text-2xl w-12 h-12 flex items-center justify-center cursor-pointer transition-colors select-none shadow-sm"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="px-10 py-5 text-white font-extrabold text-xl bg-[#0d59f7] hover:bg-[#0047e0] rounded-2xl shadow-xl transition-transform hover:-translate-y-1 w-full max-w-md mx-6 mb-20">
                COMPRAR INGRESSO
            </button>
        </div>
    );
}
=======
import { useState } from 'react';
import { useMetaMask } from '../../hooks/useMetaMask';
import { api } from '../../services/api';

// Para demo: evento hardcoded. Futuramente receber via props/route param.
const DEMO_EVENT = {
  id: 1,
  blockchainEventId: 0,          // ID do evento no contrato
  nome: 'Test Event 28-04-2026',
  data: '28 ABR',
  cidade: 'Curitiba - PR',
  hora: 'Domingo às 20h',
  priceWei: '1000000000000000',  // 0.001 ETH em wei
  priceDisplay: '0.001 ETH',
  descricao: 'Cada edição é um marco, e o DIXXXTRAVA FESTIVAL não para de crescer! Consolidado como um dos principais festivais de mega funk do estado, ele retorna com tudo no dia 30 de abril, véspera de feriado, para uma noite inesquecível!',
  imagem: 'https://picsum.photos/seed/picsum/200/300',
};

type Status = 'idle' | 'connecting' | 'minting' | 'saving' | 'success' | 'error';

export function EventDetails() {
  const { account, isConnecting, isMinting, error: walletError, connect, mintTicket } = useMetaMask();
  const [status, setStatus] = useState<Status>('idle');
  const [txHash, setTxHash] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  async function handleComprar() {
    setErrorMsg('');

    // 1. Conectar MetaMask se necessário
    if (!account) {
      setStatus('connecting');
      const addr = await connect();
      if (!addr) { setStatus('error'); setErrorMsg(walletError ?? 'Conexão cancelada'); return; }
    }

    // 2. Mintar NFT na blockchain
    setStatus('minting');
    const result = await mintTicket(
      DEMO_EVENT.blockchainEventId,
      DEMO_EVENT.priceWei,
      `https://koyn.app/metadata/${DEMO_EVENT.id}`
    );
    if (!result) {
      setStatus('error');
      setErrorMsg(walletError ?? 'Transação falhou ou foi cancelada');
      return;
    }

    // 3. Registrar no backend
    setStatus('saving');
    try {
      const token = localStorage.getItem('@App:token');
      await api.post('/api/ingressos/registrar-mint', {
        id_evento: DEMO_EVENT.id,
        token_id: Number(result.tokenId),
        tx_hash: result.txHash,
        carteira_comprador: result.buyer,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTxHash(result.txHash);
      setTokenId(result.tokenId);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('NFT mintado mas falhou ao salvar no servidor. Guarde o txHash.');
      setTxHash(result.txHash);
      setTokenId(result.tokenId);
    }
  }

  const isLoading = status === 'connecting' || status === 'minting' || status === 'saving' || isConnecting || isMinting;

  return (
    <div className="flex flex-col justify-center items-center pb-16">

      {/* HEADLINE */}
      <div className="flex justify-center items-center mt-8">
        <img className="w-52 h-64 rounded-2xl mx-3 object-cover" src={DEMO_EVENT.imagem} alt={DEMO_EVENT.nome} />
        <div className="flex flex-col mx-3">
          <div className="text-[60px] font-bold">{DEMO_EVENT.nome}</div>
          <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col text-red-600 items-center leading-14">
              <div className="text-[60px]">{DEMO_EVENT.data.split(' ')[0]}</div>
              <div className="text-[50px]">{DEMO_EVENT.data.split(' ')[1]}</div>
            </div>
            <div>
              <div className="text-[25px]">{DEMO_EVENT.cidade}</div>
              <div className="text-[18px] text-gray-400">Live</div>
              <div className="text-[18px] text-red-600">{DEMO_EVENT.hora}</div>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div className="w-1/2 my-10">
        <h1 className="font-bold text-3xl">DESCRIÇÃO DO EVENTO:</h1>
        <p className="mt-2">{DEMO_EVENT.descricao}</p>
      </div>

      {/* COMPRA */}
      <div className="w-1/2 my-4">
        <div className="text-3xl font-bold mb-4">Comprar Ingresso NFT</div>

        {/* Wallet status */}
        <div className="mb-4">
          {account ? (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              MetaMask conectado: {shortAddress(account)}
            </div>
          ) : (
            <div className="text-sm text-gray-400">MetaMask não conectado</div>
          )}
        </div>

        {/* Card do ingresso */}
        {status !== 'success' && (
          <div className="bg-gray-100 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">Ingresso {DEMO_EVENT.nome}</div>
              <div className="text-blue-700 font-bold">{DEMO_EVENT.priceDisplay}</div>
              <div className="text-xs text-gray-500 mt-1">NFT ERC-721 • Rede Sepolia</div>
            </div>
            <button
              onClick={handleComprar}
              disabled={isLoading}
              className="px-6 py-3 text-white font-semibold bg-blue-950 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
            >
              {status === 'connecting' || isConnecting ? 'Conectando...' :
               status === 'minting'  || isMinting     ? 'Aguarde MetaMask...' :
               status === 'saving'                    ? 'Salvando...' :
               account ? 'Comprar com MetaMask' : 'Conectar e Comprar'}
            </button>
          </div>
        )}

        {/* Erro */}
        {(status === 'error' || walletError) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {errorMsg || walletError}
            {txHash && (
              <div className="mt-2 text-xs break-all">
                <span className="font-bold">TxHash salvo: </span>{txHash}
              </div>
            )}
          </div>
        )}

        {/* Sucesso */}
        {status === 'success' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="text-green-700 font-bold text-xl mb-3">Ingresso NFT Mintado!</div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Token ID: </span>
                <span className="font-mono text-blue-700">#{tokenId}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Carteira: </span>
                <span className="font-mono text-gray-800">{account && shortAddress(account)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Transação: </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-600 hover:underline break-all"
                >
                  {txHash.slice(0, 20)}...
                </a>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Seu ingresso está registrado na blockchain Sepolia e no sistema Koyn.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
>>>>>>> Stashed changes
