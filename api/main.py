import os
from datetime import datetime, timedelta
from typing import List, Optional
import logging
from sqlalchemy.exc import IntegrityError

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from swagger_ui_bundle import swagger_ui_2_path as swagger_ui_path
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("preciosa")

from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from passlib.hash import bcrypt

from sqlalchemy import create_engine, ForeignKey, String, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Mapped, mapped_column, relationship, Session
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("precoisa")  # nome que você quiser

# ------------ Config ------------
JWT_ALG = "HS256"
JWT_EXPIRES_DAYS = 30

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./preco.db")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-this")
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*")

# ------------ DB ------------
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    orders: Mapped[List["Order"]] = relationship(back_populates="user")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    total: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    channel: Mapped[str] = mapped_column(String(50), default="whatsapp")

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[str] = mapped_column(String(50))
    sku: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(200))
    qty: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Float)

    order: Mapped["Order"] = relationship(back_populates="items")

Base.metadata.create_all(engine)

# ------------ Schemas ------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None

class ItemIn(BaseModel):
    product_id: str
    sku: str
    name: str
    qty: int
    price: float

class OrderIn(BaseModel):
    items: List[ItemIn]
    total: float
    created_at: Optional[int] = None
    channel: Optional[str] = "whatsapp"

class OrderItemOut(BaseModel):
    product_id: str
    sku: str
    name: str
    qty: int
    price: float

class OrderOut(BaseModel):
    id: int
    total: float
    created_at: datetime
    channel: str
    items: List[OrderItemOut]

class AuthOut(BaseModel):
    token: str
    user: UserOut

# ------------ Auth helpers ------------
def create_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRES_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def get_current_user(db: Session = Depends(lambda: SessionLocal())):
    def _dep(request: Request):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Unauthorized")
        tkn = auth[7:]
        try:
            data = jwt.decode(tkn, JWT_SECRET, algorithms=[JWT_ALG])
            user_id = int(data.get("sub", "0"))
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    return _dep

# ------------ App ------------
app = FastAPI(
    title="Preciosa API",
    docs_url=None,               # desativa docs padrão do FastAPI
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS
origins = [o.strip() for o in CORS_ALLOW_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Swagger local robusto (detecta pasta/arquivos em tempo de execução) ----------
from fastapi.responses import HTMLResponse
import os

# Tenta importar um dos caminhos disponíveis do pacote
try:
    from swagger_ui_bundle import swagger_ui_4_path as _base_path
except Exception:
    try:
        from swagger_ui_bundle import swagger_ui_3_path as _base_path
    except Exception:
        from swagger_ui_bundle import swagger_ui_2_path as _base_path  # versão mais antiga

# Descobrir a pasta real onde estão os arquivos
candidates = [
    _base_path,                     # algumas versões já apontam direto pra pasta correta
    os.path.join(_base_path, "static"),  # outras guardam dentro de /static
]
SWAGGER_DIR = None
for p in candidates:
    if os.path.exists(os.path.join(p, "swagger-ui.css")):
        SWAGGER_DIR = p
        break
if SWAGGER_DIR is None:
    # fallback mesmo assim
    SWAGGER_DIR = _base_path

# Descobrir o nome do JS principal e se existe o standalone-preset
if os.path.exists(os.path.join(SWAGGER_DIR, "swagger-ui-bundle.js")):
    JS_MAIN = "swagger-ui-bundle.js"
else:
    # versões antigas usam swagger-ui.js
    JS_MAIN = "swagger-ui.js"

HAS_STANDALONE = os.path.exists(os.path.join(SWAGGER_DIR, "swagger-ui-standalone-preset.js"))

# Montar os estáticos
app.mount("/_swagger", StaticFiles(directory=SWAGGER_DIR, html=True), name="swagger_static")


from fastapi.responses import HTMLResponse

DOCS_CDN_HTML = """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Preciosa API - Swagger Docs</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet"
          href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
      body { margin: 0; background: #fff; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout',
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>
"""

@app.get("/docs", include_in_schema=False)
def swagger_docs() -> HTMLResponse:
    return HTMLResponse(content=DOCS_CDN_HTML)




# ------------ Endpoints ------------
@app.post("/api/auth/register", response_model=AuthOut)
def register(payload: RegisterIn):
    with SessionLocal() as db:
        try:
            # checagem defensiva (evita 409 direto)
            if db.query(User).filter(User.email == payload.email.lower().strip()).first():
                raise HTTPException(status_code=409, detail="E-mail já registrado")

            user = User(
                name=payload.name.strip(),
                email=payload.email.lower().strip(),
                phone=(payload.phone or "").strip(),
                password_hash=password_hash,
            )
            password_bytes = payload.password.encode("utf-8")[:72]
            password_hash = bcrypt.hash(password_bytes)
            db.add(user)
            db.commit()
            db.refresh(user)

            token = create_token(user.id, user.email)
            return {
                "token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "phone": user.phone,
                },
            }

        except IntegrityError as ie:
            db.rollback()
            logger.warning("Registro com e-mail duplicado: %s", payload.email)
            raise HTTPException(status_code=409, detail="E-mail já registrado")

        except Exception as e:
            db.rollback()
            logger.exception("Falha ao registrar usuário")
            raise HTTPException(status_code=500, detail="internal_error")


@app.post("/api/auth/login", response_model=AuthOut)
def login(payload: LoginIn):
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
        if not user or not bcrypt.verify(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        token = create_token(user.id, user.email)
        return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone}}

@app.get("/api/orders", response_model=List[OrderOut])
def list_orders(current: User = Depends(get_current_user())):
    with SessionLocal() as db:
        rows = db.query(Order).filter(Order.user_id == current.id).order_by(Order.created_at.desc()).all()
        out: List[OrderOut] = []
        for o in rows:
            out.append(OrderOut(
                id=o.id,
                total=o.total,
                created_at=o.created_at,
                channel=o.channel,
                items=[OrderItemOut(product_id=i.product_id, sku=i.sku, name=i.name, qty=i.qty, price=i.price) for i in o.items],
            ))
        return out

@app.post("/api/orders", response_model=OrderOut)
def create_order(payload: OrderIn, current: User = Depends(get_current_user())):
    with SessionLocal() as db:
        o = Order(
            user_id=current.id,
            total=payload.total,
            created_at=datetime.utcfromtimestamp(payload.created_at/1000) if payload.created_at else datetime.utcnow(),
            channel=payload.channel or "whatsapp",
        )
        db.add(o)
        db.flush()
        for it in payload.items:
            db.add(OrderItem(
                order_id=o.id,
                product_id=it.product_id,
                sku=it.sku,
                name=it.name,
                qty=it.qty,
                price=it.price,
            ))
        db.commit()
        db.refresh(o)
        return OrderOut(
            id=o.id,
            total=o.total,
            created_at=o.created_at,
            channel=o.channel,
            items=[OrderItemOut(product_id=i.product_id, sku=i.sku, name=i.name, qty=i.qty, price=i.price) for i in o.items],
        )

@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        return {"ok": True, "db": "up"}
    except Exception as e:
        logger.exception("DB health failed")
        raise HTTPException(status_code=500, detail="db_down")


@app.get("/")
def root():
    return {"ok": True, "service": "Preciosa API", "docs": "/docs", "health": "/api/health"}
