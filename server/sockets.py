import socketio
import re
import time
  
# define the countdown func.
from utiles import get_current_active_user, User , Depends, AuthJWT, users_collection, role_collection, retrieve_roles

room_number = 0
room_dict = {}
names_list = []
players = []
player = {}
messages = []
messages_dict = {}
history = {}
clients = []
timer_switch = {}
role_dict = {}



sio_server = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[]
)

sio_app = socketio.ASGIApp(
    socketio_server=sio_server,
    socketio_path='sockets'
)



async def countdown_x(player_name, room, opponent_name , player_who_clicked ):
    global players
    global names_list
    global timer_switch
    global clients

    timer_switch[room][2] = True
    x_time = timer_switch[room][0]
    x_turn = timer_switch[room][2]
    player_won = timer_switch[room][3]
    while x_turn and x_time >= 0 and not player_won:
        await sio_server.sleep(1)
        if opponent_name in names_list:
            opponent_index = names_list.index(opponent_name)
            opponent = players[opponent_index]
            name_index = names_list.index(player_name)
            player = players[name_index]
            mins, secs = divmod(x_time, 60)
            timer = '{:02d}:{:02d}'.format(mins, secs)
            if player_who_clicked == "X":
                player_x = player 
                player_o = opponent 
            elif player_who_clicked == "O":
                player_x = opponent
                player_o = player
            await sio_server.emit('setTimer', timer, to=player_x['sid'])
            x_time -= 1
            if x_time < 0:
                await sio_server.emit('TimeOut', to=room)
                await sio_server.emit('playerWon', {"player_name":player_o['username'], "opponent_name":player_x['username']}, to=player_o['room_number'])
            x_turn = timer_switch[room][2]
            player_won = timer_switch[room][3]
        else:
            x_turn = False





async def countdown_o(player_name, room, opponent_name):
    global timer_switch
    timer_switch[room][2] = False
    o_time = timer_switch[room][1]
    x_turn = timer_switch[room][2]
    player_won = timer_switch[room][3]
    while not x_turn and o_time >= 0 and not player_won:
        await sio_server.sleep(1)
        if opponent_name in names_list:
            name_index = names_list.index(opponent_name)
            opponent = players[name_index]
            mins, secs = divmod(o_time, 60)
            timer = '{:02d}:{:02d}'.format(mins, secs)
            await sio_server.emit('setTimer', timer, to=opponent['sid'])
            o_time -= 1
            if o_time < 0:
                name_index = names_list.index(player_name)
                player = players[name_index]
                await sio_server.emit('TimeOut', to=room)
                await sio_server.emit('playerWon', {"player_name":player_name, "opponent_name":opponent_name}, to=player['room_number'])
            x_turn = timer_switch[room][2]
            player_won = timer_switch[room][3]
        else:
            x_turn = False
        

def get_user_db(username):
    user = users_collection.find_one({"username":username})
    return user

def get_player(player_name):
    global players
    global names_list
    if player_name in names_list:
        name_index = names_list.index(player_name)
        return players[name_index]
    return False




async def countdown_disconnected_user(user):
    global players
    global names_list
    time = 15
    connected = False
    opponent_name = ''
    username = user["username"]
    player_room = user["room_number"]
    player_list = room_dict.get(player_room)
    if player_list:
        for player_name in player_list:
            if player_name != username:
                opponent_name = player_name

    while time and not connected:
        await sio_server.sleep(1)
        time -= 1
        player = get_player(username)
        opponent = get_player(opponent_name)
        if time == 0:        
            if player_list:
                if not opponent['player_draw'] and not opponent['player_lost'] and not opponent['player_won']:
                    await sio_server.emit('declareWinner', {'winner': opponent_name, 'roomNumber':opponent["room_number"]})
                    await sio_server.emit('noteOpponentWon', to=opponent['sid'])
                    await sio_server.emit('congrateWinner', opponent, to=opponent['sid'])
            await sio_server.emit('setDisconnectedPlayer', username, to=opponent['sid'])
            await sio_server.emit('notePlayerLeft', to=opponent['sid'])
        player = await users_collection.find_one({"username":username})
        connected = player['connected']




