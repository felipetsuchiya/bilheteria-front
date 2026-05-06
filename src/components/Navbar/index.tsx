export function Navbar() {
    return (
        <div className="flex justify-around items-center w-full h-24 bg-gray-900 ">
            <a href="/">
                <div className="text-2xl font-bold text-white tracking-wider cursor-pointer">
                    Ko<span className="text-blue-500">ym</span>
                </div>
            </a>
            <div className="flex items-center space-x-10 text-white">
                <a href="/cadastro/organizacao" className="cursor-pointer hover:text-blue-500">Quero vender com a Koym</a>
                <a href="/login" className="cursor-pointer hover:text-blue-500">Login</a>
            </div>
        </div>
    )
}