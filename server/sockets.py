import socketio

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
    print(f'{sid}: connected')
    await sio_server.emit('join', {'sid': sid})


@sio_server.event
async def chat(sid, message):
    print(f'{message}: message')
    await sio_server.emit('chat', {'sid': sid, 'message': message})


@sio_server.event
async def leaved(sid):
    print(f'{sid}: disconnect -------------- disconnect')
    await sio_server.emit('leaved', {'sid': sid})
