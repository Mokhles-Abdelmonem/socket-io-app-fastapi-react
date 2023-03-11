
num = 0
if num :
    print("Number is zero")
else:
    print(0%2)


# @app.get("/move/{user}/{move}")
# async def set_move(user, move):
#     if user in names_list:
#         name_index = names_list.index(user)
#         player = players[name_index]
#         room = player.get('room_number')
#         player_room = player.get('room_number')
#         opponent = None
#         lasthisory = []
#         if player_room :
#             player_list = room_dict.get(player_room)
#             room_history = history.get(room)
#             if room_history:
#                 lasthisory = room_history[-1]
#             if player_list:
#                 for player_name in player_list:
#                     if player_name != player['name']:
#                         opponent = player_name
#         player['room_hestory'] = lasthisory
#         player['opponent'] = opponent

        
#         if room :
#             await sio_server.emit('handleMove', {"move":int(move), "player":player}, to=player['sid'])
#             return {"success": "successful move"}
#         return {"error": "user not in any room"}
#     return {"error": "user does not exist"}

