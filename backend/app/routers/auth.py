from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import Token, LoginRequest
from app.config import JWT_SECRET, ADMIN_PASSWORD
import jwt
import datetime

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: LoginRequest):
    if form_data.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create simple JWT
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    token_data = {"sub": "admin", "exp": expiration}
    token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
    
    return {"access_token": token, "token_type": "bearer"}
