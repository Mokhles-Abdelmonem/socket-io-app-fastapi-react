import socketio
import re


room_number = 1
room_dict = {}


sio_server = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[]
)

sio_app = socketio.ASGIApp(
    socketio_server=sio_server,
    socketio_path='sockets'
)


@sio_server.event
async def connect(sid, environ, auth):
    global room_number
    global room_dict
    room = room_dict.get(str(room_number))
    
    if room :
        if len(room) == 1 :
            room.append(sid)
        room_number += 1
        playerXturn = True
    else :
        room_dict[str(room_number)] = [sid]
        playerXturn = False

    sio_server.enter_room(sid, str(room_number))
    await sio_server.emit('join', {'sid': sid, "room": str(room_number), "playerXturn": playerXturn}, str(room_number))
    


@sio_server.event
async def chat(sid, message):
    room = sio_server.rooms(sid)
    for number in room:
        contain_str = re.search('[a-zA-Z]', number)
        if not contain_str:
            room_number = number

    await sio_server.emit('chat', {'sid': sid, 'message': message}, str(room_number))


@sio_server.event
async def handelPlay(sid, nextHistory, currentMove):
    print(f'{sid}: Played')
    room = sio_server.rooms(sid)
    for number in room:
        contain_str = re.search('[a-zA-Z]', number)
        if not contain_str:
            room_number = number
    await sio_server.emit('handelPlay', {'sid': sid, "nextHistory": nextHistory, "currentMove": currentMove}, str(room_number))
