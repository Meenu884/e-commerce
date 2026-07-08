from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.errors import DuplicateKeyError

from app.database import get_db
from app.models import UserCreate, Token, UserOut
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_to_out(user) -> UserOut:
    return UserOut(id=str(user["_id"]), name=user["name"], email=user["email"], role=user.get("role", "customer"))


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    db = get_db()
    doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "role": "customer",
    }
    try:
        result = await db.users.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    doc["_id"] = result.inserted_id
    token = create_access_token({"sub": str(result.inserted_id)})
    return Token(access_token=token, user=user_to_out(doc))


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.users.find_one({"email": form_data.username.lower()})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": str(user["_id"])})
    return Token(access_token=token, user=user_to_out(user))


@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user_to_out(user)
