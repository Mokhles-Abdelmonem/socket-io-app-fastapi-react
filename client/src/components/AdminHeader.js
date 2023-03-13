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

export default function AdminHeader() {


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
          Admin panel
        </Typography>
        <Button href="/dashboard" variant="outlined" size="small">
          back home
        </Button>
      </Toolbar>
    </React.Fragment>
  );
}

