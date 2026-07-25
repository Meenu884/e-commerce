from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


def now() -> datetime:
    return datetime.utcnow()


# ---------- Users ----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str = "customer"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Products ----------

class ProductBase(BaseModel):
    name: str
    sku: str
    description: str = ""
    category: str
    price_cents: int = Field(ge=0)
    stock: int = Field(ge=0)
    image_url: Optional[str] = None
    material: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_cents: Optional[int] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    material: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime


# ---------- Cart ----------

class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)


class CartItemOut(BaseModel):
    product_id: str
    name: str
    sku: str
    price_cents: int
    quantity: int
    image_url: Optional[str] = None
    subtotal_cents: int


class CartOut(BaseModel):
    items: List[CartItemOut]
    total_cents: int


# ---------- Orders ----------

class OrderItem(BaseModel):
    product_id: str
    name: str
    sku: str
    price_cents: int
    quantity: int


class ShippingInfo(BaseModel):
    full_name: str
    address_line1: str
    city: str
    postal_code: str
    country: str


class OrderCreate(BaseModel):
    shipping: ShippingInfo


class OrderOut(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    shipping: ShippingInfo
    total_cents: int
    status: str
    created_at: datetime
