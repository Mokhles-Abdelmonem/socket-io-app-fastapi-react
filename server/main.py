import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from sockets import sio_app, sio_server, players, names_list, room_dict, history

from pydantic import BaseModel
from typing import Union
import requests
import asyncio


from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from forms import RegisterForm
import re
from schema import ResponseModel
from database import user_helper

import motor.motor_asyncio 

MONGO_DETAILS = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.MokhlesGame

users_collection = database.get_collection("users")

app = FastAPI()


@app.get('/')
async def home():
    return {'message': 'Hello👋 Developers💻'}


@app.get("/move/{user}/{move}")
async def set_move(user, move):
    if user in names_list:
        name_index = names_list.index(user)
        player = players[name_index]
        room = player.get('room_number')
        player_room = player.get('room_number')
        opponent = None
        lasthisory = []
        if player_room :
            player_list = room_dict.get(player_room)
            room_history = history.get(room)
            if room_history:
                lasthisory = room_history[-1]
            if player_list:
                for player_name in player_list:
                    if player_name != player['name']:
                        opponent = player_name
        player['room_hestory'] = lasthisory
        player['opponent'] = opponent

        
        if room :
            await sio_server.emit('handleMove', {"move":int(move), "player":player}, to=player['sid'])
            return {"success": "successful move"}
        return {"error": "user not in any room"}
    return {"error": "user does not exist"}





SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    }
}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Union[str, None] = None


class User(BaseModel):
    username: str
    email: Union[str, None] = None
    disabled: Union[bool, None] = None


class UserInDB(User):
    hashed_password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def retrieve_user(username: str):
    user = await users_collection.find_one({"username":username})
    if user:
        return user_helper(user)

async def get_user(username: str):
    user_dict = await retrieve_user(username)
    return user_dict


async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    verifyed = verify_password(password, user["hashed_password"])
    if not verifyed:
        return False
    return user


def email_valid(s):
   pat = "^[a-zA-Z0-9-_]+@[a-zA-Z0-9]+\.[a-z]{1,3}$"
   if re.match(pat,s):
      return True
   return False



def password_valid(s):
   pat = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
   if re.match(pat,s):
      return True
   return False


async def validate_user(username: str, email: str, password: str):
    user = await get_user(username)
    if user:
        return False
    # if not verify_password(password, user.hashed_password):
    #     return False
    return {"username": username, "email": email, "hashed_password": get_password_hash(password)}




async def user_exist(username: str):
    user = await get_user(username)
    if user:
        return True
    return False



def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = await get_user( username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    # if current_user['disabled']:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.post("/token/", response_model=Token)
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


@app.post("/register", response_model=UserInDB)
async def user_register(form_data: RegisterForm):
    print("form_data")
    print(form_data)

    user_exist = await users_collection.find_one({"username": form_data.username})
    if user_exist:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="username allready exist",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not email_valid(form_data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invalid email address",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not password_valid(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invalid password address enter at least 8 characters contain at least 1 number ,1 letter uppercase , 1 letter lowercase, 1 special character",

            headers={"WWW-Authenticate": "Bearer"},
        )

    user_valid = await validate_user(form_data.username, form_data.email,form_data.password)
    user = await users_collection.insert_one(user_valid)
    new_user = await users_collection.find_one({"_id": user.inserted_id})

    return new_user

async def retrieve_users():
    users = []
    async for user in users_collection.find():
        users.append(user_helper(user))
    return users

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
