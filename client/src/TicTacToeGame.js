import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';

import { Redirect, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import useWindowSize from "@rooks/use-window-size"
import Confetti from 'react-confetti'
import { confirmAlert } from 'react-confirm-alert';





import {
  LOAD_USER_SUCCESS,
} from './api/types';
import Board from './components/socket/Board';
import Chat from './components/socket/Chat';
import RPSBoard from './components/socket/RPSBoard';




export default function Game({socket}) {
  const [opponentName, setOpponentName] = useState('');
  const [timer, setTimer] = useState('');
  const [timeOut, setTimeOut] = useState(false);
  
  const [playerWon, setPlayerWon] = useState(false);
  const [playerLost, setPlayerLost] = useState(false);
  const [playerDraw, setPlayerDraw] = useState(false);

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [board, setBoard] = useState([Array(9).fill(null)]);

  const [Clicked, setClicked] = useState(null);


  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const { innerWidth, innerHeight, outerHeight, outerWidth } = useWindowSize();
  let browserHistory = useHistory();

  const [level, setLevel] = useState(0);
  const [game, setGame] = useState(null);

  let username; 
  if(user === undefined || user === null || user.username === null || user.username === undefined){
    socket.emit('get_user' ,(player) => {
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {user: player}
        
      });
    username = player.username
    });      
  }else{
    username = user.username
  }
  const leaveAction  = () => {
      if (user) {
        if (playerWon || playerLost || playerDraw){
          socket.emit('player_left_room', opponentName);
          socket.emit('leave_room', user, (result) => {
            dispatch({
              type: LOAD_USER_SUCCESS,
              payload: {user: result.player}
            });
            browserHistory.push("/dashboard") 
          });
        }else{
          confirmAlert({
            title: 'Attention , you are in the middle of a game',
            message: `leaving the game will consider loss`,
            buttons: [
              {
                label: 'leave',
                onClick: () => {
                  socket.emit('player_left_in_game', opponentName);
                  socket.emit('leave_room', user, (result) => {
                    dispatch({
                      type: LOAD_USER_SUCCESS,
                      payload: {user: result.player}
                    });
                    browserHistory.push("/dashboard") 
                  });
                }
              },
              {
                label: 'Stay',
                onClick: () => {
                }
              }
            ]
          });
        }

    }
  }

  const handelRemach  = () => {
    if (user) {
      socket.emit('rematch_game', username, opponentName, game);
  }
}

  function handleClick(i) {
    socket.emit('handle_click', i, user, opponentName);
  }

  function handleRPSClick(i) {
    socket.emit('handle_rps_click', i, user, opponentName,(res)=>{
    if(res){
      console.log("clicked", i);
      setClicked(i);
    } 
    });
  }

  function getUser (){
    socket.emit('get_user', (player) => {
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {user: player}
      });
    });
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
        setPlayerWon(currentPlayer.player_won);
        setPlayerLost(currentPlayer.player_lost);
        setPlayerDraw(currentPlayer.player_draw);
        setLevel(currentPlayer.level)

      });
      socket.emit('get_board', user.username ,(result) => {
        if (result){
          setBoard(result);
        }
      });

      socket.emit('get_player_rps_choice', user.username ,(result) => {
        setClicked(result);
      });

      socket.emit('get_game', user.room_number ,(result) => {
          console.log("result of getting the game", result);
          setGame(result);
      });
      if (!user.in_room) {
        return <Redirect to="/dashboard" />
      }
    }

    socket.on('logeUserOutFromRoom',  (opponent_name)  => {
      socket.emit('player_disabled_in_game', opponent_name);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.reload();
  
  });
  
    socket.on('setBoard', (res) => {
      setBoard(res);
    });
    socket.on('refreshPlayer', () => {
      console.log("refresh player state  from server ");
      window.location.reload();
    });
    socket.on('setTimer', (timer) => {
      console.log ("timer >>>>" + timer);
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
      setPlayerWon(false);
      setPlayerLost(false);
      setPlayerDraw(false);
      setTimeOut(false);
      setCurrentMove(0);
      setHistory([Array(9).fill(null)]);
      setBoard([Array(9).fill(null)]);
      setClicked(null);
      if(user){
        socket.emit('get_user_level', username ,(level) => {
          if (level){
            setLevel(level)
          }
        });
      }
    });

    socket.on('playerWon', (data) => {
      socket.emit('declare_winner', data.player_name, data.opponent_name);

    });

    socket.on('handelPlay', (data) => {

      setHistory(data.nextHistory);
      setCurrentMove(data.currentMove);
    });

    socket.on('congrateWinner', (player) => {
      setPlayerWon(true);
      setLevel(player.level);
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {user: player}
      });
    });


    socket.on('setDisconnectedPlayer', (username) => {
      socket.emit('set_disconnected_player', username);
    });
    socket.on('noteOpponent', (player) => {
      setPlayerLost(true);
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {user: player}
      });
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
    socket.on('declareDraw', () => {
      setPlayerDraw(true);
      if(user === undefined && user === null){
        socket.emit('get_user' ,(user) => {
          dispatch({
            type: LOAD_USER_SUCCESS,
            payload: {user: user}
            
          });
        });      
      }else{
        socket.emit('set_player_draw', username);
      }
      confirmAlert({
        title: 'Tie ',
        message: `the game settled to draw, your can win next time`,
        buttons: [
          {
            label: 'Ok',
            onClick: () => {
            }
          }
        ]
      });
    });


    socket.on('noteOpponentWon', () => {
      confirmAlert({
        title: 'Congrates you won',
        message: `your opponent leaved the game , you daclared as winner`,
        buttons: [
          {
            label: 'Ok',
            onClick: () => {
              socket.emit('leave_other_player', username, (player) => {
                dispatch({
                  type: LOAD_USER_SUCCESS,
                  payload: {user: player}
                });
                browserHistory.push("/dashboard");
              });
            }
          }
        ],
        onClickOutside: () => {
          socket.emit('leave_other_player', username, (player) => {
            dispatch({
              type: LOAD_USER_SUCCESS,
              payload: {user: player}
            });
            browserHistory.push("/dashboard")
          });
        },
      });
    });


    socket.on('notePlayerLeft', () => {
      socket.emit('leave_other_player', username, (player) => {
        dispatch({
          type: LOAD_USER_SUCCESS,
          payload: {user: player}
        });
        browserHistory.push("/dashboard") 
      });
      confirmAlert({
        title: 'your opponent left the game',
        message: `the room is empty now, we redirected you home page`,
        buttons: [
          {
            label: 'Ok',
            onClick: () => {

            }
          }
        ],
        onClickOutside: () => {
        },
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
    <Box  sx={{ width: '100%' }}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6} md={4}>
          <Chat
          socket={socket}
          level={level}
          />
        </Grid>
        <Grid item xs={6} md={8}>
        <Grid container spacing={2}>

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

                >
                {playerWon || playerLost || playerDraw? (    
                <Button 
                variant="outlined"
                color="primary"
                onClick={handelRemach}
                >
                  rematch
                </Button>
                ):('')}
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
            <Grid container spacing={2}>

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
                      {game && game === 0 ? (
                        <Board
                        squares={board}
                        handleClick={handleClick}
                        />
                      ):(
                        <RPSBoard
                        Clicked={Clicked}
                        handleClick={handleRPSClick}
                        />
                      ) }

                    </div>
                  </Box>

                </Container>
              </Paper>
            </Grid>
            </Grid>
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
  var nulls = countNull(squares);
  if (nulls === 0){
    return 'tie';
  }
  return null;
}



const countNull = (array) => {
  let counter = 0 
  for (let i = 0; i < array.length; i++) {
    if (array[i] === null ){
      counter++
    }
  }
  return counter
};