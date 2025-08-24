from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import RedirectResponse ,JSONResponse
import httpx
import requests
from fastapi.security import OAuth2PasswordRequestForm
from schemas.user import UserCreate, UserInDB, Token, Role
from utils.security import get_password_hash, verify_password, create_access_token
from db.database import user_collection
from datetime import timedelta
from core.config import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import uuid
from utils.dependencies import get_current_user

router = APIRouter()

@router.get("/test")
async def test_route():
    return {"message": "Test route is working!"}

@router.post("/register", response_model=UserInDB)
async def register(user: UserCreate):
    user_exists = await user_collection.find_one({"email": user.email})
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict.pop("password")
    user_in_db = UserInDB(**user_dict, hashed_password=hashed_password)
    await user_collection.insert_one(user_in_db.dict(by_alias=True))
    return user_in_db

@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    user_obj = UserInDB(**user)
    if not verify_password(form_data.password, user_obj.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_obj.username, "role": user_obj.role.value},
        expires_delta=access_token_expires
    )
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=True,
        samesite="lax"
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/google/login")
async def google_login():
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri={settings.GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile"}

# Assuming this is part of an APIRouter, e.g., @router.get("/google/callback")
@router.get("/google/callback")
async def google_callback(request: Request):
    """
    Handles the redirect from Google OAuth. It exchanges the authorization code
    for tokens, verifies the user's identity, creates an account if one doesn't
    exist, and finally creates a session for the user by setting an HTTPOnly cookie
    with a JWT, before redirecting them to the frontend application.
    """
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code from Google")

    try:
        # Step 1: Exchange the authorization code for an access token and ID token.
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        r = requests.post(token_url, data=token_data)
        token_info = r.json()
        id_token_str = token_info["id_token"]

        # Verify token and get user info
        id_info = id_token.verify_oauth2_token(id_token_str, google_requests.Request(), settings.GOOGLE_CLIENT_ID)

        email = id_info["email"]
        username = id_info.get("name", email) # Use name as username, fallback to email

        # Step 3: Find the user in your database or create a new one.
        user = await user_collection.find_one({"email": email})
        if not user:
            new_user = UserInDB(
                email=email,
                username=username,
                # For users signing in via OAuth, we create a random, unusable password.
                hashed_password=get_password_hash(str(uuid.uuid4())) 
            )
            await user_collection.insert_one(new_user.model_dump(by_alias=True))
            user = await user_collection.find_one({"email": email})

        # Step 4: Create a JWT for your application's session management.
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"]}, expires_delta=access_token_expires
        )

        response = JSONResponse(content={
            "status": "success",
            "message": "User authenticated successfully. Cookie is set.",
            "username": user["username"]
        })
        # Step 5: Set the JWT in a secure, HTTPOnly cookie and redirect to the frontend.
       # response = RedirectResponse(url=settings.FRONTEND_URL)
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,  # Important for security! Prevents access from client-side scripts.
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            # Use secure=True in production (when using HTTPS)
            secure=True if "https" in settings.GOOGLE_REDIRECT_URI else False,
        )
        return response

    except requests.exceptions.HTTPError as e:
        # This will catch errors from the token exchange request
        raise HTTPException(status_code=400, detail=f"Invalid token exchange: {e.response.text}")
    except Exception as e:
        # A general catch-all for other potential errors
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@router.get("/admin/protected")
async def admin_protected_route(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [Role.admin, Role.superadmin]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"message": "Welcome Admin!"}