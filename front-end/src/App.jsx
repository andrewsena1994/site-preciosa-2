import React, { useMemo, useState } from "react";

// Configurações gerais
const BRAND = {
  name: "Preciosa Modas",
  logoText: "💎",
  primary: "#ff0f7b", // rosa pink
};

const WHATSAPP_PHONE = "5575991451074"; // número completo com DDI + DDD

// Categorias
const CATEGORIES = [
  { slug: "novidades", name: "Novidades" },
  { slug: "blusas", name: "Blusas" },
  { slug: "croppeds", name: "Croppeds" },
  { slug: "vestidos", name: "Vestidos" },
  { slug: "conjuntos", name: "Conjuntos" },
  { slug: "saias", name: "Saias" },
  { slug: "calcas", name: "Calças" },
  { slug: "promocoes", name: "Promoções" },
];

// Produtos de exemplo
const PRODUCTS = [
  {
    id: "P001",
    name: "Blusa Muscle Tee",
    sku: "PM-MUSCLE-TEE-001",
    category: "blusas",
    price_varejo: 45.0,
    price_atacado: 40.0,
    sizes: ["P", "M", "G"],
    colors: ["preto", "branco", "rosa"],
    images: [
      "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?w=1200&q=80&auto=format&fit=crop",
    ],
    caption: "Blusa muscle tee em cotton de alta qualidade.",
  },
  {
    id: "P002",
    name: "Cropped Neoprene",
    sku: "PM-CROP-NEO-002",
    category: "croppeds",
    price_varejo: 45.0,
    price_atacado: 40.0,
    sizes: ["Único"],
    colors: ["rosa", "azul", "branco"],
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&q=80&auto=format&fit=crop",
    ],
    caption: "Cropped de neoprene com modelagem ajustada.",
  },
  {
    id: "P003",
    name: "Vestido Longo",
    sku: "PM-VEST-LONGO-003",
    category: "vestidos",
    price_varejo: 120.0,
    price_atacado: 95.0,
    sizes: ["P", "M", "G"],
    colors: ["verde", "preto"],
    images: [
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&q=80&auto=format&fit=crop",
    ],
    caption: "Vestido longo leve e fluido.",
  },
];

// Função de formatação de preço
function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.52 3.48A11.78 11.78 0 0012 0C5.38 0 0 5.38 0 12a11.9 11.9 0 001.62 6.02L0 24l6.18-1.62A11.9 11.9 0 0012 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.9 9.9 0 01-5.04-1.4l-.36-.21-3.6.94.96-3.51-.24-.37A9.96 9.96 0 1122 12c0 5.52-4.48 10-10 10zm5.6-7.49c-.31-.16-1.83-.9-2.12-1-.29-.1-.5-.16-.71.16-.21.31-.81 1-.99 1.21-.18.21-.37.24-.68.08-.31-.16-1.29-.48-2.46-1.53-.91-.81-1.52-1.81-1.7-2.12-.18-.31-.02-.48.14-.64.15-.15.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.06-.39-.03-.55-.09-.16-.71-1.71-.97-2.35-.26-.63-.52-.55-.71-.56l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.28 3.24c.16.21 2.22 3.39 5.38 4.75.75.32 1.33.51 1.79.65.75.24 1.43.21 1.97.13.6-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.21-.6-.37z" />
    </svg>
  );
}

function ChatMessage({ children, side = "left" }) {
  const isLeft = side === "left";
  return (
    <div className={`w-full flex ${isLeft ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[88%] rounded-2xl p-3 shadow ${
          isLeft ? "bg-neutral-100" : "bg-emerald-500 text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function CategoryBubble({ cat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm shadow ${
        active ? "bg-emerald-500 text-white" : "bg-neutral-100"
      }`}
    >
      {cat.name}
    </button>
  );
}

function ProductBubble({ product, onAdd, priceMode }) {
  const price =
    priceMode === "atacado" ? product.price_atacado : product.price_varejo;
  const legenda = `${product.name} — ${
    priceMode === "atacado" ? "Atacado" : "Varejo"
  } ${currency(price)}\n${product.caption}`;

  return (
    <ChatMessage side="left">
      <div className="flex flex-col gap-2">
        <div className="font-semibold">{product.name}</div>
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full rounded-xl border"
          />
        )}
        <div className="text-sm">{currency(price)}</div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onAdd(product)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm"
          >
            Adicionar
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(legenda);
                alert("Legenda copiada!");
              } catch {
                alert("Não foi possível copiar.");
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-neutral-200 text-sm"
          >
            Copiar legenda
          </button>
        </div>
      </div>
    </ChatMessage>
  );
}

export default function WhatsAppCatalog() {
  const [activeCategory, setActiveCategory] = useState("novidades");
  const [priceMode, setPriceMode] = useState("atacado");
  const [cart, setCart] = useState([]);

  const filtered = useMemo(
    () =>
      PRODUCTS.filter((p) =>
        activeCategory === "novidades" ? true : p.category === activeCategory
      ),
    [activeCategory]
  );

  const addToCart = (product) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.product.id === product.id);
      if (i >= 0) {
        const next = [...c];
        next[i].qty += 1;
        return next;
      }
      return [...c, { product, qty: 1 }];
    });
  };

  const sendToWhatsApp = () => {
    const text = cart
      .map(
        ({ product, qty }) =>
          `• ${product.name} — ${qty}x ${currency(
            priceMode === "atacado"
              ? product.price_atacado
              : product.price_varejo
          )}`
      )
      .join("\n");
    const total = cart.reduce(
      (sum, { product, qty }) =>
        sum +
        qty *
          (priceMode === "atacado"
            ? product.price_atacado
            : product.price_varejo),
      0
    );
    const msg = `*Pedido ${BRAND.name}*\n${text}\n\nTotal: *${currency(
      total
    )}*\n\nOlá! Quero finalizar esse pedido.`;
    window.open(
      `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4 text-pink-600">
          {BRAND.logoText} {BRAND.name}
        </h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <CategoryBubble
              key={cat.slug}
              cat={cat}
              active={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span>Modo:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPriceMode("atacado")}
              className={`px-3 py-1.5 rounded-lg ${
                priceMode === "atacado"
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-100"
              }`}
            >
              Atacado
            </button>
            <button
              onClick={() => setPriceMode("varejo")}
              className={`px-3 py-1.5 rounded-lg ${
                priceMode === "varejo"
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-100"
              }`}
            >
              Varejo
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((p) => (
            <ProductBubble
              key={p.id}
              product={p}
              onAdd={addToCart}
              priceMode={priceMode}
            />
          ))}
        </div>

        <button
          onClick={sendToWhatsApp}
          className="mt-8 w-full bg-pink-600 text-white py-3 rounded-xl font-semibold"
        >
          Enviar pedido no WhatsApp 💬
        </button>
      </div>
    </div>
  );
}
