import React from 'react';
import { Gem, Target, Heart, Users } from 'lucide-react';

const Sobre = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1546213290-e1b492ab3eee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxmYXNoaW9uJTIwc3RvcmV8ZW58MHx8fHwxNzYwODYxNDU0fDA&ixlib=rb-4.1.0&q=85')`,
        }}
        data-testid="about-hero"
      >
        <div className="text-center text-white">
          <Gem className="w-16 h-16 mx-auto mb-4 diamond-sparkle" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">Sobre a Preciosa Modas</h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12" data-testid="our-story">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Nossa História</h2>
            <div className="space-y-4 text-gray-700 text-base leading-relaxed">
              <p>
                A <strong>Preciosa Modas</strong> nasceu do sonho de democratizar a moda feminina de qualidade,
                oferecendo peças elegantes e acessíveis para revendedores em todo o Brasil.
              </p>
              <p>
                Com anos de experiência no mercado de moda atacadista, entendemos as necessidades
                das nossas parceiras revendedoras: produtos de qualidade, preços competitivos e
                suporte especializado.
              </p>
              <p>
                Hoje, somos referência em moda feminina no atacado, oferecendo coleções renovadas
                constantemente, sempre alinhadas às últimas tendências do mercado, sem abrir mão
                da sofisticação e do bom gosto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="value-quality">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Qualidade</h3>
              <p className="text-gray-600 text-sm">
                Peças cuidadosamente selecionadas com tecidos nobres e acabamento impecável.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="value-mission">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Foco no Cliente</h3>
              <p className="text-gray-600 text-sm">
                Sucesso das nossas revendedoras é nosso principal objetivo e motivação.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center" data-testid="value-partnership">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Parceria</h3>
              <p className="text-gray-600 text-sm">
                Construímos relacionamentos duradouros baseados em confiança e transparência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-pink-400 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl" data-testid="mission-section">
          <Users className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Nossa Missão</h2>
          <p className="text-base sm:text-lg leading-relaxed">
            Empoderar mulheres empreendedoras através da moda, oferecendo produtos de
            alta qualidade a preços justos, permitindo que nossas parceiras alcancem
            independência financeira e realizem seus sonhos.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Por Que Escolher a Preciosa Modas?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4" data-testid="benefit-prices">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <h3 className="font-bold mb-2">Preços Competitivos</h3>
                <p className="text-gray-600 text-sm">Melhores margens de lucro do mercado para suas revendas.</p>
              </div>
            </div>
            <div className="flex gap-4" data-testid="benefit-variety">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👗</span>
              </div>
              <div>
                <h3 className="font-bold mb-2">Variedade de Produtos</h3>
                <p className="text-gray-600 text-sm">Catálogo sempre atualizado com as últimas tendências.</p>
              </div>
            </div>
            <div className="flex gap-4" data-testid="benefit-support">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="font-bold mb-2">Suporte Dedicado</h3>
                <p className="text-gray-600 text-sm">Grupo VIP no WhatsApp com dicas e atendimento prioritário.</p>
              </div>
            </div>
            <div className="flex gap-4" data-testid="benefit-delivery">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🚚</span>
              </div>
              <div>
                <h3 className="font-bold mb-2">Entrega Rápida</h3>
                <p className="text-gray-600 text-sm">Logística eficiente para você receber seus produtos rapidamente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sobre;
