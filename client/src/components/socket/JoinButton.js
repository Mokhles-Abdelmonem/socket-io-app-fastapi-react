import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { useHistory } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { io } from 'socket.io-client';
import {
  LOAD_USER_SUCCESS,
} from '../../api/types';

const socket = io(process.env.REACT_APP_API_URL, {
  path: process.env.REACT_APP_SOCKET_PATH,
});

export default function JoinButton() {
  let history = useHistory();
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const handleClick = (event) => {
    socket.emit('add_user', user, (res) => {      
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {user: res}
      });
    })
  };
  if (user){
    if (user.joined) history.push('/tictactoe');
  }
  return (
    <Container component="main" maxWidth="xs">
    <CssBaseline />
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
    <Button 
    variant="contained"
    size="large"
    endIcon={<SendIcon />}
    onClick={(event) => handleClick(event)}
    >
      Join
    </Button>
    </Box>
  </Container>


  );
  }
  