import * as React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { logout } from '../api/logout';
import { useSelector, useDispatch } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';
import { io } from 'socket.io-client';

import {
  LOAD_USER_SUCCESS,
} from '../api/types';

const socket = io(process.env.REACT_APP_API_URL, {
  path: process.env.REACT_APP_SOCKET_PATH,
});

function Header() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const logoutHandler = () => {

    if(user){
      if(user.in_room){
        if(user.player_won || user.player_lost){
          socket.emit('get_opponent', user.username ,(opponent) => {   
            socket.emit('player_left_room', opponent);
            socket.emit('player_logged_out', user, (result) => {
              dispatch({
                type: LOAD_USER_SUCCESS,
                payload: {user: result.player}
              });
            });
            if (dispatch && dispatch !== null && dispatch !== undefined){
              dispatch(logout());
            }
        });
        }else{
          socket.emit('get_opponent', user.username ,(opponent) => {        
            confirmAlert({
              title: 'Attention , you are in the middle of a game',
              message: `logout now will consider loss in game`,
              buttons: [
                {
                  label: 'Logout',
                  onClick: () => {
                    socket.emit('player_left_in_game', opponent);
                    socket.emit('player_logged_out', user, (result) => {
                      dispatch({
                        type: LOAD_USER_SUCCESS,
                        payload: {user: result.player}
                      });
                    });
                    if (dispatch && dispatch !== null && dispatch !== undefined){
                      dispatch(logout());
                    }
                  }
                },
                {
                  label: 'Stay',
                  onClick: () => {
                  }
                }
              ]
            });
          });
        }
      }else{
        socket.emit('player_logged_out', user, (result) => {
          dispatch({
            type: LOAD_USER_SUCCESS,
            payload: {user: result.player}
          });
        });
        if (dispatch && dispatch!== null && dispatch!== undefined){
          dispatch(logout());
        }
      }
    }



  };


  const authLinks = (
    <>
          <Button href="/login" variant="outlined" size="small">
              Sign in
          </Button>
          <Button href="/register" variant="outlined" size="small">
              Sign up
          </Button>
    </>
  );

  const settingsLinks = (
    <>
    {
    user.is_admin ? 
    (
      <Button href="/admin" variant="outlined" size="small">
        Acount Settings
      </Button>
    ):(
      ''
    )
    }

    <Button onClick={logoutHandler} variant="outlined" size="small">
        logout
    </Button>
    </>
  );


  return (
    <React.Fragment>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Button href="/" size="small">Socket.io app</Button>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1 }}
        >
          Welcom to TicTacToe Game
        </Typography>
        {isAuthenticated ? settingsLinks : authLinks}

      </Toolbar>
    </React.Fragment>
  );
}

export default Header;