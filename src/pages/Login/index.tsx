// Um pequeno componente de logo estilizado para o topo da tela
const KoynLogo = () => (
    <div className="flex items-center text-5xl font-bold">
        <span className="text-white">Ko</span>
        <span className="text-sky-400">yn</span>
    </div>
);

export function Login() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            {/* O container principal, imitando o card da Hero Section */}
            <div className="bg-[#0c1b35] p-10 rounded-[30px] w-full max-w-md shadow-2xl relative overflow-hidden">
                {/* Decoração sutil de fundo (neons) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-900/40 rounded-full blur-2xl opacity-80"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-900/30 rounded-full blur-xl opacity-70"></div>

                {/* Conteúdo do formulário */}
                <div className="flex flex-col items-center gap-8 z-10 relative">
                    <KoynLogo />

                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                            ENTRE NA <span className="text-sky-400">SUA CONTA</span>
                        </h1>
                        <p className="text-slate-300 text-base max-w-70 mx-auto">
                            Acesse seus ingressos exclusivos e eventos globais com NFT.
                        </p>
                    </div>

                    <form className="w-full flex flex-col gap-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-200">
                                Endereço de E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="seu.email@exemplo.com"
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-5 py-4 text-white text-base placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                                    Senha
                                </label>
                                <a href="#" className="text-sm font-medium text-sky-400 hover:text-sky-300">
                                    Esqueceu a senha?
                                </a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                placeholder="Sua senha secreta"
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-5 py-4 text-white text-base placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#0d59f7] hover:bg-[#0047e0] text-white font-bold py-4 rounded-xl text-lg transition duration-150"
                        >
                            LOGIN NA CONTA
                        </button>
                    </form>

                    <div className="text-center w-full mt-4 flex flex-col items-center gap-4">
                        <span className="text-slate-400">Não tem uma conta?</span>
                        <button
                            className="w-full border-2 border-slate-600 hover:border-slate-500 text-sky-400 font-semibold py-3 rounded-xl text-base transition duration-150"
                        >
                            CRIAR NOVA CONTA
                        </button>
                    </div>

                </div>
            </div >
        </div >
    );
}