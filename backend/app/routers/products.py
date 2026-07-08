from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError

from app.database import get_db
from app.models import ProductCreate, ProductUpdate, ProductOut
from app.auth import get_current_admin

router = APIRouter(prefix="/api/products", tags=["products"])


def product_to_out(p) -> ProductOut:
    return ProductOut(
        id=str(p["_id"]),
        name=p["name"],
        sku=p["sku"],
        description=p.get("description", ""),
        category=p["category"],
        price_cents=p["price_cents"],
        stock=p["stock"],
        image_url=p.get("image_url"),
        material=p.get("material"),
        is_active=p.get("is_active", True),
        created_at=p["created_at"],
        updated_at=p["updated_at"],
    )


def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Product not found")


@router.get("", response_model=List[ProductOut])
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    include_inactive: bool = False,
):
    db = get_db()
    query = {}
    if not include_inactive:
        query["is_active"] = True
    if category:
        query["category"] = category
    if search:
        query["$text"] = {"$search": search}
    cursor = db.products.find(query).sort("created_at", -1)
    return [product_to_out(p) async for p in cursor]


@router.get("/categories", response_model=List[str])
async def list_categories():
    db = get_db()
    cats = await db.products.distinct("category", {"is_active": True})
    return sorted(cats)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    db = get_db()
    p = await db.products.find_one({"_id": oid(product_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_out(p)


@router.post("", response_model=ProductOut, status_code=201, dependencies=[Depends(get_current_admin)])
async def create_product(payload: ProductCreate):
    db = get_db()
    now = datetime.utcnow()
    doc = payload.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    try:
        result = await db.products.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="A product with this SKU already exists")
    doc["_id"] = result.inserted_id
    return product_to_out(doc)


@router.put("/{product_id}", response_model=ProductOut, dependencies=[Depends(get_current_admin)])
async def update_product(product_id: str, payload: ProductUpdate):
    db = get_db()
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if updates:
        updates["updated_at"] = datetime.utcnow()
        try:
            result = await db.products.update_one({"_id": oid(product_id)}, {"$set": updates})
        except DuplicateKeyError:
            raise HTTPException(status_code=400, detail="A product with this SKU already exists")
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
    p = await db.products.find_one({"_id": oid(product_id)})
    return product_to_out(p)


@router.delete("/{product_id}", status_code=204, dependencies=[Depends(get_current_admin)])
async def delete_product(product_id: str):
    db = get_db()
    result = await db.products.delete_one({"_id": oid(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return None