@sio_server.event
async def set_disconnected_player(sid, player_name):
    player_obj = {
        "joined" : False,
        "in_room" : False,
        "room_number" : None,
        "player_won" : False,
        "player_lost" : False,
        "player_draw" : False,
        "side" : '',
        "status" : '',
    }
    users_collection.update_one({"username" : player_name}, {"$set" : player_obj})





@sio_server.event
async def connect(sid, environ, auth):
    global clients
    clients.append(sid)
    global players
    if auth:
        Authorize = AuthJWT()
        user_auth = Authorize._verified_token(auth) 
        username = user_auth['sub']
        users_collection.update_one({"username" : username}, {"$set" : {"connected":True}})


@sio_server.event
async def disconnect(sid):
    global clients
    clients.remove(sid)
    global players
    user = await users_collection.find_one({"sid":sid})
    if user:
        user['connected'] = False
        users_collection.update_one({"username" : user["username"]}, {"$set" : {"connected":False}})
        sio_server.start_background_task(countdown_disconnected_user, user )




@sio_server.event
async def set_history(sid, localName,  nextHistory, CMove):
    global history
    global players
    global names_list
    name_index = names_list.index(localName)
    player = players[name_index]
    room = player['room_number']
    history[room] = [nextHistory, CMove]



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
            nextHistory = room_history[0]
            CMove = room_history[1]
            return [nextHistory, CMove]


@sio_server.event
async def get_messages(sid, localName):
    global messages 
    return messages

async def switch_timer_back(player, opponent_name, side):
    if side == 'O':
        sio_server.start_background_task(countdown_x, player["username"], player["room_number"], opponent_name, "O")
    elif side == 'X':
        sio_server.start_background_task(countdown_o, player["username"], player["room_number"], opponent_name)



async def stop_time_back(room):
    global timer_switch
    timer_switch[room][3] = True
    await sio_server.emit('stopTimer', to=room)


async def declare_winner_back(sid, winner, opponent_name):
    global players
    global names_list
    global role_dict
    name_index = names_list.index(winner['username'])
    opponent_index = names_list.index(opponent_name)
    player = players[name_index]
    opponent = players[opponent_index]
    room = sio_server.rooms(sid)
    for number in room:
        contain_str = re.search('[a-zA-Z]', number)
        if not contain_str:
            room_number = number
    win_number = player.get('win_number')
    role = role_dict.get(player['room_number'])
    if win_number:
        player['win_number'] += 1
        player['level'] = int(player['win_number'] / role) + 1
    else:
        player['win_number'] = 1
        player['level'] = 1
    player['player_won'] = True
    opponent['player_lost'] = True
    players[name_index] = player
    players[opponent_index] = opponent
    users_collection.update_one({"username" : winner}, {"$set" : player})
    users_collection.update_one({"username" : opponent_name}, {"$set" : opponent})
    await sio_server.emit('declareWinner', {'winner': winner, 'roomNumber':str(room_number)})
    await sio_server.emit('congrateWinner', player, to=player['sid'])
    await sio_server.emit('noteOpponent', opponent , to=opponent['sid'])




from calculation import calculate_winner, player_turn
@sio_server.event
async def handle_click(sid, i , player, opponent_name):
    global history
    global timer_switch
    room = player['room_number']
    player_time = timer_switch[room][0] if player["side"] == "X" else timer_switch[room][0]
    room_history = history.get(room)
    if not room_history:
        history[room]= [None for _ in range(9)]
        room_history = history.get(room)
    winning_number_role = role_dict[room]
    role_obj = await role_collection.find_one({"winning_number": winning_number_role})
    winner = calculate_winner(room_history, role_obj["roles"])
    side_turn = player_turn(room_history)
    if winner or room_history[i] or not player_time or player["side"] != side_turn :
        return
    await switch_timer_back(player, opponent_name, side_turn)
    room_history[i] = player['side']
    winner = calculate_winner(room_history, role_obj["roles"])
    if winner == 'tie':
        await stop_time_back(room)
        await sio_server.emit('declareDraw', to=room)
    elif winner :
        await stop_time_back(room)
        await declare_winner_back(sid, player, opponent_name)


    history[room]= room_history
    await sio_server.emit('setBoard', room_history , to=room)



