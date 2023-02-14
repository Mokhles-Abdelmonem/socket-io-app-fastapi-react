import socketio
import re


room_number = 1
room_dict = {}
players = []
messages = []
names_list = []
player = {}
history = {}

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
    pass





@sio_server.event
async def set_history(sid, localName, data):
    global history
    global player
    global names_list
    name_index = names_list.index(localName)
    player = players[name_index]
    room = player['room_number']
    history[room] = data
    return history



@sio_server.event
async def get_history(sid, localName):
    global history
    global player
    global names_list
    if localName:
        name_index = names_list.index(localName)
        player = players[name_index]
        room = player['room_number']
        room_history = history.get(room)
        lasthisory = room_history[-1]
        
        return lasthisory



@sio_server.event
async def add_user(sid, name):
    global players
    global names_list
    
    if name in names_list:
        name = name + '_' + sid
    names_list.append(name)
    players.append({
        "name": name,
        "sid" : sid,
        "in_room" : False,
        "room_number" : None,
        "side" : '',
        "status" : ''
    })
    sio_server.enter_room(sid, "general_room")
    await sio_server.emit('playerJoined', {'sid': sid, 'username': name, "players":players}, to='general_room')

    

@sio_server.event
async def get_players(sid, localName):
    global players
    global player
    global names_list
    if localName in names_list:
        name_index = names_list.index(localName)
        player = players[name_index]
        player['sid'] = sid
        if player['in_room']:
            sio_server.enter_room(sid, player['room_number'])
        players[name_index] = player

    return {"players": players, "player": player}

    

@sio_server.event
async def join_room(sid, playerx, playero):
    global room_number
    global names_list
    global players
    player_x_index = names_list.index(playerx)
    player_o_index = names_list.index(playero)
    player_x = players[player_x_index]
    player_o = players[player_o_index]

    sio_server.enter_room(player_x['sid'], str(room_number))
    sio_server.enter_room(player_o['sid'], str(room_number))

    sio_server.leave_room(player_x['sid'], 'general_room')
    sio_server.leave_room(player_o['sid'], 'general_room')
    

    player_x['in_room'] = True
    player_x['side'] = 'X'
    player_x['room_number'] = str(room_number)
    player_o['in_room'] = True
    player_o['side'] = 'O'
    player_o['room_number'] = str(room_number)
    players[player_x_index] = player_x
    players[player_o_index] = player_o
    player_o_sid = (player_o['sid'])
    room_number += 1
    await sio_server.emit('refresh', to=player_o_sid)
    await sio_server.emit('playersJoinedRoom', [player_x, player_o] , to='general_room')
    await sio_server.emit('playersJoinedRoom',[player_x, player_o] , str(room_number))
    return {"players": players, "player": player_x}
    

    




# @sio_server.event
# async def connectcopy(sid, environ, auth):
#     global room_number
#     global room_dict
#     room = room_dict.get(str(room_number))
    
#     if room :
#         if len(room) == 1 :
#             room.append(sid)
#         room_number += 1
#         playerXturn = True
#     else :
#         room_dict[str(room_number)] = [sid]
#         playerXturn = False

#     sio_server.enter_room(sid, str(room_number))
#     await sio_server.emit('join', {'sid': sid, "room": str(room_number), "playerXturn": playerXturn}, str(room_number))
    


@sio_server.event
async def chat(sid, localName, message):
    global messages
    name_index = names_list.index(localName)
    player = players[name_index]
    messages.append(
        {'sid': sid,
         'message': message,
         'player': player,
         'type': 'chat'
         }
    )
    await sio_server.emit('chat', messages, 'general_room')




@sio_server.event
async def chat_in_room(sid, localName, message):
    global messages
    name_index = names_list.index(localName)
    player = players[name_index]
    room = player['room_number']
    messages.append(
        {'sid': sid,
         'message': message,
         'player': player,
         'type': 'chat'
         }
    )
    await sio_server.emit('chat', messages, room)







@sio_server.event
async def handelPlay(sid, player, nextHistory, currentMove):
    room = player['room_number']
    print(f'{room}: room number')
    print(f'{player}: player')
    print(f'{sid}: sid')
    await sio_server.emit('handelPlay', {"nextHistory": nextHistory, "currentMove": currentMove}, to=room)


@sio_server.event
async def declare_winner(sid, winner):
    print(f'{sid}: declare_winner')
    room = sio_server.rooms(sid)
    for number in room:
        contain_str = re.search('[a-zA-Z]', number)
        if not contain_str:
            room_number = number
    await sio_server.emit('declareWinner', {'winner': winner, 'roomNumber':str(room_number)})
