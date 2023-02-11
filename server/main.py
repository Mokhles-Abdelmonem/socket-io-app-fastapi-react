import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sockets import sio_app

from pydantic import BaseModel
from typing import Union
import requests



app = FastAPI()
app.mount('/', app=sio_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
async def home():
    return {'message': 'Hello👋 Developers💻'}

PROJECT_ID = "5d498a31-cd23-42b7-b367-4fcc9463bd2f"
PRIVATE_KEY = "49a46286-91c3-4f9c-92bf-284ae51b7628"


class User(BaseModel):
    username: str
    secret: str
    email: Union[str, None] = None
    first_name: Union[str, None] = None
    last_name: Union[str, None] = None

# @app.post('/login/')
# async def root(user: User):
#     response = requests.get('https://api.chatengine.io/users/me/', 
#         headers={ 
#             "Project-ID": PROJECT_ID,
#             "User-Name": user.username,
#             "User-Secret": user.secret
#         }
#     )
#     return response.json()

# @app.post('/signup/')
# async def root(user: User):
#     response = requests.post('https://api.chatengine.io/users/', 
#         data={
#             "username": user.username,
#             "secret": user.secret,
#             "email": user.email,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#         },
#         headers={ "Private-Key": PRIVATE_KEY }
#     )
#     return response.json()






if __name__ == '__main__':
    uvicorn.run('main:app', reload=True)
