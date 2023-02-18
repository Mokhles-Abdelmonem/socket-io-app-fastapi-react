import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sockets import sio_app, sio_server, players, names_list, room_dict

from pydantic import BaseModel
from typing import Union
import requests
import asyncio



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
        if player_room :
            player_list = room_dict.get(player_room)
            if player_list:
                for player_name in player_list:
                    if player_name != player['name']:
                        opponent = player_name
        player['opponent'] = opponent

        
        if room :
            await sio_server.emit('handleMove', {"move":int(move), "player":player}, to=player['sid'])
            return {"success": "successful move"}
        return {"error": "user not in any room"}
    return {"error": "user does not exist"}




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
