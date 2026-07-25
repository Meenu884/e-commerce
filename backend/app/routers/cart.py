from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from app.database import get_db
from app.models import CartItem, CartOut, CartItemOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["cart"])


async def build_cart_out(db, raw_items) -> CartOut:
    items_out = []
    total = 0
    for item in raw_items:
        try:
            product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        except InvalidId:
            continue
        if not product:
            continue
        subtotal = product["price_cents"] * item["quantity"]
        total += subtotal
        items_out.append(
            CartItemOut(
                product_id=str(product["_id"]),
                name=product["name"],
                sku=product["sku"],
                price_cents=product["price_cents"],
                quantity=item["quantity"],
                image_url=product.get("image_url"),
                subtotal_cents=subtotal,
            )
        )
    return CartOut(items=items_out, total_cents=total)


@router.get("", response_model=CartOut)
async def get_cart(user=Depends(get_current_user)):
    db = get_db()
    cart = await db.carts.find_one({"user_id": user["_id"]}) or {"items": []}
    return await build_cart_out(db, cart["items"])


@router.post("/items", response_model=CartOut)
async def add_item(payload: CartItem, user=Depends(get_current_user)):
    db = get_db()
    product = await db.products.find_one({"_id": ObjectId(payload.product_id)})
    if not product or not product.get("is_active", True):
        raise HTTPException(status_code=404, detail="Product not found")

    cart = await db.carts.find_one({"user_id": user["_id"]})
    items = cart["items"] if cart else []
    for it in items:
        if it["product_id"] == payload.product_id:
            it["quantity"] += payload.quantity
            break
    else:
        items.append({"product_id": payload.product_id, "quantity": payload.quantity})

    await db.carts.update_one({"user_id": user["_id"]}, {"$set": {"items": items}}, upsert=True)
    return await build_cart_out(db, items)


@router.put("/items/{product_id}", response_model=CartOut)
async def update_item(product_id: str, payload: CartItem, user=Depends(get_current_user)):
    db = get_db()
    cart = await db.carts.find_one({"user_id": user["_id"]})
    items = cart["items"] if cart else []
    found = False
    for it in items:
        if it["product_id"] == product_id:
            it["quantity"] = payload.quantity
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Item not in cart")
    await db.carts.update_one({"user_id": user["_id"]}, {"$set": {"items": items}}, upsert=True)
    return await build_cart_out(db, items)


@router.delete("/items/{product_id}", response_model=CartOut)
async def remove_item(product_id: str, user=Depends(get_current_user)):
    db = get_db()
    cart = await db.carts.find_one({"user_id": user["_id"]})
    items = [it for it in (cart["items"] if cart else []) if it["product_id"] != product_id]
    await db.carts.update_one({"user_id": user["_id"]}, {"$set": {"items": items}}, upsert=True)
    return await build_cart_out(db, items)


@router.delete("", response_model=CartOut)
async def clear_cart(user=Depends(get_current_user)):
    db = get_db()
    await db.carts.update_one({"user_id": user["_id"]}, {"$set": {"items": []}}, upsert=True)
    return CartOut(items=[], total_cents=0)
