import React, { useMemo, useState, useEffect } from "react";

/* =========================
   CONFIG
========================= */
const BRAND = {
  name: "Preciosa Modas",
  logoText: "💎",
  primary: "#ff0f7b",
};
const WHATSAPP_PHONE = "5575991451074"; // DDI+DDD+número
const BACKEND_URL = "https://preco-backend.onrender.com"; // << troque após publicar o backend

const CATEGORIES = [
  { slug: "todos", name: "Todos" },
  { slug: "novidades", name: "Novidades" },
  { slug: "blusas", name: "Blusas" },
  { slug: "croppeds", name: "Croppeds" },
  { slug: "vestidos", name: "Vestidos" },
  { slug: "conjuntos", name: "Conjuntos" },
  { slug: "saias", name: "Saias" },
  { slug: "calcas", name: "Calças" },
  { slug: "promocoes", name: "Promoções" },
];

// EXEMPLOS — troque pelos seus produtos
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

const currency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* =========================
   HELPERS (storage/API)
========================= */
const getToken = () => localStorage.getItem("token");
const setToken = (t) => localStorage.setItem("token", t || "");
const saveLocalOrder = (order) => {
  const list = JSON.parse(localStorage.getItem("orders") || "[]");
  list.unshift(order);
  localStorage.setItem("orders", JSON.stringify(list.slice(0, 100)));
};
const getLocalOrders = () => JSON.parse(localStorage.getItem("orders") || "[]");

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

