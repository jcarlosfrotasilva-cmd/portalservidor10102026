import Image from "next/image";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50">
      {/* Hero Section com Fotografia */}
      <section className="relative w-full">
        {/* Fotografia Principal */}
        <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
          <Image
            src="/images/hero-home.jpg"
            alt="Profissionais educadores em ambiente escolar acolhedor"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay suave para melhorar legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 via-transparent to-transparent" />
        </div>

        {/* Cabeçalho sobreposto */}
        <div className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-start pt-8 px-6">
          <p className="text-white text-sm md:text-base uppercase tracking-[0.15em] font-medium drop-shadow-lg">
            Portal do Servidor
          </p>
          <p className="text-white/90 text-xs md:text-sm mt-1 drop-shadow-md">
            EE Profª Marlene Frattini — Matão/SP
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="relative -mt-24 md:-mt-32 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Título Principal */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-green-900 leading-tight">
              Sua história profissional
              <br />
              <span className="text-green-700">merece atenção.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Consulte sua trajetória funcional, acompanhe os registros oficiais
              e encontre suas informações em um só lugar.
            </p>
          </div>

          {/* Cartões de Acesso */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Cartão Servidor */}
            <a
              href="/login-servidor"
              className="group block bg-white rounded-2xl shadow-[0_8px_30px_rgba(16,24,40,0.08)] hover:shadow-[0_20px_50px_rgba(22,101,52,0.15)] transition-all duration-300 p-8 border border-gray-100 hover:border-green-200"
            >
              <div className="flex flex-col items-center text-center">
                {/* Ícone */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Sou Servidor
                </h2>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  Minha vida funcional e meus registros.
                </p>

                <button className="inline-flex items-center px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors duration-200 group-hover:bg-green-800">
                  Acessar portal
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </a>

            {/* Cartão Administração */}
            <a
              href="/login-admin"
              className="group block bg-white rounded-2xl shadow-[0_8px_30px_rgba(16,24,40,0.08)] hover:shadow-[0_20px_50px_rgba(22,101,52,0.15)] transition-all duration-300 p-8 border border-gray-100 hover:border-green-200"
            >
              <div className="flex flex-col items-center text-center">
                {/* Ícone */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Sou da Administração
                </h2>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  Cadastros e registros oficiais.
                </p>

                <button className="inline-flex items-center px-6 py-3 bg-green-800 hover:bg-green-900 text-white font-medium rounded-lg transition-colors duration-200 group-hover:bg-green-900">
                  Acesso administrativo
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="py-8 text-center border-t border-gray-200 bg-white/50">
        <p className="text-sm text-gray-500">
          Acesso seguro · Informações protegidas
        </p>
      </footer>
    </main>
  );
}