@sio_server.event
async def add_user(sid, user):
    global players
    global names_list
    player_obj = {
        "sid" : sid,
        "joined" : True,
        "in_room" : False,
        "room_number" : None,
        "player_won" : False,
        "player_lost" : False,
        "player_draw" : False,
        "side" : '',
        "status" : ''
    }
    user.update(player_obj)
    name = user['username']
    names_list.append(name)
    players.append(user)

    users_collection.update_one({"username" : name}, {"$set" : player_obj})
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
        users_collection.update_one({"username" : localName}, {"$set" : player})
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
    return {"player": player, "players": players, "opponent": opponent}



@sio_server.event
async def get_opponent(sid, player_name):
    global players
    global names_list
    global room_dict
    opponent = None
    player = {}
    name_index = names_list.index(player_name)
    player = players[name_index]
    room = player['room_number']
    players_list = room_dict.get(room)

    if players_list:
        for opponent_name in players_list:
            if player_name != opponent_name:
                opponent = opponent_name

    return opponent




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


@sio_server.event
async def switch_timer(sid, room, player_name, opponent_name, side):
    if side == 'X':
        sio_server.start_background_task(countdown_x, player_name, room, opponent_name, "O")
    elif side == 'O':
        sio_server.start_background_task(countdown_o, player_name, room, opponent_name)

@sio_server.event
async def set_timer(sid, room, player_name, opponent_name):
    global timer_switch
    timer_switch[room] = [15,15,True,False]
    sio_server.start_background_task(countdown_x, player_name, room, opponent_name, "X")


@sio_server.event
async def stop_time(sid, room, opponent_name):
    global timer_switch
    timer_switch[room][3] = True
    await sio_server.emit('stopTimer', to=room)



@sio_server.event
async def game_request(sid,  player_x_name, player_o_name, role):
    global players
    global names_list
    name_index = names_list.index(player_o_name)
    player_o = players[name_index]
    await sio_server.emit('gameRequest', {"player_x_name":player_x_name, "player_o_name":player_o_name, "role":role}, to=player_o["sid"])
    # await sio_server.emit('requestWainting', player_o_name , to=sid)
    return player_o_name
@sio_server.event
async def decline_request(sid,  player_x_name):
    global players
    global names_list
    if player_x_name in names_list:
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
async def join_room(sid, playerx, playero, role=3):
    global room_number
    room_number += 1
    global names_list
    global players
    global room_dict
    global role_dict
    global history

    player_x_index = names_list.index(playerx)
    player_o_index = names_list.index(playero)
    player_x = players[player_x_index]
    player_o = players[player_o_index]
    sio_server.enter_room(player_x['sid'], str(room_number))
    sio_server.enter_room(player_o['sid'], str(room_number))

    sio_server.leave_room(player_x['sid'], 'general_room')
    sio_server.leave_room(player_o['sid'], 'general_room')

    player_x['player_won'] = False
    player_x['player_lost'] = False
    player_x['player_draw'] = False
    player_x['in_room'] = True
    player_x['side'] = 'X'
    player_x['room_number'] = str(room_number)

    player_o['player_won'] = False
    player_o['player_lost'] = False
    player_o['player_draw'] = False
    player_o['in_room'] = True
    player_o['side'] = 'O'
    player_o['room_number'] = str(room_number)
    players[player_x_index] = player_x
    players[player_o_index] = player_o
    player_x_sid = player_x['sid']
    room_dict[str(room_number)] = [playerx, playero]
    role_dict[str(room_number)] = role
    history [str(room_number)] = [None for i in range(9)]
    await sio_server.emit('setPlayer', {"player":player_x, "opponent":player_o['username']} ,  to=player_x_sid)
    await sio_server.emit('setPlayers', players)
    await sio_server.emit('playersJoinedRoom',[player_x, player_o] , str(room_number))
    await sio_server.emit('pushToRoom', to=str(room_number))
    return [player_x, player_o]

   


