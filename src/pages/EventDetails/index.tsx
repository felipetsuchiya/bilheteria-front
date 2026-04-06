export function EventDetails() {
    return (
        <div className="flex flex-col justify-center items-center">
            {/* HEADLINE DO EVENTO */}
            <div className="flex justify-center items-center">
                <img className="w-103.5 h-127.5 rounded-2xl mx-3" src="https://picsum.photos/seed/picsum/200/300" alt="" />
                <div className="flex flex-col mx-3">
                    <div className="text-[60px] font-bold">Dixxxtrava</div>
                    <div className="flex justify-start items-center gap-10">
                        <div className="flex flex-col text-red-600 items-center leading-14">
                            <div className="text-[60px]">30</div>
                            <div className="text-[50px]">ABR</div>
                        </div>
                        <div>
                            <div className="text-[25px]">Curitiba - PR</div>
                            <div className="text-[18px] text-gray-400">Live</div>
                            <div className="text-[18px] text-red-600">Quinta às 22h</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIÇÃO DO EVENTO */}
            <div className="w-1/2 my-10">
                <h1 className="font-bold text-3xl">DESCRIÇÃO DO EVENTO:</h1>
                <div>
                    Cada edição é um marco, e o DIXXXTRAVA FESTIVAL não para de crescer! Consolidado como um dos principais festivais de mega funk do estado, ele retorna com tudo no dia 30 de abril, véspera de feriado, para uma noite inesquecível!
                    Novas atrações, novas ativações e uma entrega única que só o DIXXXTRAVA oferece. Prepare-se para viver o melhor do mega funk com uma energia que só quem já foi conhece!

                    Garanta já o seu ingresso e não fique de fora!

                    RESERVE SEU CAMAROTE
                    FAÇA O SEU ANIVERSÁRIO CONOSCO
                    Maiores informações: @dixtrava.festival
                </div>
            </div>

            {/* INFORMAÇÕES DO EVENTO */}
            <div className="w-1/2 my-10">
                <h1 className="font-bold text-3xl">INFORMAÇÕES DO EVENTO:</h1>
                <div>
                    Área vip próxima ao palco, com atendimento prioritário de garçons e visão privilegiada.
                    PREMIUM SUPERIOR OPEN BAR: Energético, vodka, gin e whisky liberado até as 04h00.
                    Chegue cedo e evite filas!
                    Evento para maiores de 18 anos!
                    Indispensável o documento de identificação na entrada!
                </div>
            </div>

            {/* ESCOLHA DO INGRESSO */}
            <div className="w-1/2 my-10">
                <div className="text-3xl font-bold">Escolha o seu ingresso</div>
                <div className="bg-gray-200 rounded-2xl p-5 mt-3 flex justify-between">
                    <div className="font-semibold">Ingresso Tal R$10,00</div>
                    <div className="flex gap-5">
                        <div className="rounded-full bg-blue-950 text-white text-2xl w-10 h-10 text-center cursor-pointer">- </div>
                        <div className="rounded-full text-2xl">0</div>
                        <div className="rounded-full bg-blue-950 text-white text-2xl w-10 h-10 text-center cursor-pointer">+</div>
                    </div>
                </div>
            </div>
                <button className="px-5 py-3 text-white font-semibold bg-blue-950 rounded-2xl"> Comprar Ingresso </button>

        </div>
    )
}