from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'preciosa-modas-secret-key-2024')
JWT_ALGORITHM = 'HS256'

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    email: EmailStr
    cpf_cnpj: str
    telefone: str
    tipo: str = "atacado"  # atacado ou varejo
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    cpf_cnpj: str
    telefone: str
    senha: str
    tipo: str = "atacado"

class UserLogin(BaseModel):
    cpf_cnpj: str
    senha: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    descricao: str
    preco_atacado: float
    preco_varejo: float
    categoria: str
    imagens: List[str]
    estoque: int
    disponivel: bool = True
    destaque: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    nome: str
    descricao: str
    preco_atacado: float
    preco_varejo: float
    categoria: str
    imagens: List[str]
    estoque: int
    disponivel: bool = True
    destaque: bool = False

class OrderItem(BaseModel):
    product_id: str
    nome: str
    quantidade: int
    preco_unitario: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_nome: str
    produtos: List[OrderItem]
    total: float
    status: str = "pendente"  # pendente, confirmado, enviado, entregue
    metodo_pagamento: str  # pix, cartao, boleto
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OrderCreate(BaseModel):
    user_id: str
    user_nome: str
    produtos: List[OrderItem]
    total: float
    metodo_pagamento: str

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    email: EmailStr
    telefone: str
    mensagem: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactCreate(BaseModel):
    nome: str
    email: EmailStr
    telefone: str
    mensagem: str

class AdminLogin(BaseModel):
    username: str
    senha: str

class TokenResponse(BaseModel):
    token: str
    user: User

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except:
        raise HTTPException(status_code=401, detail="Token inválido")

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"cpf_cnpj": user_data.cpf_cnpj})
    if existing:
        raise HTTPException(status_code=400, detail="CPF/CNPJ já cadastrado")
    
    # Hash password
    hashed_pw = hash_password(user_data.senha)
    
    # Create user
    user_dict = user_data.model_dump()
    user_dict.pop('senha')
    user = User(**user_dict)
    
    doc = user.model_dump()
    doc['senha_hash'] = hashed_pw
    await db.users.insert_one(doc)
    
    # Create token
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user_doc = await db.users.find_one({"cpf_cnpj": login_data.cpf_cnpj})
    if not user_doc or not verify_password(login_data.senha, user_doc['senha_hash']):
        raise HTTPException(status_code=401, detail="CPF/CNPJ ou senha inválidos")
    
    user = User(**user_doc)
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_current_user(user_id: str = Depends(verify_token)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return User(**user_doc)

# Admin Routes
@api_router.post("/admin/login")
async def admin_login(admin_data: AdminLogin):
    # Simple admin check (username: admin, password: admin123)
    if admin_data.username == "admin" and admin_data.senha == "admin123":
        token = create_token("admin")
        return {"token": token, "username": "admin"}
    raise HTTPException(status_code=401, detail="Credenciais inválidas")

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(categoria: Optional[str] = None, destaque: Optional[bool] = None):
    query = {}
    if categoria:
        query['categoria'] = categoria
    if destaque is not None:
        query['destaque'] = destaque
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product

@api_router.post("/admin/products", response_model=Product)
async def create_product(product_data: ProductCreate, user_id: str = Depends(verify_token)):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    await db.products.insert_one(doc)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, user_id: str = Depends(verify_token)):
    product = Product(id=product_id, **product_data.model_dump())
    doc = product.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": doc})
    return product

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, user_id: str = Depends(verify_token)):
    await db.products.delete_one({"id": product_id})
    return {"message": "Produto deletado"}

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    order = Order(**order_data.model_dump())
    doc = order.model_dump()
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders/user/{user_id}", response_model=List[Order])
async def get_user_orders(user_id: str):
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return orders

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(user_id: str = Depends(verify_token)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, user_id: str = Depends(verify_token)):
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    return {"message": "Status atualizado"}

# Contact Route
@api_router.post("/contact", response_model=Contact)
async def create_contact(contact_data: ContactCreate):
    contact = Contact(**contact_data.model_dump())
    doc = contact.model_dump()
    await db.contacts.insert_one(doc)
    return contact

@api_router.get("/admin/contacts", response_model=List[Contact])
async def get_contacts(user_id: str = Depends(verify_token)):
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    return contacts

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()