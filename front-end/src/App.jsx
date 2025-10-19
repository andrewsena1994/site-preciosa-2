import React, { useMemo, useState, useEffect } from "react";

/* =========================
   CONFIGURAÇÕES GERAIS
========================= */
const BRAND = {
  name: "Preciosa Modas",
  logoText: "💎",
  primary: "#ff0f7b", // rosa pink
};

const WHATSAPP_PHONE = "5575991451074"; // número completo com DDI + DDD

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

// Produtos de exemplo (troque pelas suas fotos/infos)
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

function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* =========================
   COMPONENTES DE UI
========================= */
function Header({ cartCount, onCartClick, onLoginClick, isWholesale }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#fff",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              background: BRAND.primary,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {BRAND.logoText}
          </div>
          <strong>{BRAND.name}</strong>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isWholesale && (
            <button
              onClick={onLoginClick}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                background: "#f5f5f5",
                border: "1px solid #e5e5e5",
                fontSize: 13,
              }}
            >
              Login atacado
            </button>
          )}

          <button
            onClick={onCartClick}
            style={{
              position: "relative",
              background: "#f5f5f5",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            aria-label="Abrir carrinho"
          >
            <span>🛒</span>
            <span
              style={{
                minWidth: 18,
                height: 18,
                fontSize: 12,
                lineHeight: "18px",
                background: "#ff0f7b",
                color: "#fff",
                borderRadius: 999,
                textAlign: "center",
                padding: "0 6px",
              }}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryBubble({ cat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 16,
        padding: "6px 10px",
        fontSize: 13,
        border: active ? "1px solid #10b981" : "1px solid #e5e5e5",
        background: active ? "#10b981" : "#f5f5f5",
        color: active ? "#fff" : "#111",
      }}
    >
      {cat.name}
    </button>
  );
}

