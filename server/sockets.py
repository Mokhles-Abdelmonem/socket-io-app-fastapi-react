import socketio
import re
import time
  
# define the countdown func.
from utiles import get_current_active_user, User , Depends, AuthJWT, users_collection

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



async def countdown_x(player_name, room, opponent_name):
    global players
    global names_list
    global timer_switch
    timer_switch[room][2] = True

    x_time = timer_switch[room][0]
    x_turn = timer_switch[room][2]
    player_won = timer_switch[room][3]
    while x_turn and x_time >= 0 and not player_won:
        x_time = timer_switch[room][0]
        name_index = names_list.index(opponent_name)
        opponent = players[name_index]
        name_index = names_list.index(player_name)
        player = players[name_index]
        mins, secs = divmod(x_time, 60)
        timer = '{:02d}:{:02d}'.format(mins, secs)
        await sio_server.emit('setTimer', timer, to=opponent['sid'])
        await sio_server.sleep(1)
        x_time -= 1
        if x_time < 0:
            await sio_server.emit('TimeOut', to=room)
            await sio_server.emit('playerWon', player['name'], to=player['sid'])
        timer_switch[room][0] = x_time
        x_turn = timer_switch[room][2]
        player_won = timer_switch[room][3]




async def countdown_o(player_name, room, opponent_name):
    global timer_switch
    timer_switch[room][2] = False
    o_time = timer_switch[room][1]
    x_turn = timer_switch[room][2]
    player_won = timer_switch[room][3]
    while not x_turn and o_time >= 0 and not player_won:
        o_time = timer_switch[room][1]
        name_index = names_list.index(opponent_name)
        opponent = players[name_index]
        name_index = names_list.index(player_name)
        player = players[name_index]
        mins, secs = divmod(o_time, 60)
        timer = '{:02d}:{:02d}'.format(mins, secs)
        await sio_server.emit('setTimer', timer, to=opponent['sid'])
        await sio_server.sleep(1)
        o_time -= 1
        if o_time < 0:
            await sio_server.emit('TimeOut', to=room)
            await sio_server.emit('playerWon', player['name'],  to=player['sid'])
        timer_switch[room][1] = o_time
        x_turn = timer_switch[room][2]
        player_won = timer_switch[room][3]
        







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
    global players
    global names_list
    name_index = names_list.index(localName)
    player = players[name_index]
    room = player['room_number']
    history[room] = data
    return history



@sio_server.event
async def get_history(sid, localName):
    global history
    global players
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
async def add_user(sid, user):
    global players
    global names_list
    name = user['username']
    user['joined'] = True
    names_list.append(name)
    players.append({
        "username": name,
        "sid" : sid,
        "joined" : True,
        "in_room" : False,
        "room_number" : None,
        "side" : '',
        "status" : ''
    })

    users_collection.update_one({"username" : name}, {"$set" : {"joined" : True}})
    sio_server.enter_room(sid, "general_room")
    await sio_server.emit('playerJoined', {'sid': sid, 'username': name, "players":players,} , to="general_room")
    return user
    

@sio_server.event
async def update_player_session(sid, localName):
    global players
    global names_list
    global room_dict
    opponent = None
    player = {}

    if localName in names_list:
        name_index = names_list.index(localName)
        player = players[name_index]
        player['sid'] = sid
        if player['in_room']:
            sio_server.enter_room(sid, player['room_number'])
        else:
            sio_server.enter_room(sid,"general_room")
        players[name_index] = player
        player_room = player.get('room_number')
        if player_room :
            player_list = room_dict.get(player_room)
            if player_list:
                for player_name in player_list:
                    if player_name != localName:
                        opponent = player_name
    else:
        users_collection.update_one({"username" : localName}, {"$set" : {"joined" : False}})

    pop_list = []
    for index, gamer in enumerate(players):
        if not gamer['sid'] in clients :
            pop_list.append(index)

    for index in pop_list:
        names_list.pop(index)
        players.pop(index)
    await sio_server.emit('setPlayers', players)
    return {"player": player, "opponent": opponent}






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
async def switch_timer(sid, room, player_name, opponent_name, side):
    if side == 'X':
        sio_server.start_background_task(countdown_x, player_name, room, opponent_name)
    elif side == 'O':
        sio_server.start_background_task(countdown_o, player_name, room, opponent_name)

@sio_server.event
async def set_timer(sid, room, player_name):
    global timer_switch
    timer_switch[room] = [15,15,True,False]
    sio_server.start_background_task(countdown_x, player_name, room, player_name)


@sio_server.event
async def stop_time(sid, room, opponent_name):
    global players
    global names_list
    name_index = names_list.index(opponent_name)
    player = players[name_index]
    global timer_switch
    timer_switch[room][3] = True
    await sio_server.emit('stopTimer', to=room)



@sio_server.event
async def game_request(sid,  player_x_name, player_o_name):
    global players
    global names_list
    name_index = names_list.index(player_o_name)
    player_o = players[name_index]
    await sio_server.emit('gameRequest', {"player_x_name":player_x_name, "player_o_name":player_o_name}, to=player_o["sid"])

@sio_server.event
async def decline_request(sid,  player_x_name):
    global players
    global names_list
    name_index = names_list.index(player_x_name)
    player_x = players[name_index]
    await sio_server.emit('requestDeclined', to=player_x["sid"])



@sio_server.event
async def cancel_request(sid,  player_o_name):
    global players
    global names_list
    name_index = names_list.index(player_o_name)
    player_o = players[name_index]
    await sio_server.emit('requestCanceled', to=player_o["sid"])





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
    global room_dict
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
    player_x_sid = player_x['sid']
    room_dict[str(room_number)] = [playerx, playero]
    await sio_server.emit('setPlayer', {"player":player_x, "opponent":player_o['name']} ,  to=player_x_sid)
    await sio_server.emit('setPlayers', players)
    await sio_server.emit('playersJoinedRoomToAll', [player_x, player_o])
    await sio_server.emit('playersJoinedRoom',[player_x, player_o] , str(room_number))
    return [player_x, player_o]

   


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
async def leave_game(sid, user):
    global names_list
    global players
    global room_number
    name = user['username']
    name_index = names_list.index(name)
    names_list.pop(name_index)
    players.pop(name_index)
    users_collection.update_one({"username" : name}, {"$set" : {"joined" : False}})
    await sio_server.emit('setPlayers', players)
    user['joined'] = False
    return user




@sio_server.event
async def handelPlay(sid, room, nextHistory, currentMove):
    await sio_server.emit('handelPlay', {"nextHistory": nextHistory, "currentMove": currentMove}, to=room)


@sio_server.event
async def declare_winner(sid, winner):
    room = sio_server.rooms(sid)
    for number in room:
        contain_str = re.search('[a-zA-Z]', number)
        if not contain_str:
            room_number = number
    await sio_server.emit('declareWinner', {'winner': winner, 'roomNumber':str(room_number)})



@sio_server.event
async def rematch_game(sid, player_name):
    global players
    global names_list
    name_index = names_list.index(player_name)
    player = players[name_index]
    room = player['room_number']
    global timer_switch
    timer_switch[room] = [15,15,True,False]
    sio_server.start_background_task(countdown_x, player_name, room, player_name)

    await sio_server.emit('rematchGame', to=room)