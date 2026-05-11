# AI Agent Instructions for bilheteria-front

## Purpose
This is a frontend-only React + TypeScript application built with Vite. The main goal is to support the ticket purchase flow using MetaMask + Web3 on the Sepolia network.

## Project overview
- Framework: React 19 + TypeScript 5.9 + Vite 7
- Styling: Tailwind CSS 4
- Router: `react-router-dom` v7
- Blockchain: `web3` library with MetaMask and a hardcoded contract in `src/contracts/koynTicket.ts`
- HTTP client: `axios` instance in `src/services/api.ts`
- Language: UI text is written in Brazilian Portuguese, so maintain that tone for labels and messages unless asked to internationalize.

## Key files
- `package.json`: `dev`, `build`, `lint`, `preview` scripts
- `src/App.tsx`: app root wiring
- `src/routes/index.tsx`: routing and layout with `Navbar` and `Footer`
- `src/pages`: page-level screens
- `src/components`: reusable UI components
- `src/hooks/useMetaMask.ts`: wallet connection, Sepolia chain switch, minting logic
- `src/contracts/koynTicket.ts`: contract address, ABI, and `SEPOLIA_CHAIN_ID`
- `src/pages/EventDetails/index.tsx`: NFT purchase flow, wallet status, save backend call
- `src/services/api.ts`: Axios service wrapper
- `eslint.config.js`: linting setup for JS/TS and React hooks

## Build and run commands
Use the project scripts from the repository root:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Development guidance
- Preserve the current application architecture: `pages/`, `components/`, `hooks/`, `services/`, `contracts/`.
- Follow React Router v7 route and element patterns.
- Keep TypeScript strictness and typed components where practical.
- Use the existing Tailwind utility-first class style.
- Avoid adding backend/server code in this repo; this repository is frontend-only.
- If implementing new blockchain or API features, reference `useMetaMask.ts` and `EventDetails` for the existing mint/connect/save flow.

## Notes for agents
- This repo does not contain tests or a backend implementation.
- The app currently uses a demo event in `src/pages/EventDetails/index.tsx` with hardcoded data.
- The wallet flow depends on MetaMask and the Sepolia network.
- The backend POST request is made to `/api/ingressos/registrar-mint` and includes a bearer token from localStorage key `@NFTix:token`.

## Suggested next customization
Consider adding a dedicated instruction or skill for frontend tasks such as:
- UI/UX fixes in `src/pages` and `src/components`
- MetaMask/Web3 flow changes in `src/hooks/useMetaMask.ts`
- Routing and navigation updates in `src/routes/index.tsx`
