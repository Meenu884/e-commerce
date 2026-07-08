"""
Run with: python -m app.seed
Creates an admin user (from .env) and a set of sample products, if they don't already exist.
"""
import asyncio
from datetime import datetime

from app.database import connect_to_mongo, close_mongo_connection, get_db, get_settings
from app.auth import hash_password

SAMPLE_PRODUCTS = [
    {
        "name": "Waxed Canvas Apron",
        "sku": "APR-001",
        "description": "Heavyweight waxed canvas shop apron with brass rivets and a leather neck strap. Built to take a beating.",
        "category": "Workwear",
        "price_cents": 6800,
        "stock": 24,
        "material": "Waxed cotton canvas, brass, leather",
        "image_url": "https://images.unsplash.com/photo-1621293954908-907159247fc8?w=800",
    },
    {
        "name": "Forged Bench Chisel Set",
        "sku": "CHS-014",
        "description": "Set of three hand-forged chisels, oil-hardened steel, octagonal ash handles.",
        "category": "Hand Tools",
        "price_cents": 9200,
        "stock": 15,
        "material": "Carbon steel, ash wood",
        "image_url": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
    },
    {
        "name": "Raw Selvedge Work Trousers",
        "sku": "TRS-022",
        "description": "13oz raw selvedge denim cut for movement, double-stitched at every stress point.",
        "category": "Workwear",
        "price_cents": 11800,
        "stock": 30,
        "material": "13oz selvedge denim",
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
    },
    {
        "name": "Stoneware Utility Mug",
        "sku": "MUG-007",
        "description": "Thrown and glazed in small batches. A little different every time, on purpose.",
        "category": "Ceramics",
        "price_cents": 2600,
        "stock": 60,
        "material": "Stoneware, food-safe glaze",
        "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
    },
    {
        "name": "Leather Tool Roll",
        "sku": "ROL-030",
        "description": "Full-grain leather tool roll with eight pockets, brass buckle closure, ages with use.",
        "category": "Leather Goods",
        "price_cents": 7400,
        "stock": 18,
        "material": "Full-grain leather, brass",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    },
    {
        "name": "Cast Iron Marking Gauge",
        "sku": "MKG-011",
        "description": "Precision marking gauge with a cast iron body and hardened steel pin.",
        "category": "Hand Tools",
        "price_cents": 4200,
        "stock": 22,
        "material": "Cast iron, steel",
        "image_url": "https://images.unsplash.com/photo-1581147036324-c1c4c1c1c1c1?w=800",
    },
    {
        "name": "Woven Shop Towels (Set of 6)",
        "sku": "TWL-002",
        "description": "Heavy cotton shop towels, woven in a mill that's been running since 1948.",
        "category": "Textiles",
        "price_cents": 3200,
        "stock": 45,
        "material": "100% cotton",
        "image_url": "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=800",
    },
    {
        "name": "Brass Bench Vise, 4-inch",
        "sku": "VSE-019",
        "description": "Solid brass jaws, precision-machined threads. A vise you hand down, not throw out.",
        "category": "Hand Tools",
        "price_cents": 15400,
        "stock": 10,
        "material": "Brass, steel",
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
    },
]


async def seed():
    await connect_to_mongo()
    db = get_db()
    settings = get_settings()

    admin = await db.users.find_one({"email": settings.admin_email.lower()})
    if not admin:
        await db.users.insert_one(
            {
                "name": "Admin",
                "email": settings.admin_email.lower(),
                "password_hash": hash_password(settings.admin_password),
                "role": "admin",
            }
        )
        print(f"Created admin user: {settings.admin_email}")
    else:
        print("Admin user already exists, skipping.")

    for p in SAMPLE_PRODUCTS:
        existing = await db.products.find_one({"sku": p["sku"]})
        if existing:
            continue
        doc = dict(p)
        doc["is_active"] = True
        doc["created_at"] = datetime.utcnow()
        doc["updated_at"] = datetime.utcnow()
        await db.products.insert_one(doc)
    count = await db.products.count_documents({})
    print(f"Product catalog now has {count} products.")

    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed())
