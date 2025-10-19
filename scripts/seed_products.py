import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import uuid
from datetime import datetime, timezone

# Product images from vision expert
PRODUCT_IMAGES = [
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGNsb3RoaW5nfGVufDB8fHx8MTc2MDg2MTQ0NXww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHx3b21lbiUyMGNsb3RoaW5nfGVufDB8fHx8MTc2MDg2MTQ0NXww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHw0fHx3b21lbiUyMGNsb3RoaW5nfGVufDB8fHx8MTc2MDg2MTQ0NXww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwc2FsZXxlbnwwfHx8fDE3NjA4NjE0NTB8MA&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/794062/pexels-photo-794062.jpeg",
    "https://images.pexels.com/photos/34329930/pexels-photo-34329930.jpeg",
    "https://images.unsplash.com/photo-1678637803637-514841dd08e2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tYW4lMjBmYXNoaW9ufGVufDB8fHx8MTc2MDg2MTQ0MHww&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/34326848/pexels-photo-34326848.jpeg",
]

PRODUCTS = [
    {
        "nome": "Vestido Floral Primavera",
        "descricao": "Vestido midi com estampa floral delicada, ideal para o dia a dia com elegância e conforto.",
        "preco_atacado": 45.90,
        "preco_varejo": 89.90,
        "categoria": "vestidos",
        "imagens": [PRODUCT_IMAGES[3]],
        "estoque": 50,
        "disponivel": True,
        "destaque": True
    },
    {
        "nome": "Blusa Básica Premium",
        "descricao": "Blusa básica em tecido premium com caimento perfeito. Disponível em várias cores.",
        "preco_atacado": 29.90,
        "preco_varejo": 59.90,
        "categoria": "blusas",
        "imagens": [PRODUCT_IMAGES[2]],
        "estoque": 80,
        "disponivel": True,
        "destaque": True
    },
    {
        "nome": "Conjunto Executivo",
        "descricao": "Conjunto blazer e calça para um look profissional e sofisticado.",
        "preco_atacado": 89.90,
        "preco_varejo": 179.90,
        "categoria": "conjuntos",
        "imagens": [PRODUCT_IMAGES[6]],
        "estoque": 30,
        "disponivel": True,
        "destaque": True
    },
    {
        "nome": "Calça Skinny Jeans",
        "descricao": "Calça jeans skinny com elastano para máximo conforto e modelagem perfeita.",
        "preco_atacado": 55.90,
        "preco_varejo": 109.90,
        "categoria": "calças",
        "imagens": [PRODUCT_IMAGES[4]],
        "estoque": 60,
        "disponivel": True,
        "destaque": False
    },
    {
        "nome": "Saia Midi Plissada",
        "descricao": "Saia midi plissada elegante, perfeita para ocasiões especiais.",
        "preco_atacado": 42.90,
        "preco_varejo": 84.90,
        "categoria": "saias",
        "imagens": [PRODUCT_IMAGES[5]],
        "estoque": 45,
        "disponivel": True,
        "destaque": False
    },
    {
        "nome": "Macaquinho Listrado",
        "descricao": "Macaquinho listrado moderno com decote nas costas e amarração na cintura.",
        "preco_atacado": 52.90,
        "preco_varejo": 104.90,
        "categoria": "macacões",
        "imagens": [PRODUCT_IMAGES[7]],
        "estoque": 35,
        "disponivel": True,
        "destaque": True
    },
    {
        "nome": "Vestido Longo Festa",
        "descricao": "Vestido longo elegante com detalhes em renda, ideal para festas e eventos.",
        "preco_atacado": 95.90,
        "preco_varejo": 189.90,
        "categoria": "vestidos",
        "imagens": [PRODUCT_IMAGES[0]],
        "estoque": 25,
        "disponivel": True,
        "destaque": False
    },
    {
        "nome": "Blusa Estampada Tropical",
        "descricao": "Blusa fluida com estampa tropical vibrante, perfeita para o verão.",
        "preco_atacado": 35.90,
        "preco_varejo": 69.90,
        "categoria": "blusas",
        "imagens": [PRODUCT_IMAGES[1]],
        "estoque": 70,
        "disponivel": True,
        "destaque": False
    },
]

async def seed_database():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client['preciosa_modas']
    
    # Clear existing products
    await db.products.delete_many({})
    print("🗑️  Produtos existentes removidos")
    
    # Insert new products
    for product_data in PRODUCTS:
        product = {
            **product_data,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.products.insert_one(product)
    
    print(f"✅ {len(PRODUCTS)} produtos adicionados com sucesso!")
    
    # Show summary
    total_products = await db.products.count_documents({})
    featured_products = await db.products.count_documents({"destaque": True})
    print(f"📊 Total de produtos: {total_products}")
    print(f"⭐ Produtos em destaque: {featured_products}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