function ProductCard({ product, onAdd, showWholesale }) {
  const price = showWholesale ? product.price_atacado : product.price_varejo;
  const legenda = `${product.name} — SKU: ${product.sku} — ${currency(
    price
  )}\n${product.caption || ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
      <div style={{ fontSize: 12, color: "#666" }}>SKU: {product.sku}</div>

      {product.images?.[0] && (
        <img
          src={product.images[0]}
          alt={product.name}
          style={{
            width: "100%",
            aspectRatio: "1/1",
            objectFit: "cover",
            borderRadius: 12,
            border: "1px solid #eee",
          }}
        />
      )}

      <div style={{ fontSize: 14, fontWeight: 700 }}>{currency(price)}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => onAdd(product)}
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            background: "#10b981",
            color: "#fff",
            border: "none",
            fontSize: 13,
          }}
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
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            background: "#f1f1f1",
            border: "1px solid #e5e5e5",
            fontSize: 13,
          }}
        >
          Copiar legenda
        </button>
      </div>
    </div>
  );
}

function CartModal({ open, onClose, items, onInc, onDec, showWholesale, onSend }) {
  if (!open) return null;

  const total = items.reduce((sum, { product, qty }) => {
    const p = showWholesale ? product.price_atacado : product.price_varejo;
    return sum + p * qty;
  }, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 600 }}>Seu carrinho</div>
          <button
            onClick={onClose}
            style={{ padding: "6px 10px", borderRadius: 8, background: "#f5f5f5" }}
          >
            Fechar
          </button>
        </div>

        <div style={{ padding: 12, flex: 1, overflowY: "auto", display: "grid", gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ fontSize: 14, color: "#666" }}>Seu carrinho está vazio.</div>
          ) : (
            items.map(({ product, qty }) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>SKU: {product.sku}</div>
                  <div style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>
                    {currency(showWholesale ? product.price_atacado : product.price_varejo)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => onDec(product)} style={{ width: 28, height: 28 }}>
                    -
                  </button>
                  <div style={{ width: 22, textAlign: "center" }}>{qty}</div>
                  <button onClick={() => onInc(product)} style={{ width: 28, height: 28 }}>
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#666" }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{currency(total)}</div>
          </div>
          <button
            onClick={onSend}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              background: BRAND.primary,
              color: "#fff",
              fontWeight: 600,
              border: "none",
            }}
          >
            Enviar pedido no WhatsApp 💬
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (open) {
      setEmail("");
      setPhone("");
      setPwd("");
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    // Armazenamento local (navegador). Para armazenamento seguro no servidor, precisamos de backend.
    const user = { email, phone, pwd, ts: Date.now() };
    localStorage.setItem("wholesale_user", JSON.stringify(user));
    onSuccess(user);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #eee",
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Login Atacado</div>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
            />
            <input
              placeholder="Telefone (WhatsApp)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
            />
            <input
              placeholder="Senha"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
            />
            <button
              onClick={save}
              style={{
                padding: 12,
                borderRadius: 12,
                background: BRAND.primary,
                color: "#fff",
                fontWeight: 600,
                border: "none",
              }}
            >
              Entrar
            </button>
            <button
              onClick={onClose}
              style={{
                padding: 10,
                borderRadius: 10,
                background: "#f5f5f5",
                border: "1px solid #e5e5e5",
              }}
            >
              Cancelar
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            *Os dados ficam salvos no seu navegador (localStorage). Para guardar no servidor,
            podemos ativar login com backend depois.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PÁGINA PRINCIPAL
========================= */
export default function WhatsAppCatalog() {
  const [activeCategory, setActiveCategory] = useState("novidades");
  const [cart, setCart] = useState([]); // { product, qty }[]
  const [cartOpen, setCartOpen] = useState(false);

  const [wholesaleUser, setWholesaleUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  // Carrega usuário atacado do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wholesale_user");
      if (raw) setWholesaleUser(JSON.parse(raw));
    } catch {}
  }, []);

  const isWholesale = !!wholesaleUser;

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

  const inc = (product) => {
    setCart((c) =>
      c.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i))
    );
  };

  const dec = (product) => {
    setCart((c) =>
      c
        .map((i) =>
          i.product.id === product.id ? { ...i, qty: Math.max(0, i.qty - 1) } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  // Mensagem de WhatsApp com nome + SKU + preços
  const buildWhatsAppText = () => {
    const linhas = [
      `*${BRAND.name}* — Pedido`,
      isWholesale ? `Tipo: Atacado` : `Tipo: Varejo`,
      "",
      ...cart.map(({ product, qty }) => {
        const p = isWholesale ? product.price_atacado : product.price_varejo;
        return `• ${product.name} (SKU ${product.sku})\n  Quant.: ${qty}  Preço: ${currency(
          p
        )}  Parcial: ${currency(p * qty)}`;
      }),
    ];

    const total = cart.reduce((sum, { product, qty }) => {
      const p = isWholesale ? product.price_atacado : product.price_varejo;
      return sum + p * qty;
    }, 0);

    linhas.push("", `Total: *${currency(total)}*`, "", "Olá! Quero finalizar esse pedido.");
    return linhas.join("\n");
  };

  const sendToWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppText());
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
        isWholesale={isWholesale}
      />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 12px" }}>
        {/* Categorias */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {CATEGORIES.map((cat) => (
            <CategoryBubble
              key={cat.slug}
              cat={cat}
              active={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
            />
          ))}
        </div>

        {/* Grade de 2 colunas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((p) => (
            <div key={p.id} style={{ width: "100%" }}>
              <ProductCard
                product={p}
                onAdd={addToCart}
                showWholesale={isWholesale}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botão flutuante do WhatsApp (substitui o do carrinho) */}
      <button
        onClick={sendToWhatsApp}
        aria-label="Enviar pedido no WhatsApp"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 40,
          width: 58,
          height: 58,
          borderRadius: 999,
          background: "#25D366", // verde WhatsApp
          color: "#fff",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 10px 22px rgba(0,0,0,.18)",
          border: "none",
          fontSize: 26,
        }}
        title="Enviar pedido no WhatsApp"
      >
        💬
      </button>

      {/* Modal do carrinho (abre pelo ícone no header) */}
      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onInc={inc}
        onDec={dec}
        showWholesale={isWholesale}
        onSend={sendToWhatsApp}
      />

      {/* Modal de login do atacado */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={(u) => {
          setWholesaleUser(u);
          setLoginOpen(false);
        }}
      />
    </div>
  );
}