/* =========================
   UI PIECES
========================= */
function Header({ cartCount, onCartClick, onBrandClick, onLoginClick, isLogged, onAccountClick }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #eee" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button onClick={onBrandClick} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: 0, cursor: "pointer" }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", background: BRAND.primary, color: "#fff", fontWeight: 700 }}>
            {BRAND.logoText}
          </div>
          <strong>{BRAND.name}</strong>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLogged ? (
            <button onClick={onAccountClick} style={{ padding: "6px 10px", borderRadius: 10, background: "#f5f5f5", border: "1px solid #e5e5e5", fontSize: 13 }}>
              Minha conta
            </button>
          ) : (
            <button onClick={onLoginClick} style={{ padding: "6px 10px", borderRadius: 10, background: "#f5f5f5", border: "1px solid #e5e5e5", fontSize: 13 }}>
              Login para ver preços
            </button>
          )}

          <button
            onClick={onCartClick}
            style={{ position: "relative", background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 12, padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}
            aria-label="Abrir carrinho"
          >
            <span>🛒</span>
            <span style={{ minWidth: 18, height: 18, fontSize: 12, lineHeight: "18px", background: "#ff0f7b", color: "#fff", borderRadius: 999, textAlign: "center", padding: "0 6px" }}>
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

function ProductCard({ product, onAdd, canSeePrices }) {
  const price = product.price_atacado; // preço que interessa para atacado (após login)
  const labelPreco = canSeePrices ? currency(price) : "Faça login para ver preços";
  const whatsQuery = encodeURIComponent(
    `Olá! Quero consultar cores e tamanhos do produto:\n${product.name} (SKU ${product.sku}).`
  );
  const whatsLink = `https://wa.me/${WHATSAPP_PHONE}?text=${whatsQuery}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
      <div style={{ fontSize: 12, color: "#666" }}>SKU: {product.sku}</div>

      {product.images?.[0] && (
        <img
          src={product.images[0]}
          alt={product.name}
          style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 12, border: "1px solid #eee" }}
        />
      )}

      <div style={{ fontSize: 14, fontWeight: 700, color: canSeePrices ? "#111" : "#999" }}>
        {labelPreco}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => onAdd(product)}
          disabled={!canSeePrices}
          title={canSeePrices ? "Adicionar ao carrinho" : "Faça login para ver preços e adicionar"}
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            background: canSeePrices ? "#10b981" : "#e5e5e5",
            color: canSeePrices ? "#fff" : "#999",
            border: "none",
            fontSize: 13,
            cursor: canSeePrices ? "pointer" : "not-allowed",
          }}
        >
          Adicionar
        </button>

        <a
          href={whatsLink}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            background: "#f1f1f1",
            border: "1px solid #e5e5e5",
            fontSize: 13,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Consultar cores e tamanhos no WhatsApp
        </a>
      </div>
    </div>
  );
}

function CartModal({ open, onClose, items, onInc, onDec, canSeePrices, onSend }) {
  if (!open) return null;

  const total = items.reduce((sum, { product, qty }) => {
    const p = product.price_atacado;
    return sum + p * qty;
  }, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
      <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "100%", maxWidth: 420, background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600 }}>Seu carrinho</div>
          <button onClick={onClose} style={{ padding: "6px 10px", borderRadius: 8, background: "#f5f5f5" }}>Fechar</button>
        </div>

        <div style={{ padding: 12, flex: 1, overflowY: "auto", display: "grid", gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ fontSize: 14, color: "#666" }}>Seu carrinho está vazio.</div>
          ) : (
            items.map(({ product, qty }) => (
              <div key={product.id} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                <img src={product.images[0]} alt={product.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>SKU: {product.sku}</div>
                  <div style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>
                    {canSeePrices ? currency(product.price_atacado) : "Login para ver preços"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => onDec(product)} style={{ width: 28, height: 28 }}>-</button>
                  <div style={{ width: 22, textAlign: "center" }}>{qty}</div>
                  <button onClick={() => onInc(product)} style={{ width: 28, height: 28 }}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: "#666" }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{canSeePrices ? currency(total) : "—"}</div>
          </div>
          <button onClick={onSend} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: BRAND.primary, color: "#fff", fontWeight: 600, border: "none" }}>
            Enviar pedido no WhatsApp 💬
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(""); setEmail(""); setPhone(""); setPwd(""); setError("");
      setMode("login");
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password: pwd } : { name, email, phone, password: pwd };
      const data = await api(path, { method: "POST", body: payload });
      if (data?.token) setToken(data.token);
      localStorage.setItem("user_profile", JSON.stringify(data?.user || { name, email, phone }));
      onSuccess(data?.user || { name, email, phone });
    } catch (e) {
      // fallback local
      const fakeToken = "localtoken-" + Date.now();
      setToken(fakeToken);
      localStorage.setItem("user_profile", JSON.stringify({ name, email, phone }));
      onSuccess({ name, email, phone });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>{mode === "login" ? "Login" : "Cadastro"}</div>
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ fontSize: 12, background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 8, padding: "6px 10px" }}>
              {mode === "login" ? "Quero me cadastrar" : "Já tenho conta"}
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {mode === "register" && (
              <input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }} />
            )}
            <input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }} />
            {mode === "register" && (
              <input placeholder="Telefone (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }} />
            )}
            <input placeholder="Senha" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }} />
            {error && <div style={{ color: "red", fontSize: 12 }}>{String(error)}</div>}
            <button onClick={submit} disabled={isLoading} style={{ padding: 12, borderRadius: 12, background: BRAND.primary, color: "#fff", fontWeight: 600, border: "none" }}>
              {isLoading ? "Enviando..." : mode === "login" ? "Entrar" : "Cadastrar"}
            </button>
            <button onClick={onClose} style={{ padding: 10, borderRadius: 10, background: "#f5f5f5", border: "1px solid #e5e5e5" }}>
              Cancelar
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            *Se o servidor não responder, salvamos localmente e você verá os preços normalmente. Depois podemos sincronizar.
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountModal({ open, onClose, orders }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 55 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>Meus pedidos</div>
            <button onClick={onClose} style={{ padding: "6px 10px", borderRadius: 8, background: "#f5f5f5" }}>
              Fechar
            </button>
          </div>

          {orders.length === 0 ? (
            <div style={{ fontSize: 14, color: "#666" }}>Você ainda não enviou pedidos.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {orders.map((o, idx) => (
                <div key={idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {new Date(o.created_at || Date.now()).toLocaleString("pt-BR")}
                  </div>
                  <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
                    {o.items.map((it, i) => (
                      <div key={i} style={{ fontSize: 14 }}>
                        • {it.product.name} (SKU {it.product.sku}) — {it.qty}x
                      </div>
                    ))}
                  </div>
                  {!!o.total && <div style={{ marginTop: 8, fontWeight: 700 }}>Total: {currency(o.total)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   PAGE
========================= */
export default function WhatsAppCatalog() {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [orders, setOrders] = useState([]);

  // load user + orders
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user_profile") || "null");
      if (u) setUser(u);
      setOrders(getLocalOrders());
    } catch {}
  }, []);

  const isLogged = !!user;

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) =>
      activeCategory === "todos" ? true : activeCategory === "novidades" ? true : p.category === activeCategory
    );
  }, [activeCategory]);

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
  const inc = (product) => setCart((c) => c.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)));
  const dec = (product) =>
    setCart((c) =>
      c
        .map((i) => (i.product.id === product.id ? { ...i, qty: Math.max(0, i.qty - 1) } : i))
        .filter((i) => i.qty > 0)
    );

  const buildWhatsAppOrderText = () => {
    const linhas = [
      `*${BRAND.name}* — Pedido`,
      "",
      ...cart.map(({ product, qty }) => `• ${product.name} (SKU ${product.sku}) — ${qty}x`),
      "",
      "Olá! Quero finalizar esse pedido.",
    ];
    return linhas.join("\n");
  };

  const logOrder = async () => {
    const body = {
      items: cart.map(({ product, qty }) => ({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        qty,
        price: product.price_atacado,
      })),
      total: cart.reduce((s, i) => s + i.qty * i.product.price_atacado, 0),
      user: user || {},
      created_at: Date.now(),
      channel: "whatsapp",
    };

    // local
    saveLocalOrder(body);
    setOrders(getLocalOrders());

    // backend
    try {
      await api("/api/orders", { method: "POST", body, auth: true });
    } catch {}
  };

  const openWhatsAppOrder = async () => {
    await logOrder();
    const text = encodeURIComponent(buildWhatsAppOrderText());
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, "_blank");
  };

  const openWhatsAppHelp = () => {
    const text = encodeURIComponent("Olá! Estou com dúvida, pode me ajudar?");
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        onCartClick={() => setCartOpen(true)}
        onBrandClick={() => setActiveCategory("todos")} // voltar para a home com todos
        onLoginClick={() => setLoginOpen(true)}
        isLogged={isLogged}
        onAccountClick={() => setAccountOpen(true)}
      />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 12px" }}>
        {/* categorias */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {CATEGORIES.map((cat) => (
            <CategoryBubble key={cat.slug} cat={cat} active={activeCategory === cat.slug} onClick={() => setActiveCategory(cat.slug)} />
          ))}
        </div>

        {/* grade de produtos (2 colunas) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ width: "100%" }}>
              <ProductCard product={p} onAdd={addToCart} canSeePrices={isLogged} />
            </div>
          ))}
        </div>
      </div>

      {/* Botão flutuante do WhatsApp — MENSAGEM GENÉRICA (sem enviar carrinho) */}
      <button
        onClick={openWhatsAppHelp}
        aria-label="Abrir WhatsApp"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 40,
          width: 58,
          height: 58,
          borderRadius: 999,
          background: "#25D366",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 10px 22px rgba(0,0,0,.18)",
          border: "none",
          fontSize: 26,
        }}
        title="Conversar no WhatsApp"
      >
        💬
      </button>

      {/* Carrinho */}
      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onInc={inc}
        onDec={dec}
        canSeePrices={isLogged}
        onSend={openWhatsAppOrder}
      />

      {/* Login/Cadastro */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          setLoginOpen(false);
        }}
      />

      {/* Minha conta (histórico) */}
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} orders={orders} />
    </div>
  );
}
