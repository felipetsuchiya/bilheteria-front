export function Navbar() {
    return (
        <div className="flex justify-around items-center w-full h-24 bg-gray-900 mb-10">
            <a href="/">
                <div className="text-2xl font-bold text-white tracking-wider cursor-pointer">
                    Ko<span className="text-blue-500">yn</span>
                </div>
            </a>
            <div className="flex items-center space-x-10 text-white text-xl">
                <a href="/login" className="cursor-pointer hover:text-blue-500">Produtor de Eventos</a>
                <a href="/login" className="cursor-pointer hover:text-blue-500">Meu Painel</a>
            </div>
        </div>
    )
}