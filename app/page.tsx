"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentAboutSlide, setCurrentAboutSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const propertySlides = [
    {
      image: "/imagens/bless.jpeg",
      alt: "Bless - Corretora Cristal",
      message: "Olá! Tenho interesse no imóvel bless.",
    },
    {
      image: "/imagens/griffe.jpeg",
      alt: "Griffe - Fachada de um imóvel à venda",
      message: "Olá! Gostaria de mais informações sobre o griffe.",
    },
    {
      image: "/imagens/manaca.jpeg",
      alt: "Manaca - Sala de estar de um apartamento decorado",
      message: "Olá! Poderia me enviar detalhes sobre o manaca",
    },
  ]

  const aboutSlides = [
    { image: "/imagens/carrosel1img.jpeg", alt: "Imagem 1 da clínica" },
    { image: "/imagens/carrosel2img.jpeg", alt: "Imagem 2 da clínica" },
    { image: "/imagens/carrosel3img.jpeg", alt: "Imagem 3 da clínica" },
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
    <div className="min-h-screen" style={{ backgroundColor: "#B7D9E2" }}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50" style={{ backgroundColor: "#B7D9E2" }}>
        <nav className="py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <a href="#" className="text-2xl font-bold" style={{ color: "#0080c9" }}>
                CORRETORA CRISTAL
              </a>

              {/* Mobile menu button */}
              <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span
                    className={`bg-blue-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
                  ></span>
                  <span
                    className={`bg-blue-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
                  ></span>
                  <span
                    className={`bg-blue-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
                  ></span>
                </div>
              </button>

              {/* Desktop menu */}
              <div className="hidden lg:flex items-center space-x-6">
                <a
                  href="#"
                  className="text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Início
                </a>
                <a
                  href="#imoveis"
                  className="text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Imóveis
                </a>
                <a
                  href="#sobre"
                  className="text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Sobre
                </a>
                <a
                  href="#contatos"
                  className="text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Contatos
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=5511996188216"
                  target="_blank"
                  className="text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                  rel="noreferrer"
                >
                  📱
                </a>
                <a
                  href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                  target="_blank"
                  className="text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
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
                  className="block text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Início
                </a>
                <a
                  href="#imoveis"
                  className="block text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Imóveis
                </a>
                <a
                  href="#sobre"
                  className="block text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Sobre
                </a>
                <a
                  href="#contatos"
                  className="block text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                >
                  Contatos
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=5511996188216"
                  target="_blank"
                  className="block text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
                  rel="noreferrer"
                >
                  📱 WhatsApp
                </a>
                <a
                  href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                  target="_blank"
                  className="block text-xl font-bold px-3 py-2 rounded hover:bg-white transition-all duration-300"
                  style={{ color: "#0080c9" }}
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
          <Image src="/imagens/fotocapa.jpeg" alt="Corretora Cristal" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="inline-block animate-bounce">CUIDADO PROFISSIONAL</span>
          </h1>
          <div className="mt-8">
            <a
              href="https://api.whatsapp.com/send?phone=5511996188216&text=Oii, gostaria de saber algumas informações."
              target="_blank"
              className="inline-block px-8 py-4 text-xl font-bold text-white rounded-lg transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: "#0080c9" }}
              rel="noreferrer"
            >
              Contate-nos
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="imoveis" className="py-16">
        <div className="container mx-auto px-4 bg-white rounded-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 relative inline-block" style={{ color: "#0080c9" }}>
              <span className="animate-bounce">Imóveis</span>
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 mt-2"
                style={{ backgroundColor: "#0080c9", opacity: 0.8 }}
              ></div>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
            <ul className="space-y-4 text-lg">
              {[
                "Avaliação dos Pés",
                "Unha Encravada",
                "Excesso de Peles",
                "Pé de Atleta",
                "Reconstrução da Unha",
                "Reflexologia",
                "Especializada em Pé Diabético",
                "Especializada em Atendimento de Idosos",
              ].map((item, index) => (
                <li key={index} className="flex items-center font-bold" style={{ color: "#0080c9" }}>
                  <span className="mr-3 text-purple-400">{">"}</span>
                  {item}
                </li>
              ))}
            </ul>

            <ul className="space-y-4 text-lg">
              {[
                "Corte Correto das Unhas",
                "Correção do Formato das Unhas",
                "Micoses",
                "Calos e Calosidades",
                "Hidratação e Esfoliação",
                "Orientações Profissionais",
                "Frieiras",
              ].map((item, index) => (
                <li key={index} className="flex items-center font-bold" style={{ color: "#0080c9" }}>
                  <span className="mr-3 text-purple-400">{">"}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <a
              href="https://api.whatsapp.com/send?phone=5511996188216&text=Oii, gostaria de saber mais sobre os serviços."
              target="_blank"
              className="inline-block px-8 py-4 text-xl font-bold text-white rounded-lg transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: "#0080c9" }}
              rel="noreferrer"
            >
              Contate-nos
            </a>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="imoveis-destaque" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 relative inline-block" style={{ color: "#0080c9" }}>
              <span className="animate-bounce">Imóveis em Evidência</span>
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 mt-2"
                style={{ backgroundColor: "#0080c9", opacity: 0.8 }}
              ></div>
            </h2>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="relative h-96 overflow-hidden rounded-lg">
                <Image
                  src={propertySlides[currentSlide].image || "/placeholder.svg"}
                  alt={propertySlides[currentSlide].alt}
                  fill
                  className="object-cover transition-opacity duration-500"
                />
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white hover:bg-opacity-60 transition-all duration-300"
              >
                ‹
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white hover:bg-opacity-60 transition-all duration-300"
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
                    currentSlide === index ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
                <div className="text-sm">
                  <p className="font-semibold text-gray-700 mb-1">{slide.alt.split(" - ")[0]}</p>
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
      <section id="sobre" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 relative inline-block" style={{ color: "#0080c9" }}>
              <span className="animate-bounce">Sobre nós</span>
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 mt-2"
                style={{ backgroundColor: "#0080c9", opacity: 0.8 }}
              ></div>
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2">
              <div className="relative h-96 overflow-hidden rounded-lg">
                <Image
                  src={aboutSlides[currentAboutSlide].image || "/placeholder.svg"}
                  alt={aboutSlides[currentAboutSlide].alt}
                  fill
                  className="object-cover transition-opacity duration-500"
                />

                <button
                  onClick={prevAboutSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white hover:bg-opacity-60 transition-all duration-300"
                >
                  ‹
                </button>

                <button
                  onClick={nextAboutSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white hover:bg-opacity-60 transition-all duration-300"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h4 className="text-2xl font-bold mb-4" style={{ color: "#0080c9" }}>
                Clinica Podológica PRO PÉ
              </h4>
              <p className="text-lg mb-6 leading-relaxed">
                Pró Pé Podologia é uma clínica que acredita na saúde e bem estar de forma holística, focada na saúde dos
                pés o qual reflete no corpo todo. Oferecemos serviços especializados e orientações personalizadas nos
                cuidados podológicos, visando não somente em tratar as necessidades existentes mas atuar na prevenção de
                futuras complicações.
              </p>
              <a
                href="https://api.whatsapp.com/send?phone=5511996188216&text=Oii, gostaria de agendar um horário."
                target="_blank"
                className="inline-block px-6 py-3 text-lg font-bold text-white rounded-lg transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: "#0080c9" }}
                rel="noreferrer"
              >
                Agendar horário
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contatos" className="py-16">
        <div className="container mx-auto px-4 text-center bg-white rounded-lg">
          <h3 className="text-3xl font-bold mb-4" style={{ color: "#0080c9" }}>
            <span className="animate-bounce">HORÁRIO DE FUNCIONAMENTO:</span>
          </h3>
          <h4 className="text-xl mb-8">SEGUNDA A SÁBADO DAS 08:00 ÀS 19:00 HORAS.</h4>

          <div className="mb-12">
            <a
              href="https://api.whatsapp.com/send?phone=5511996188216&text=Oii, gostaria de agendar um horário."
              target="_blank"
              className="inline-block px-8 py-4 text-xl font-bold text-white rounded-lg transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: "#0080c9" }}
              rel="noreferrer"
            >
              AGENDE SEU HORÁRIO
            </a>
          </div>

          <div className="mb-8">
            <div className="w-full max-w-4xl mx-auto h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Mapa será carregado aqui</p>
            </div>
          </div>

          <div>
            <p className="text-lg font-bold mb-4">ENTRE EM CONTATO CONOSCO TAMBÉM EM:</p>
            <div className="flex justify-center items-center gap-6">
              <a
                href="https://www.facebook.com/PODOLOGIAPROPE?_rdr"
                target="_blank"
                className="transform hover:scale-110 transition-transform duration-300"
                rel="noreferrer"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                  f
                </div>
              </a>
              <a
                href="https://www.instagram.com/corretora.cristal?igsh=eTk0OWxueDJkOHQ4"
                target="_blank"
                className="transform hover:scale-110 transition-transform duration-300"
                rel="noreferrer"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
                  📷
                </div>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=5511996188216"
                target="_blank"
                className="transform hover:scale-110 transition-transform duration-300"
                rel="noreferrer"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                  📱
                </div>
              </a>
              <a
                href="mailto:podologiapropesaude@gmail.com"
                target="_blank"
                className="transform hover:scale-110 transition-transform duration-300"
                rel="noreferrer"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl">
                  ✉
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-white text-center" style={{ backgroundColor: "#6494a1" }}>
        <div className="container mx-auto px-4">
          <p className="mb-2">© Podología Clínica Pro Pé 2024</p>
          <p>Desenvolvido por ZCX</p>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://api.whatsapp.com/send?phone=5511996188216&text=Oii, gostaria de saber algumas informações."
        target="_blank"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-300 z-50"
        aria-label="Fale conosco no WhatsApp"
        rel="noreferrer"
      >
        📱
      </a>
    </div>
  )
}
