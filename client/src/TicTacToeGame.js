import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SnackbarContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import PLayersDrawer from './components/settingSectoins/Drawer';
import { io } from 'socket.io-client';
import { Message } from './components/socket/Message';
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import useWindowSize from "@rooks/use-window-size"
import Confetti from 'react-confetti'
import { confirmAlert } from 'react-confirm-alert';





import {
  LOAD_USER_SUCCESS,
} from './api/types';
import Board from './components/socket/Board';
import Chat from './components/socket/Chat';



const socket = io(process.env.REACT_APP_API_URL, {
  path: process.env.REACT_APP_SOCKET_PATH,
});


export default function Game() {
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [opponentName, setOpponentName] = useState('');
  const [timer, setTimer] = useState('');
  const [timeOut, setTimeOut] = useState(false);
  
  const [playerWon, setPlayerWon] = useState(false);
  const [board, setBoard] = useState([Array(9).fill(null)]);

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];


  const user = useSelector(state => state.auth.user);
  const gamer = user
  let browserHistory = useHistory();
  const dispatch = useDispatch();
  const { innerWidth, innerHeight, outerHeight, outerWidth } = useWindowSize();

  const leaveAction  = () => {
      if (user) {
        socket.emit('leave_room', user, (result) => {
          dispatch({
            type: LOAD_USER_SUCCESS,
            payload: {user: result.player}
          });
          browserHistory.push('/dashboard');
        });
    }
  }


  
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const CMove = nextHistory.length - 1
    socket.emit('set_history', user.username, nextHistory, CMove);
    console.log("nextHistory")
    console.log(nextHistory)
    setHistory(nextHistory);
    setCurrentMove(CMove);
    socket.emit('handelPlay', user.room_number, nextHistory, CMove);
  }
  const squares = currentSquares
  function handleClick(i, apiPlayer=false) {

    var roomHistory = apiPlayer ? apiPlayer.room_hestory : [] ;
    var apiSquares = apiPlayer? roomHistory[currentMove] : squares;

    
    if (calculateWinner(apiSquares) || apiSquares[i] || timeOut ) {
      return;
    }
    const nextSquares = apiSquares.slice();
    // console.log("WORK AFTER HANDELL CLICK");


    var gamer = apiPlayer ? apiPlayer : user ;
    var opponent = apiPlayer ? apiPlayer.opponent : opponentName ;

    // console.log("xIsNext", xIsNext);
    // console.log("gamer.side", gamer.side);


    if (xIsNext) {
      if (gamer.side === 'O') {
        return;
      }
      nextSquares[i] = 'X';
      socket.emit('switch_timer', gamer.room_number, gamer.username, opponent, 'O')
    } else {
      if (gamer.side === 'X') {
        return;
      }
      nextSquares[i] = 'O';
      socket.emit('switch_timer', gamer.room_number, gamer.username, opponent, 'X')
    }
    handlePlay(nextSquares);
    const winner = calculateWinner(nextSquares);
    if (winner === 'X') {
      socket.emit('declare_winner', gamer.username, opponent);
      socket.emit('stop_time', gamer.room_number, opponent);
    }
    if (winner === 'O') {
      socket.emit('declare_winner', gamer.username, opponent);
      socket.emit('stop_time', gamer.room_number, opponent);
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
    if (user){
      socket.emit('update_player_session', user.username ,(result) => {
        const currentPlayer = result.player;
        const opponent = result.opponent;
        dispatch({
          type: LOAD_USER_SUCCESS,
          payload: {user: currentPlayer}
        });
        setOpponentName(opponent);
      });
      socket.emit('get_history', user.username ,(result) => {
        
        if (result){
          const lHistory = result[0];
          const move = result[1];
          console.log("lastHistory", lHistory);
          console.log("Array(lHistory)", Array(lHistory));
          console.log("move",move);
          setHistory(lHistory);
          setCurrentMove(move);
        }
      });
      if (!user.in_room) {
        browserHistory.push('/dashboard');
      }
    }


    socket.on('setTimer', (timer) => {
      setTimer(timer);
    });

    socket.on('TimeOut', () => {
      setTimeOut(true);
    });

    socket.on('stopTimer', () => {
      setTimer('');
      setTimeOut(false);
    });

    socket.on('rematchGame', () => {
      setTimeOut(false);
      setBoard([Array(9).fill(null)]);
    });

    socket.on('playerWon', (data) => {
      socket.emit('declare_winner', data.player_name, data.opponent_name);

    });

    socket.on('handelPlay', (data) => {

      setHistory(data.nextHistory);
      setCurrentMove(data.currentMove);
    });

    socket.on('congrateWinner', () => {
      setPlayerWon(true);
    });

    socket.on('noteOpponent', () => {
      confirmAlert({
        title: 'Sorry you Lost',
        message: `your can win next time`,
        buttons: [
          {
            label: 'Ok',
            onClick: () => {
            }
          }
        ]
      });
    });

    

  }, []);


  return (
    <div>
      {playerWon ? (    
      <Confetti
      width={outerWidth}
      height={outerHeight}
      />
    ):('')}
    <Box sx={{ width: '100%' }}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6} md={4}>
          <Chat
          socket={socket}
          />
        </Grid>
        <Grid item xs={6} md={8}>
        <Grid item xs={16}>
              <Paper
                sx={{
                  p: 2,
                  margin: 'auto',
                  maxWidth: 500,
                  flexGrow: 1,
                }}
                elevation={24}
              >
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                >
                <Button 
                variant="outlined"
                color="error"
                onClick={leaveAction}
                >
                  leave
                </Button>
                  
                </Grid>
            </Paper>
          </Grid>
          <Grid item xs={16}>
          <Grid item xs={16}>

              <Paper
                sx={{
                  p: 2,
                  margin: 'auto',
                  maxWidth: 500,
                  flexGrow: 1,
                }}
                elevation={24}
              >

              <Container maxWidth="sm">

                <Box sx={{ bgcolor: '#e3f2fd', minHeight: '10vh' }}>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                >

                  <Typography variant="h2" gutterBottom>
                    {timer ? timer: '00:15'}
                  </Typography>
                  
                </Grid>
                </Box>
              </Container>
            </Paper>
            </Grid>
            <Grid item xs={16}>
              <Paper
                sx={{
                  p: 2,
                  margin: 'auto',
                  maxWidth: 500,
                  flexGrow: 1,
                }}
                elevation={24}
              >

              <Container maxWidth="sm">
                <Box sx={{ minHeight: '50vh' }}>
                  <div className='game'>
                    <Board
                    squares={squares}
                    handleClick={handleClick}
                    />
                  </div>
                </Box>

              </Container>
            </Paper>
          </Grid>
          </Grid>

        </Grid>
      </Grid>
    </Box>
    </div>
  );
}










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

  if (squares){
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }}
  return null;
}



const countNull = (array) => {
  let counter = 0 
  for (let i = 0; i < array.length; i++) {
    if (array[i] ===undefined){
      counter++
    }
  }
};