from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from app.database import get_db
from app.models import OrderCreate, OrderOut, OrderItem
from app.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/orders", tags=["orders"])


def order_to_out(o) -> OrderOut:
    return OrderOut(
        id=str(o["_id"]),
        user_id=str(o["user_id"]),
        items=[OrderItem(**i) for i in o["items"]],
        shipping=o["shipping"],
        total_cents=o["total_cents"],
        status=o["status"],
        created_at=o["created_at"],
    )


@router.post("", response_model=OrderOut, status_code=201)
async def checkout(payload: OrderCreate, user=Depends(get_current_user)):
    """Mock checkout: turns the current cart into an order, decrements stock, clears cart.
    No real payment processing happens here."""
    db = get_db()
    cart = await db.carts.find_one({"user_id": user["_id"]})
    if not cart or not cart["items"]:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    order_items = []
    total = 0
    for item in cart["items"]:
        try:
            product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        except InvalidId:
            continue
        if not product:
            continue
        if product["stock"] < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product['name']}")
        order_items.append(
            {
                "product_id": str(product["_id"]),
                "name": product["name"],
                "sku": product["sku"],
                "price_cents": product["price_cents"],
                "quantity": item["quantity"],
            }
        )
        total += product["price_cents"] * item["quantity"]

    if not order_items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    for item in order_items:
        await db.products.update_one(
            {"_id": ObjectId(item["product_id"])}, {"$inc": {"stock": -item["quantity"]}}
        )

    order_doc = {
        "user_id": user["_id"],
        "items": order_items,
        "shipping": payload.shipping.model_dump(),
        "total_cents": total,
        "status": "confirmed",
        "created_at": datetime.utcnow(),
    }
    result = await db.orders.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id

    await db.carts.update_one({"user_id": user["_id"]}, {"$set": {"items": []}})

    return order_to_out(order_doc)


@router.get("/mine", response_model=List[OrderOut])
async def my_orders(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.orders.find({"user_id": user["_id"]}).sort("created_at", -1)
    return [order_to_out(o) async for o in cursor]


@router.get("", response_model=List[OrderOut], dependencies=[Depends(get_current_admin)])
async def all_orders():
    db = get_db()
    cursor = db.orders.find().sort("created_at", -1)
    return [order_to_out(o) async for o in cursor]
