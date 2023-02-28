import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { SnackbarContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import PLayersDrawer from './components/settingSectoins/Drawer';
import { io } from 'socket.io-client';
import { Message } from './components/socket/Message';
import { Redirect, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SendIcon from '@mui/icons-material/Send';


import {
  LOAD_USER_SUCCESS,
} from './api/types';


export default function GeneralRoom({socket}) {
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [opponentName, setOpponentName] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [message, setMessage] = useState('');

  const user = useSelector(state => state.auth.user);
  let history = useHistory();
  const dispatch = useDispatch();



  const leaveAction  = () => {
      if (user) {
      socket.emit('leave_game', user, (result) => {
        dispatch({
          type: LOAD_USER_SUCCESS,
          payload: {user: result}
        });
        history.push("/") 
      });
    }
  }

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(socket.connected);
    });

    socket.on('disconnect', () => {
      setIsConnected(socket.connected);
    });


    socket.on('getUser',  ()  => {
      return user
    });
    
    socket.on('playerJoined', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'join'}]);
        const playersList = data.players;
        setPlayers(playersList);
    });
    socket.on('setPlayers', (data) => {
      setPlayers(data)
    });
    socket.on('pushToRoom', () => {
      history.push("/tictactoe") 
    });

    if (user){
  
      socket.emit('update_player_session', user.username ,(result) => {
        const playersList = result.players;
        const currentPlayer = result.player;
        const opponent = result.opponent;
        dispatch({
          type: LOAD_USER_SUCCESS,
          payload: {user: currentPlayer}
        });
        setOpponentName(opponent);
        setPlayers(playersList);
      });
      socket.emit('get_messages', user.username ,(result) => {

        if (result){
          setMessages(result);
        }
      });
      if (user.in_room) {
        return <Redirect to="/tictactoe" />
      }
    }

    socket.on('gameRequest', (data) => {
      confirmAlert({
        title: 'Confirm game request',
        message: `${data.player_x_name} Requesting a game with you`,
        buttons: [
          {
            label: 'Yes',
            onClick: () => {
              socket.emit('join_room', data.player_x_name, data.player_o_name,(result) => {
                const player_x = result[0];
                const player_o = result[1];
                setOpponentName(data.player_x_name);
                dispatch({
                  type: LOAD_USER_SUCCESS,
                  payload: {user: player_o}
                });
                
              });
            }
          },
          {
            label: 'No',
            onClick: () => {
              socket.emit('decline_request', data.player_x_name);
            }
          }
        ]
      });
    });


    socket.on('setPlayer', (data) => {
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {user: data.player}
      });
      setOpponentName(data.opponent)
      const player_x = data.player
      confirmAlert({
        title: 'Accepted game request',
        message: `your turn as X `,
        buttons: [
          {
            label: 'Ok',
            onClick: () => {
              socket.emit('set_timer', player_x.room_number, player_x.username)
            }
          }
        ],
        onClickOutside: () => {
          socket.emit('set_timer', player_x.room_number, player_x.username)
        },
      });
    });
    socket.on('setPlayers', (data) => {
      setPlayers(data)
    });
    socket.on('playersJoinedRoom', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data[0], type: 'joinedRoom'}]);
      setMessages((prevMessages) => [...prevMessages, { ...data[1], type: 'joinedRoom'}]);
  });


  socket.on('requestDeclined', () => {
    confirmAlert({
      title: 'Declined game request',
      message: `Game request declined`,
      buttons: [
        {
          label: 'Ok',
          onClick: () => {
          }
        }
      ]
    });
  });

  socket.on('requestCanceled', () => {
    confirmAlert({
      title: 'Game Canceled',
      message: `The Request Canceled`,
      buttons: [
        {
          label: 'Ok',
          onClick: () => {
          }
        }
      ]
    });
  });

  socket.on('chat', (messages) => {
    setMessages(messages);
  });

  socket.on('declareWinner', (data) => {
    setMessages((prevMessages) => [...prevMessages, { ...data, type: 'winner'}]);
  });


  }, []);


  return (
    <div>
      <Grid container spacing={2} columns={16}>
          <Grid item xs={4}>

          <ListItemButton
            onClick={leaveAction}
            sx={{ bgcolor: '#ffcdd2' }}

          >
            <ListItemText 
            primary="leave game"
            />
          </ListItemButton>
          <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                >
          <Typography variant="h5" gutterBottom>
                    Available players
          </Typography>
          </Grid >
            <PLayersDrawer
              allPlayers={players}   
              currentPlayer={user} 
              socket={socket}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid item xs={12}>
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


              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <form>
              <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                <TextField 
                id="input-with-message" 
                label="send message" 
                variant="standard" 
                onChange={(event) => {
                  const value = event.target.value.trim();
                  setMessage(value);
                }}
                />

                <Button 
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  onClick={() => {
                      if (message && message.length) {
                        if (user.in_room) {
                          socket.emit('chat_in_room', user.username, message);
                        }else{
                        socket.emit('chat', user.username, message);
                        }
                      }
                      var messageBox = document.getElementById('input-with-message');
                      messageBox.value = '';
                      setMessage('');
                    }
                  }
                  >
                    Send
                </Button>
              </form>
              </Box>

              </Container>
            </Paper>
            </Grid>
            <Grid item xs={12}>

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

                <Box sx={{ 
                  bgcolor: '#e3f2fd',
                  height: '93vh',
                  overflow: 'auto',
                  }}>
                <Stack spacing={2} sx={{ maxWidth: 600 }}>
                    {messages.map((message, index) => (
                        <SnackbarContent 
                        key={index}
                        sx={{ bgcolor: '#42a5f5' }}
                        message={<Message message={message} />}
                        />
                      ))}

                  </Stack>
                </Box>
              </Container>
            </Paper>
            </Grid>

          </Grid>
      </Grid>
    </div>
  );
}