@sio_server.event
async def chat(sid, localName, message):
    global messages
    global names_list
    global players
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
async def get_roles(sid):
    roles = await retrieve_roles()
    return roles





@sio_server.event
async def chat_in_room(sid, localName, message):
    global messages_dict
    global names_list
    global players
    name_index = names_list.index(localName)
    player = players[name_index]
    room = player['room_number']
    message = {
        'sid': sid,
        'message': message,
        'player': player,
        'type': 'chat'
        }
    messages_in_room = messages_dict.get(room)
    if messages_in_room:
        messages_in_room.append(message)
    else :
        messages_in_room = [message]
    messages_dict[room] = messages_in_room
    await sio_server.emit('chatInRoom', messages_in_room, room)


@sio_server.event
async def get_chat_messages(sid, localName):
    global messages_dict
    global names_list
    global players
    name_index = names_list.index(localName)
    player = players[name_index]
    room = player['room_number']
    messages_in_room = messages_dict.get(room)
    return messages_in_room



@sio_server.event
async def leave_room(sid, user):
    global names_list
    global players
    global room_number
    username = user['username']
    name_index = names_list.index(username)
    player = players[name_index]
    room = player['room_number']
    sid = player['sid']
    sio_server.leave_room(sid, room)
    sio_server.enter_room(sid, 'general_room')
    player['in_room'] = False
    player['side'] = ''
    player['room_number'] = None
    player['player_won'] = False
    player['player_lost'] = False
    player['player_draw'] = False
    player['level'] = 1
    player['win_number'] = 1
    players[name_index] = player
    users_collection.update_one({"username" : username}, {"$set" : player})
    await sio_server.emit('setPlayers', players)
    return {"player": player}



@sio_server.event
async def player_left_in_game(sid, opponent_name):
    global names_list
    global players
    global room_number
    global timer_switch
    name_index = names_list.index(opponent_name)
    player = players[name_index]
    win_number = player.get('win_number')
    room = player['room_number']
    role = role_dict.get(room)
    if win_number:
        player['win_number'] += 1
        player['level'] = int(player['win_number'] / role) + 1
    else:
        player['win_number'] = 1
        player['level'] = 1
    player['player_won'] = True
    room_in_timer = timer_switch.get(room)
    if room_in_timer:
        room_in_timer[3] = True
    users_collection.update_one({"username" : opponent_name}, {"$set" : player})
    await sio_server.emit('declareWinner', {'winner': opponent_name, 'roomNumber':room})
    await sio_server.emit('congrateWinner', player, to=player['sid'])
    await sio_server.emit('noteOpponentWon', to=player['sid'])



@sio_server.event
async def player_left_room(sid, opponent_name):
    global names_list
    global players
    global room_number
    name_index = names_list.index(opponent_name)
    opponent = players[name_index]
    players[name_index] = opponent
    await sio_server.emit('notePlayerLeft', to=opponent['sid'])


@sio_server.event
async def player_logged_out(sid, user):
    global names_list
    global players
    global room_number
    username = user['username']
    if username in names_list:
        name_index = names_list.index(username)
        player = players[name_index]
        room = player['room_number']
        sid = player['sid']
        sio_server.leave_room(sid, room)
        player['joined'] = False
        player['in_room'] = False
        player['side'] = ''
        player['room_number'] = None
        player['player_won'] = False
        player['player_lost'] = False
        player['player_draw'] = False
        player['level'] = 1
        player['win_number'] = 1
        users_collection.update_one({"username" : username}, {"$set" : player})
        names_list.pop(name_index)
        players.pop(name_index)
        await sio_server.emit('setPlayers', players)
        return {"player": player}
    return {"player": None}


