import socketio
import re
import time
  
# define the countdown func.


room_number = 0
room_dict = {}
names_list = []
players = []
player = {}
messages = []
history = {}
clients = []
timer_switch = {}
sio_server = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[]
)

sio_app = socketio.ASGIApp(
    socketio_server=sio_server,
    socketio_path='sockets'
)



async def countdown(x_turn, playerx):
    print(x_turn)
    print(playerx)
    print("from countdown")

    t_x = 15
    while x_turn and t_x:
        mins, secs = divmod(t_x, 60)
        timer = '{:02d}:{:02d}'.format(mins, secs)
        await sio_server.emit('setTimer', timer, to=playerx)
        await sio_server.sleep(1)
        t_x -= 1

@sio_server.event
async def connect(sid, environ, auth):
    global clients
    clients.append(sid)


@sio_server.event
async def disconnect(sid):
    global clients
    clients.remove(sid)




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
    if localName in names_list:
        name_index = names_list.index(localName)
        player = players[name_index]
        room = player['room_number']
        room_history = history.get(room)
        if room_history:
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
async def update_player_session(sid, localName):
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
    pop_list = []
    for index, gamer in enumerate(players):
        if not gamer['sid'] in clients :
            pop_list.append(index)

    for index in pop_list:
        names_list.pop(index)
        players.pop(index)
        

    await sio_server.emit('setPlayers', players)
    return {"players": players, "player": player}






@sio_server.event
async def check_player(sid, targetPlayer):
    global players
    global player
    global names_list
    global clients
    name_index = names_list.index(targetPlayer)
    player = players[name_index]
    if not player['sid'] in clients:
        names_list.pop(name_index)
        players.pop(name_index)
        await sio_server.emit('setPlayers', players)
        return False
    return True

import asyncio


@sio_server.event
async def run_x_timer(sid, room, playerx, playero):
    global timer_switch
    x_turn = timer_switch[room]
    t_x = 15
    t_o = 15
    print("from timer switch")
    print(timer_switch)
    print("from timer switch")
    sio_server.start_background_task(countdown,x_turn, playerx)

@sio_server.event
async def set_x_turn(sid, room):
    global timer_switch
    timer_switch[room] = True

@sio_server.event
async def set_O_turn(sid, room):
    global timer_switch
    timer_switch[room] = False







@sio_server.event
async def get_players(sid):
    global players
    return players



    

@sio_server.event
async def join_room(sid, playerx, playero):
    global room_number
    room_number += 1
    global clients
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
    player_o_sid = player_o['sid']

    await sio_server.emit('setPlayer', player_o ,  to=player_o_sid)
    await sio_server.emit('setPlayers', players)
    await sio_server.emit('playersJoinedRoomToAll', [player_x, player_o])
    await sio_server.emit('playersJoinedRoom',[player_x, player_o] , str(room_number))
    return [player_x, player_o]


    




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
    global names_list
    global players
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
async def leave_room(sid, localName):
    global names_list
    global players
    global room_number
    name_index = names_list.index(localName)
    player = players[name_index]
    room = player['room_number']
    sid = player['sid']
    sio_server.leave_room(sid, room)
    sio_server.enter_room(sid, 'general_room')
    player['in_room'] = False
    player['side'] = ''
    player['room_number'] = None
    players[name_index] = player

    await sio_server.emit('setPlayers', players)
    return {"player": player, "history":[None for i in range(9)]}


@sio_server.event
async def leave_game(sid, localName):
    global names_list
    global players
    global room_number
    name_index = names_list.index(localName)
    names_list.pop(name_index)
    players.pop(name_index)
    await sio_server.emit('setPlayers', players)





@sio_server.event
async def handelPlay(sid, player, nextHistory, currentMove):
    room = player['room_number']
    await sio_server.emit('handelPlay', {"nextHistory": nextHistory, "currentMove": currentMove}, to=room)


@sio_server.event
async def declare_winner(sid, winner):
    room = sio_server.rooms(sid)
    for number in room:
        contain_str = re.search('[a-zA-Z]', number)
        if not contain_str:
            room_number = number
    await sio_server.emit('declareWinner', {'winner': winner, 'roomNumber':str(room_number)})
