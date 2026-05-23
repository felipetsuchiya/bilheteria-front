import { useNavigate } from 'react-router-dom';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 px-4">
            <div className="text-center">
                <p className="text-sky-500 font-bold text-lg tracking-widest mb-2">ERRO 404</p>
                <h1 className="text-6xl font-extrabold text-[#0c1b35] mb-4">
                    Página não encontrada
                </h1>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                    A página que você está procurando não existe ou foi removida.
                </p>
            </div>

            <div className="flex gap-4 mt-4">
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[#0c1b35] text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors"
                >
                    Voltar para a Home
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                    Página anterior
                </button>
            </div>
        </div>
    );
}
