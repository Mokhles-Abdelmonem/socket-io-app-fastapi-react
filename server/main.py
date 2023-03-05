import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from sockets import sio_app , sio_server , messages, names_list, players
from pydantic import BaseModel
from typing import Union
import requests
import asyncio
from fastapi.responses import JSONResponse


from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from serializer import RegisterJson, LoginJson, MessageJson, RoleJson
import re
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from utiles import *




app = FastAPI()




@AuthJWT.load_config
def get_config():
    return Settings()

@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(request: Request, exc: AuthJWTException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)













@app.post("/token", response_model=TokenForm)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login/", response_model=Token)
async def login_for_access_token(json_data: LoginJson, Authorize: AuthJWT = Depends()):
    user = await authenticate_user(json_data.username, json_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = Authorize.create_access_token(subject=user['username'])
    refresh_token = Authorize.create_refresh_token(subject=user['username'])
    return {"access_token": access_token, "refresh_token": refresh_token}




@app.post('/refresh')
def refresh(Authorize: AuthJWT = Depends()):
    """
    The jwt_refresh_token_required() function insures a valid refresh
    token is present in the request before running any code below that function.
    we can use the get_jwt_subject() function to get the subject of the refresh
    token, and use the create_access_token() function again to make a new access token
    """
    Authorize.jwt_refresh_token_required()

    current_user = Authorize.get_jwt_subject()
    new_access_token = Authorize.create_access_token(subject=current_user)
    return {"access_token": new_access_token}


@app.post("/register/", response_model=UserInDB)
async def user_register(json_data: RegisterJson):

    user_exist = await users_collection.find_one({"username": json_data.username})
    if user_exist:
        return JSONResponse(
        status_code=409,
        content={"username": f"username already exist"},
    )

    if not email_valid(json_data.email):
        return JSONResponse(
        status_code=501,
        content={"email": "Invalid email address"},
    )
    if not password_valid(json_data.password):
        return JSONResponse(
        status_code=400,
        content={"password": "Invalid password address enter at least 8 characters contain at least 1 number ,1 letter uppercase , 1 letter lowercase, 1 special character"},
    )

    user_valid = await validate_user(json_data.username, json_data.email,json_data.password)
    user = await users_collection.insert_one(user_valid)
    new_user = await users_collection.find_one({"_id": user.inserted_id})

    return new_user


@app.get("/users/")
async def read_users(current_user: User = Depends(get_current_active_user)):
    users = await retrieve_users()
    if users :
        return ResponseModel(users, "Users retrieved successfully")
    return ResponseModel(users, "Empty list returned")
    


@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/users/me/items/")
async def read_own_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": "Foo", "owner": current_user['username']}]







@app.post("/message")
async def set_message(message: MessageJson, current_user: User = Depends(get_current_active_user)):
    global messages

    current_user.pop("_id", None)
    current_user.pop("hashed_password", None)
    messages.append(
        {'sid': current_user['sid'],
         'message': message.text,
         'player': current_user,
         'type': 'chat'
         }
    )
    await sio_server.emit('chat', messages, 'general_room')    
    return {f"message from {current_user['username']}": message.text}








@app.post("/roles")
async def set_role(role: RoleJson):
    role_exist = await role_collection.find_one({"role_number": role.role_number})
    if role_exist:
        return JSONResponse(
        status_code=409,
        content={"role": f"role already exist"},
    )
    role_collection.insert_one({"role_number": role.role_number})
    return role























################# Socket IO #################


app.mount('/', app=sio_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




if __name__ == '__main__':
    uvicorn.run('main:app', reload=True)
