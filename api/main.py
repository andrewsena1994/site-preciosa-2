import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from passlib.hash import bcrypt

from sqlalchemy import create_engine, ForeignKey, String, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Mapped, mapped_column, relationship, Session

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

def get_current_user(db: Session = Depends(lambda: SessionLocal()), token: Optional[str] = None):
    # FastAPI pega Authorization automaticamente via dependency? vamos ler do header manualmente
    # Como simplificação, usaremos o header "Authorization: Bearer <token>"
    from fastapi import Request
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
app = FastAPI(title="Preciosa API")

origins = [o.strip() for o in CORS_ALLOW_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------ Endpoints ------------
@app.post("/api/auth/register", response_model=AuthOut)
def register(payload: RegisterIn):
    with SessionLocal() as db:
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(status_code=409, detail="E-mail já registrado")
        user = User(
            name=payload.name.strip(),
            email=payload.email.lower().strip(),
            phone=(payload.phone or "").strip(),
            password_hash=bcrypt.hash(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        token = create_token(user.id, user.email)
        return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone}}

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
def health():
    return {"ok": True}
