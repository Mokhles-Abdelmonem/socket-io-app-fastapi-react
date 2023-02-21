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
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import {
  LOAD_USER_SUCCESS,
} from './api/types';



const socket = io(process.env.REACT_APP_API_URL, {
  path: process.env.REACT_APP_SOCKET_PATH,
});
export default function GeneralRoom() {
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
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
      history.push('/');
      const opponent = result.opponent;
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


    socket.on('playerJoined', (data) => {
      console.log("data", data);
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'join'}]);
        const playersList = data.players;
        setPlayers(playersList);
    });
    socket.on('setPlayers', (data) => {
      setPlayers(data)
    });

    if (user){
  
      socket.emit('update_player_session', user.username ,(result) => {
        const currentPlayer = result.player;
        dispatch({
          type: LOAD_USER_SUCCESS,
          payload: {user: currentPlayer}
        });
        const opponent = result.opponent;
      });
    }

  }, []);


  return (
    <div>
      <Grid container spacing={2} columns={16}>
          <Grid item xs={4}>
            <PLayersDrawer
              allPlayers={players}   
              currentPlayer={user}   
            />
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
                <Button 
                variant="outlined"
                color="error"
                onClick={leaveAction}
                >
                  leave
                </Button>
                <Box sx={{ bgcolor: '#e3f2fd', height: '93vh' }}>
                <Stack spacing={2} sx={{ maxWidth: 600 }}>
                    {messages.map((message, index) => (
                        <SnackbarContent 
                        sx={{ bgcolor: '#42a5f5' }}
                        message={<Message message={message} key={index} />}
                        />
                      ))}

                  </Stack>
                </Box>

              </Container>
            </Paper>
          </Grid>
      </Grid>
    </div>
  );
}


