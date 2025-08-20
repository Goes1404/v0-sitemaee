"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentAboutSlide, setCurrentAboutSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const propertySlides = [
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bless-pWmJwM2vUMII49MBtU0xMJVzzLdosY.jpeg",
      alt: "Bless Parque Barueri - Corretora Cristal",
      message: "Olá! Tenho interesse no empreendimento Bless Parque Barueri.",
    },
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/griffe-NzZG4SZRXpq67fpNbBZWdeBSR9CgNC.jpeg",
      alt: "Griffe Barueri - Corretora Cristal",
      message: "Olá! Gostaria de mais informações sobre o Griffe Barueri.",
    },
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/manaca-7BBOdlq7wH7WcIcSGFApcyuhNv4Yi2.jpeg",
      alt: "Manacá Barueri - Corretora Cristal",
      message: "Olá! Poderia me enviar detalhes sobre o Manacá Barueri?",
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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                  target="_blank"
                  className="text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                  rel="noreferrer"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
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
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    WhatsApp
                  </div>
                </a>
                <a
                  href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                  target="_blank"
                  className="block text-lg font-semibold text-white hover:text-sky-300 px-3 py-2 rounded transition-colors duration-300"
                  rel="noreferrer"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </div>
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
                className="bg-slate-700/50 border border-slate-600 p-6 rounded-lg hover:bg-slate-700/70 hover:shadow-xl transition-all duration-300 shadow-xl"
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg bg-slate-800">
                <Image
                  src={propertySlides[currentSlide].image || "/placeholder.svg"}
                  alt={propertySlides[currentSlide].alt}
                  fill
                  className="object-contain transition-opacity duration-500"
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
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
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
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
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-square bg-slate-700">
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
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                ),
                title: "WhatsApp",
                info: "(11) 99618-8216",
              },
              { icon: "📧", title: "E-mail", info: "contato@corretoracristal.com" },
              { icon: "📍", title: "Localização", info: "São Paulo - SP" },
            ].map((contact, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg hover:bg-slate-700 transition-all duration-300"
              >
                <div className="text-3xl mb-4 flex justify-center text-white">
                  {typeof contact.icon === "string" ? contact.icon : contact.icon}
                </div>
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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=5511996188216"
                target="_blank"
                className="transform hover:scale-110 transition-transform duration-300"
                rel="noreferrer"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
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
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
      </a>
    </div>
  )
}
