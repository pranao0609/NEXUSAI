from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from core.config import settings
from schemas.user import TokenData, UserInDB
from db.database import user_collection
from fastapi.requests import Request

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        print(payload)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        token_data = TokenData(username=username)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await user_collection.find_one({"username": token_data.username})
    print(user)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Convert ObjectId to str for the 'id' field and remove original _id
    if "_id" in user:
        user["id"] = str(user.pop("_id"))

    # Securely remove the hashed password before returning the user object
    if 'hashed_password' in user:
        del user['hashed_password']
        
    if "name" not in user or user["name"] is None:
        user["name"] = user.get("username", "Anonymous")
    return UserInDB(**user)
