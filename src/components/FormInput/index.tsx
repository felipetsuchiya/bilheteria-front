export default function FormInput(label: string, placeholder: string) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
        </div>
    )
}