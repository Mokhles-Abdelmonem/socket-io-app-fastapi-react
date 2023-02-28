import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { Redirect } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  LOAD_USER_SUCCESS,
} from '../../api/types';



export default function JoinButton({socket}) {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const handleClick = (event) => {
    console.log(user)
    socket.emit('add_user', user, (res) => {      
      dispatch({
        type: LOAD_USER_SUCCESS,
        payload: {user: res}
      });
    })
  };
  if (user){
    if (user.joined) { return <Redirect to="/dashboard" />}
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
  