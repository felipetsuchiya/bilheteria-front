import { useState, useEffect, useCallback } from 'react';
import { Web3 } from 'web3';
import { KOYN_ABI, CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from '../contracts/koynTicket';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type MintResult = {
  tokenId: string;
  txHash: string;
  buyer: string;
};

export function useMetaMask() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) setAccount(accounts[0]);
    });
    const onAccountsChanged = (accounts: string[]) =>
      setAccount(accounts.length > 0 ? accounts[0] : null);
    window.ethereum.on('accountsChanged', onAccountsChanged);
    return () => window.ethereum?.removeListener('accountsChanged', onAccountsChanged);
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    if (!window.ethereum) {
      setError('MetaMask não encontrado. Instale em metamask.io');
      return null;
    }
    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: SEPOLIA_CHAIN_ID }] });
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      return accounts[0];
    } catch (err: any) {
      setError(err.message ?? 'Erro ao conectar MetaMask');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const mintTicket = useCallback(async (
    eventId: number,
    priceInWei: string,
    tokenURI: string
  ): Promise<MintResult | null> => {
    setError(null);
    const addr = account ?? await connect();
    if (!addr) return null;

    setIsMinting(true);
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(KOYN_ABI as any, CONTRACT_ADDRESS);

      const receipt = await (contract.methods as any)
        .mintTicket(eventId, tokenURI)
        .send({ from: addr, value: priceInWei });

      const log = receipt.events?.TicketMinted ?? receipt.logs?.[0];
      const tokenId = String(log?.returnValues?.tokenId ?? log?.topics?.[1] ?? '0');

      return { tokenId, txHash: receipt.transactionHash as string, buyer: addr };
    } catch (err: any) {
      setError(err.message ?? 'Transação falhou ou foi cancelada');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [account, connect]);

  const listForResale = useCallback(async (
    tokenId: number,
    priceWei: string
  ): Promise<{ txHash: string } | null> => {
    setError(null);
    const addr = account ?? await connect();
    if (!addr) return null;

    setIsMinting(true);
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(KOYN_ABI as any, CONTRACT_ADDRESS);

      const receipt = await (contract.methods as any)
        .listForResale(tokenId, priceWei)
        .send({ from: addr });

      return { txHash: receipt.transactionHash as string };
    } catch (err: any) {
      setError(err.message ?? 'Erro ao listar ingresso para revenda');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [account, connect]);

  const buyResaleTicket = useCallback(async (
    tokenId: number,
    priceWei: string
  ): Promise<{ txHash: string; buyer: string } | null> => {
    setError(null);
    const addr = account ?? await connect();
    if (!addr) return null;

    setIsMinting(true);
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(KOYN_ABI as any, CONTRACT_ADDRESS);

      const receipt = await (contract.methods as any)
        .buyResaleTicket(tokenId)
        .send({ from: addr, value: priceWei });

      return { txHash: receipt.transactionHash as string, buyer: addr };
    } catch (err: any) {
      setError(err.message ?? 'Transação de revenda falhou ou foi cancelada');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [account, connect]);

  return { account, isConnecting, isMinting, error, connect, mintTicket, listForResale, buyResaleTicket };
}
