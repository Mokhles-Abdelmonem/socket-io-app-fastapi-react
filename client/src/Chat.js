import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { Message } from './Message';
import { Players } from './Players';

const socket = io(process.env.REACT_APP_API_URL, {
  path: process.env.REACT_APP_SOCKET_PATH,
});

export const Chat = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState({});
  const [username, setUsername] = useState('');
  const [timer, setTimer] = useState('');

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  
  
  const localName = localStorage.getItem('username');

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    socket.emit('set_history', localName, nextHistory);
    setHistory(nextHistory);
    const CMove = nextHistory.length - 1
    setCurrentMove(CMove);
    socket.emit('handelPlay', player, nextHistory, CMove);
  }
  const squares = currentSquares
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();

    
    if (xIsNext) {
      if (player.side === 'O') {
        return;
      }
      nextSquares[i] = 'X';
    } else {
      if (player.side === 'X') {
        return;
      }
      nextSquares[i] = 'O';
    }
    handlePlay(nextSquares);
    const winner = calculateWinner(nextSquares);
    if (winner === 'X') {
      socket.emit('declare_winner', player.name);
    }
    if (winner === 'O') {
      socket.emit('declare_winner', player.name);
    }
  }

  let status;
  const winner = calculateWinner(squares);
  if (winner) {
    status = 'Winner: ' + winner;
  } else { 
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }





  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(socket.connected);
    });

    socket.on('disconnect', () => {
      setIsConnected(socket.connected);
    });

    socket.on('playerJoined', (data) => {
      setUsername(data.username);
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'join'}]);
      socket.emit('get_players' ,(result) => {
        const playersList = result;
        if (playersList.length === 0) {
          localStorage.removeItem('username');
          setPlayers([]);
        }else{
          setPlayers(playersList);
        }

      });
    });


    socket.on('setTimer', (timer) => {
      setTimer(timer);
    });






    if (window.performance) {
      if (performance.navigation.type == 1) {
        socket.emit('update_player_session', localName,(result) => {
          const playersList = result.players;
          const currentPlayer = result.player;
          if (playersList.length === 0) {
            localStorage.removeItem('username');
            setPlayer({});
            setPlayers([]);
          }else{
            setPlayer(currentPlayer);
            setPlayers(playersList);
          }
        });
      } 
    }



    socket.emit('get_history', localName,(result) => {

      if (result){
        setHistory(Array(result));
      }
    });



    socket.on('playersJoinedRoom', (data) => {
        setMessages((prevMessages) => [...prevMessages, { ...data[0], type: 'joinedRoom'}]);
        setMessages((prevMessages) => [...prevMessages, { ...data[1], type: 'joinedRoom'}]);
    });

    socket.on('setPlayer', (data) => {
      setPlayer(data)
    });
    socket.on('setPlayers', (data) => {
      setPlayers(data)
    });
    socket.on('leaved', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'leaved'}]);
      
    });
    socket.on('chat', (messages) => {
      setMessages(messages);
    });

    socket.on('handelPlay', (data) => {

      setHistory(data.nextHistory);
      setCurrentMove(data.currentMove);
    });
        
    socket.on('declareWinner', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'winner'}]);
    });

  }, []);


  console.log("socket");
  console.log(socket.active);
  return (
    <>

      { !localName ? (
      <div>

      <br />
      <h2>
        Enter your username:
      </h2>
      <br />
      <input
              type={'text'}
              id='username'
      ></input>
      <button
        onClick={() => {
          const name = document.getElementById('username');
          localStorage.setItem('username', name.value);
          if (name.value && name.value.length) {
            socket.emit('add_user', name.value);
          } 
        }}
      >
        submit
      </button>
      </div>
      ):(
      <div>
          <h2>status: {isConnected ? 'connected' : 'disconnected'}</h2>
          <h1>Time:{timer}</h1>
          {player.in_room ?(
          <div>
          <button
            onClick={() => {
                  socket.emit('leave_room', localName, (result) => {
                    setPlayer(result.player);
                    setHistory([Array(9).fill(null)]);
                    setCurrentMove(0);

                  });
              }
            }
          >
            leave room
          </button>
          </div>
          ):(
          <div>
          <button
            onClick={() => {
                  socket.emit('leave_game', localName);
                  setPlayer({});
                  setHistory([Array(9).fill(null)]);
                  setCurrentMove(0);
                  localStorage.removeItem('username');
              }
            }
          >
            leave the game
          </button>
          </div>
          )}


          <div style={{display: 'flex', alignItems: 'center'}}>
              {!player.in_room ?(
                <div
                  style={{
                    height: '400px',
                    width: '25%',
                    overflowY: 'scroll',
                    border: 'solid black 1px',
                    padding: '10px',
                    marginTop: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  >
                    <ul>available players</ul>
                    {players.map((gamer, index) => (
                      <Players 
                      player={gamer} 
                      socket={socket} 
                      setPlayers={setPlayers} 
                      setPlayer={setPlayer}
                      key={index} />
                    ))}
                      
                  </div>
              ):
              (
                ''
              )}
              <div
                style={{
                  height: '400px',
                  width: '50%',
                  overflowY: 'scroll',
                  border: 'solid black 1px',
                  padding: '10px',
                  marginTop: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >

                <div>
                  {messages.map((message, index) => (
                    <Message message={message} key={index} />
                  ))}
                </div>
              </div>
              {
              player.in_room ?
              (
              <div
                style={{
                  height: '400px',
                  width: '50%',
                  overflowY: 'scroll',
                  border: 'solid black 1px',
                  padding: '10px',
                  marginTop: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
              <div className="game">
                <div className="game-board">
                  <div className="status">{status}</div>
                    <div className="board-row">
                      <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
                      <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
                      <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
                    </div>
                    <div className="board-row">
                      <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
                      <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
                      <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
                    </div>
                    <div className="board-row">
                      <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
                      <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
                      <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
                    </div>
                  </div>
                </div>

              </div>
              ) : (
              <div>

              </div>
              )
              }

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
                if (player.in_room) {
                  socket.emit('chat_in_room', localName, message);
                }else{
                socket.emit('chat', localName, message);
                }
              }
              var messageBox = document.getElementById('message');
              messageBox.value = '';
              setMessage('');
            }}
          >
            Send
          </button>
      </div>) }

    </>
  );
};

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}


// function Board({ xIsNext, squares, onPlay ,oplayerTurn, setWinner, winnerName, playerX, playerO}) {
//   function handleClick(i) {
//     if (calculateWinner(squares) || squares[i]) {
//       return;
//     }
//     const nextSquares = squares.slice();
//     if (xIsNext) {
//       if (oplayerTurn) {
//         return;
//       }
//       nextSquares[i] = 'X';
//     } else {
//       if (!oplayerTurn) {
//         return;
//       }
//       nextSquares[i] = 'O';
//     }
//     onPlay(nextSquares);
//   }

//   let status;
//   useEffect(() => {
//   const winner = calculateWinner(squares);
//   if (winner) {

//     // if (winner === 'X'){
//     //   socket.emit('declare_winner', playerX);
//     // }else{
//     //   socket.emit('declare_winner', playerO);
//     // }
//     status = 'Winner: ' + winner;
//   } else {
//     status = 'Next player: ' + (xIsNext ? 'X' : 'O');
//   }

//     {winner === 'X' ? setWinner(playerX) : setWinner(playerO)}

//   }, []);

//   return (
//     <>
//       <div className="status">{status}</div>
//       <div className="board-row">
//         <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
//         <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
//         <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
//       </div>
//       <div className="board-row">
//         <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
//         <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
//         <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
//       </div>
//       <div className="board-row">
//         <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
//         <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
//         <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
//       </div>
//     </>
//   );
// }



function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  console.log("squares");
  console.log(squares);
  if (squares){
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }}
  return null;
}
