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
  const [thewinner, setthewinner] = useState('');
  const [playerXturn, setplayerXturn] = useState(false);
  const [playerX, setplayerX] = useState('');
  const [playerO, setplayerO] = useState('');
  const oplayerTurn = !playerXturn


  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    const CMove = nextHistory.length - 1
    setCurrentMove(CMove);
    socket.emit('handelPlay', nextHistory, CMove);
  }
  const squares = currentSquares
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      if (oplayerTurn) {
        return;
      }
      nextSquares[i] = 'X';
    } else {
      if (!oplayerTurn) {
        return;
      }
      nextSquares[i] = 'O';
    }
    handlePlay(nextSquares);
    const winner = calculateWinner(nextSquares);
    if (winner === 'X') {
      socket.emit('declare_winner', playerX);
    }
    if (winner === 'O') {
      socket.emit('declare_winner', playerO);
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

    socket.on('join', (data) => {
      if (data.playerXturn){
        setplayerXturn(data.playerXturn);
        setplayerX(data.sid);
      }else{
        setplayerO(data.sid);
      }

      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'join'}]);
    });
    socket.on('leaved', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'leaved'}]);
      
    });
    socket.on('chat', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'chat'}]);
    });

    socket.on('handelPlay', (data) => {
      setHistory(data.nextHistory);
      setCurrentMove(data.currentMove);
    });
        
    socket.on('declareWinner', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'winner'}]);
    });

  }, []);

  return (
    <>
        
      <h2>status: {isConnected ? 'connected' : 'disconnected'}</h2>
      <div style={{display: 'flex', alignItems: 'center'}}>
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
            {messages.map((message, index) => (
              <Message message={message} key={index} />
            ))}
          </div>
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
//   console.log("winner______________");
//   console.log(winner);
//   console.log(playerX);
//   console.log(playerO);
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
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