@sio_server.event
async def leave_other_player(sid, player_name):
    global names_list
    global players
    global room_number
    name_index = names_list.index(player_name)
    player = players[name_index]
    room = player['room_number']
    sio_server.leave_room(player["sid"], room)
    sio_server.enter_room(player["sid"], 'general_room')
    player['in_room'] = False
    player['side'] = ''
    player['room_number'] = None
    player['player_won'] = False
    player['player_lost'] = False
    player['player_draw'] = False
    player['level'] = 1
    player['win_number'] = 1
    players[name_index] = player
    room_dict.pop(room)
    users_collection.update_one({"username" : player_name}, {"$set" : player})
    await sio_server.emit('setPlayers', players)
    return player


@sio_server.event
async def set_players(sid, players):
    await sio_server.emit('setPlayers', players)

@sio_server.event
async def leave_game(sid, user):
    global names_list
    global players
    global room_number
    name = user['username']
    if name in names_list:
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
async def declare_winner(sid, winner, opponent_name):
    global players
    global names_list
    global role_dict
    name_index = names_list.index(winner)
    opponent_index = names_list.index(opponent_name)
    player = players[name_index]
    opponent = players[opponent_index]
    room = sio_server.rooms(sid)
    for number in room:
        contain_str = re.search('[a-zA-Z]', number)
        if not contain_str:
            room_number = number
    win_number = player.get('win_number')
    role = role_dict.get(player['room_number'])
    if win_number:
        player['win_number'] += 1
        player['level'] = int(player['win_number'] / role) + 1
    else:
        player['win_number'] = 1
        player['level'] = 1
    player['player_won'] = True
    opponent['player_lost'] = True
    players[name_index] = player
    players[opponent_index] = opponent
    users_collection.update_one({"username" : winner}, {"$set" : player})
    users_collection.update_one({"username" : opponent_name}, {"$set" : opponent})
    await sio_server.emit('declareWinner', {'winner': winner, 'roomNumber':str(room_number)})
    await sio_server.emit('congrateWinner', player, to=player['sid'])
    await sio_server.emit('noteOpponent', opponent , to=opponent['sid'])


@sio_server.event
async def declare_draw(sid, player_name):
    global players
    global names_list
    name_index = names_list.index(player_name)
    player = players[name_index]
    await sio_server.emit('declareDraw', to=player['room_number'])

@sio_server.event
async def get_user_level(sid, player_name):
    global players
    global names_list
    name_index = names_list.index(player_name)
    player = players[name_index]
    return player['level']


@sio_server.event
async def get_user(sid):
    user = users_collection.find_one({"sid":sid})
    return user

@sio_server.event
async def set_player_draw(sid, username):
    global players
    global names_list
    name_index = names_list.index(username)
    player = players[name_index]
    player['player_draw'] = True
    players[name_index] = player
    users_collection.update_one({"username" : username}, {"$set" : {"player_draw":True}})
    await sio_server.emit('setPlayers', players)





@sio_server.event
async def rematch_game(sid, player_name, opponent_name):
    global players
    global names_list
    global timer_switch
    global history
    name_index = names_list.index(player_name)
    player = players[name_index]
    opponent_index = names_list.index(opponent_name)
    opponent = players[opponent_index]
    player['player_lost'] = False
    player['player_won'] = False
    player['player_draw'] = False
    opponent['player_won'] = False
    opponent['player_lost'] = False
    opponent['player_draw'] = False
    room = player['room_number']
    timer_switch[room] = [15,15,True,False]

    users_collection.update_one({"username" : player['username']}, {"$set" : player})
    users_collection.update_one({"username" : opponent['username']}, {"$set" : opponent})
    room_history = history.get(room)
    if room_history:
        history.update({room: list(None for _ in range(9))})

    sio_server.start_background_task(countdown_x, player_name, room, opponent_name, player['side'])

    await sio_server.emit('rematchGame', to=room)