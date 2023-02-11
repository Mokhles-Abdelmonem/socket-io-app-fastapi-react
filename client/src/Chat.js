import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { Message } from './Message';

const socket = io(process.env.REACT_APP_API_URL, {
  path: process.env.REACT_APP_SOCKET_PATH,
});

export const Chat = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  useEffect(() => {
    var userName = prompt('inter your name:');
    console.log(userName);
    setUser(userName);
    socket.on('connect', () => {
      setIsConnected(socket.connected);
    });

    socket.on('disconnect', () => {
      setIsConnected(socket.connected);
    });

    socket.on('join', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'join', user:user}]);
    });
    socket.on('leaved', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'leaved', user:user}]);
      
    });
    socket.on('chat', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'chat' , user:user}]);
    });

  }, []);

  return (
    <>

      <input type={'text'}id='username'></input>
      <button
        onClick={() => {
          var userName = document.getElementById('username');
          setUser(userName);
        }}
      >
        submit
      </button>
        
      <h2>status: {isConnected ? 'connected' : 'disconnected'}</h2>
      <div
        style={{
          height: '500px',
          overflowY: 'scroll',
          border: 'solid black 1px',
          padding: '10px',
          marginTop: '15px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message, index) => (
          <Message message={message} key={index} />
        ))}
      </div>
      <input
        type={'text'}
        id='message'
        onChange={(event) => {
          const value = event.target.value.trim();
          setMessage(value);
        }}
      ></input>
      <button
        onClick={() => {
          if (message && message.length) {
            socket.emit('chat', message);
          }
          var messageBox = document.getElementById('message');
          messageBox.value = '';
          setMessage('');
        }}
      >
        Send
      </button>
      <br/>
      <br/>
      <button
        onClick={() => {
          socket.emit('leaved');
          console.log('leaved');

        }}
      >
        leave
      </button>
    </>
  );
};
