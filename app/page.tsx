"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentAboutSlide, setCurrentAboutSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const propertySlides = [
    {
      image: "/modern-apartment-facade-bless.png",
      alt: "Bless - Corretora Cristal",
      message: "Olá! Tenho interesse no imóvel Bless.",
    },
    {
      image: "/luxury-residential-exterior.png",
      alt: "Griffe - Fachada de um imóvel à venda",
      message: "Olá! Gostaria de mais informações sobre o Griffe.",
    },
    {
      image: "/manaca-apartment-living-room.png",
      alt: "Manacá - Sala de estar de um apartamento decorado",
      message: "Olá! Poderia me enviar detalhes sobre o Manacá?",
    },
  ]

  const aboutSlides = [
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-18%20at%2014.33.32%20%282%29-OlOXvdRCREput0ktC5Q4qEjbudyRSC.jpeg",
      alt: "Cristal - Corretora Profissional",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-18%20at%2014.33.31-3Jmi1tFEnCdPrEpDboT08HPZiUKJbR.jpeg",
      alt: "Cristal - Escritório Moderno",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-18%20at%2014.33.31%20%281%29-vjCOp65rvBNUpOyenUaXo08v60tksk.jpeg",
      alt: "Cristal - Atendimento Personalizado",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-18%20at%2014.33.32%20%281%29-ywsmiZr89E9N2fnhsDbqgqqBgTddUm.jpeg",
      alt: "Cristal - Consultoria Especializada",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-18%20at%2014.33.32-Yjaf3rvLz52O3zDaSvvS70MAT52jcj.jpeg",
      alt: "Cristal - Ambiente Corporativo",
    },
    { image: "/client-meeting.png", alt: "Reunião com clientes" },
    { image: "/property-evaluation.png", alt: "Avaliação profissional de imóveis" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % propertySlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [propertySlides.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAboutSlide((prev) => (prev + 1) % aboutSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [aboutSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % propertySlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + propertySlides.length) % propertySlides.length)
  }

  const nextAboutSlide = () => {
    setCurrentAboutSlide((prev) => (prev + 1) % aboutSlides.length)
  }

  const prevAboutSlide = () => {
    setCurrentAboutSlide((prev) => (prev - 1 + aboutSlides.length) % aboutSlides.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-800/95 backdrop-blur-sm shadow-lg">
        <nav className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <a href="#" className="text-2xl font-bold text-sky-300 hover:text-sky-200 transition-colors">
                CORRETORA CRISTAL
              </a>

              {/* Mobile menu button */}
              <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span
                    className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
                  ></span>
                  <span
                    className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
                  ></span>
                  <span
                    className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
                  ></span>
                </div>
              </button>

              {/* Desktop menu */}
              <div className="hidden lg:flex items-center space-x-6">
                <a
                  href="#"
                  className="text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Início
                </a>
                <a
                  href="#imoveis"
                  className="text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Imóveis
                </a>
                <a
                  href="#sobre"
                  className="text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Sobre
                </a>
                <a
                  href="#contatos"
                  className="text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Contatos
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=5511996188216"
                  target="_blank"
                  className="text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                  rel="noreferrer"
                >
                  📱
                </a>
                <a
                  href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                  target="_blank"
                  className="text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                  rel="noreferrer"
                >
                  📷
                </a>
              </div>
            </div>

            {/* Mobile menu */}
            <div
              className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="pt-4 pb-2 space-y-2">
                <a
                  href="#"
                  className="block text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Início
                </a>
                <a
                  href="#imoveis"
                  className="block text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Imóveis
                </a>
                <a
                  href="#sobre"
                  className="block text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Sobre
                </a>
                <a
                  href="#contatos"
                  className="block text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                >
                  Contatos
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=5511996188216"
                  target="_blank"
                  className="block text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                  rel="noreferrer"
                >
                  📱 WhatsApp
                </a>
                <a
                  href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                  target="_blank"
                  className="block text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                  rel="noreferrer"
                >
                  📷 Instagram
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center text-center text-white pt-20">
        <div className="absolute inset-0 z-0">
          <Image src="/luxury-modern-real-estate.png" alt="Corretora Cristal" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-slate-900/70"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-sky-300">CORRETORA CRISTAL</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 font-medium">Seu sonho da casa própria começa aqui</p>
          <div className="mt-8">
            <a
              href="https://api.whatsapp.com/send?phone=5511996188216&text=Olá! Gostaria de conhecer os imóveis disponíveis."
              target="_blank"
              className="inline-block px-8 py-4 text-xl font-bold text-slate-800 bg-sky-300 hover:bg-sky-200 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              rel="noreferrer"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="imoveis" className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Nossos Serviços
              <div className="w-24 h-1 bg-sky-300 mx-auto mt-4"></div>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Oferecemos soluções completas para todas as suas necessidades imobiliárias
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              { title: "Venda de Imóveis", desc: "Apartamentos, casas e terrenos" },
              { title: "Locação", desc: "Residencial e comercial" },
              { title: "Avaliação", desc: "Laudo técnico profissional" },
              { title: "Financiamento", desc: "Parcerias com os melhores bancos" },
              { title: "Documentação", desc: "Suporte completo em cartório" },
              { title: "Consultoria", desc: "Orientação especializada" },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-slate-700/50 border border-slate-600 p-6 rounded-lg hover:bg-slate-700/70 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-300">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://api.whatsapp.com/send?phone=5511996188216&text=Olá! Gostaria de saber mais sobre os serviços."
              target="_blank"
              className="inline-block px-8 py-4 text-xl font-bold text-slate-900 bg-sky-300 hover:bg-sky-200 rounded-lg transition-all duration-300 shadow-lg"
              rel="noreferrer"
            >
              Saiba Mais
            </a>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="imoveis-destaque" className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Imóveis em Evidência
              <div className="w-24 h-1 bg-sky-300 mx-auto mt-4"></div>
            </h2>
            <p className="text-xl text-gray-300">Conheça nossos lançamentos e oportunidades exclusivas</p>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="relative h-96 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={propertySlides[currentSlide].image || "/placeholder.svg"}
                  alt={propertySlides[currentSlide].alt}
                  fill
                  className="object-cover transition-opacity duration-500"
                />
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-slate-800/70 hover:bg-slate-800/90 rounded-full flex items-center justify-center text-white transition-all duration-300"
              >
                ‹
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-slate-800/70 hover:bg-slate-800/90 rounded-full flex items-center justify-center text-white transition-all duration-300"
              >
                ›
              </button>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <a
                  href={`https://api.whatsapp.com/send?phone=5511996188216&text=${encodeURIComponent(propertySlides[currentSlide].message)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="text-xl">📱</span>
                  Tenho Interesse
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            {propertySlides.map((slide, index) => (
              <div key={index} className="text-center">
                <button
                  onClick={() => setCurrentSlide(index)}
                  className={`w-4 h-4 rounded-full mb-2 transition-all duration-300 ${
                    currentSlide === index ? "bg-sky-300" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
                <div className="text-sm">
                  <p className="font-semibold text-white mb-1">{slide.alt.split(" - ")[0]}</p>
                  <a
                    href={`https://api.whatsapp.com/send?phone=5511996188216&text=${encodeURIComponent(slide.message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded transition-all duration-300"
                  >
                    <span>📱</span>
                    Interesse
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Sobre a Corretora Cristal
              <div className="w-24 h-1 bg-sky-300 mx-auto mt-4"></div>
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="lg:w-1/2">
              <div className="relative overflow-hidden rounded-lg shadow-lg py-0.5 h-[800px]">
                <Image
                  src={aboutSlides[currentAboutSlide].image || "/placeholder.svg"}
                  alt={aboutSlides[currentAboutSlide].alt}
                  fill
                  className="object-cover transition-opacity duration-500"
                />

                <button
                  onClick={prevAboutSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-slate-800/70 hover:bg-slate-800/90 rounded-full flex items-center justify-center text-white transition-all duration-300 flex-col"
                >
                  ‹
                </button>

                <button
                  onClick={nextAboutSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-slate-800/70 hover:bg-slate-800/90 rounded-full flex items-center justify-center text-white transition-all duration-300"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold mb-6 text-white">Tradição e Confiança no Mercado Imobiliário</h3>
              <p className="text-lg mb-6 leading-relaxed text-gray-300">
                A Corretora Cristal é uma empresa consolidada no mercado imobiliário, oferecendo soluções completas para
                compra, venda e locação de imóveis. Nossa equipe especializada trabalha com transparência e dedicação
                para realizar o sonho da casa própria de nossos clientes.
              </p>
              <p className="text-lg mb-8 leading-relaxed text-gray-300">
                Com anos de experiência e um portfólio diversificado, garantimos atendimento personalizado e suporte
                completo em todas as etapas do processo imobiliário.
              </p>
              <a
                href="https://api.whatsapp.com/send?phone=5511996188216&text=Olá! Gostaria de conhecer melhor a Corretora Cristal."
                target="_blank"
                className="inline-block px-6 py-3 text-lg font-bold text-slate-900 bg-sky-300 hover:bg-sky-200 rounded-lg transition-all duration-300 shadow-lg"
                rel="noreferrer"
              >
                Fale Conosco
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contatos" className="py-16 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Entre em Contato
            <div className="w-24 h-1 bg-sky-300 mx-auto mt-4"></div>
          </h2>
          <p className="text-xl text-gray-300 mb-8">Estamos prontos para ajudar você a encontrar o imóvel ideal</p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: "📱", title: "WhatsApp", info: "(11) 99618-8216" },
              { icon: "📧", title: "E-mail", info: "contato@corretoracristal.com" },
              { icon: "📍", title: "Localização", info: "São Paulo - SP" },
            ].map((contact, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg hover:bg-slate-700 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{contact.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{contact.title}</h3>
                <p className="text-gray-300">{contact.info}</p>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <a
              href="https://api.whatsapp.com/send?phone=5511996188216&text=Olá! Gostaria de agendar uma visita."
              target="_blank"
              className="inline-block px-8 py-4 text-xl font-bold text-slate-800 bg-sky-300 hover:bg-sky-200 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              rel="noreferrer"
            >
              AGENDE UMA VISITA
            </a>
          </div>

          <div>
            <p className="text-lg font-bold mb-6 text-white">Siga-nos nas redes sociais:</p>
            <div className="flex justify-center items-center gap-6">
              <a
                href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                target="_blank"
                className="transform hover:scale-110 transition-transform duration-300"
                rel="noreferrer"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                  📷
                </div>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=5511996188216"
                target="_blank"
                className="transform hover:scale-110 transition-transform duration-300"
                rel="noreferrer"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                  📱
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-white text-center bg-slate-800 border-t border-slate-700">
        <div className="container mx-auto px-4">
          <p className="mb-2 text-lg">© Corretora Cristal 2024</p>
          <p className="text-sky-300">Realizando sonhos, construindo futuros</p>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://api.whatsapp.com/send?phone=5511996188216&text=Olá! Gostaria de saber mais sobre os imóveis."
        target="_blank"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-300 z-50 transform hover:scale-110"
        aria-label="Fale conosco no WhatsApp"
        rel="noreferrer"
      >
        📱
      </a>
    </div>
  )
}
