export const CONTRACT_ADDRESS = '0x8757cde93797e8cE0543e2fCa23714D231d9c86D';
export const SEPOLIA_CHAIN_ID = '0xaa36a7';

export const KOYN_ABI = [
  {
    name: 'mintTicket',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'tokenURI', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getEventInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'ticketPrice', type: 'uint256' },
          { name: 'maxTickets', type: 'uint256' },
          { name: 'soldTickets', type: 'uint256' },
          { name: 'maxResalePrice', type: 'uint256' },
          { name: 'royaltyBps', type: 'uint256' },
          { name: 'organizer', type: 'address' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'isTicketValid',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'listForResale',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'price', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'buyResaleTicket',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'cancelResaleListing',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'resaleListings',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'seller', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
  },
  {
    anonymous: false,
    name: 'TicketMinted',
    type: 'event',
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'eventId', type: 'uint256' },
      { indexed: false, name: 'buyer', type: 'address' },
    ],
  },
  {
    anonymous: false,
    name: 'TicketListed',
    type: 'event',
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'seller', type: 'address' },
      { indexed: false, name: 'price', type: 'uint256' },
    ],
  },
  {
    anonymous: false,
    name: 'TicketSold',
    type: 'event',
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'from', type: 'address' },
      { indexed: false, name: 'to', type: 'address' },
      { indexed: false, name: 'price', type: 'uint256' },
    ],
  },
] as const;
