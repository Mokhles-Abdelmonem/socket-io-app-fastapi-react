import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import
import UsersDrawer from './components/settingSectoins/DrawerUsers';
import { get_users } from './api/getUsers';
import { Redirect, useHistory } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { request_refresh } from './api/refresh';

export default function Admin() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  let history = useHistory();


  const user = useSelector(state => state.auth.user);

  const [users, setUsers] = useState([]);


  useEffect(() => {


    dispatch(request_refresh());

      


    get_users().then(users =>{

        setUsers(users);
    })


}, []);
  

  return (
    <>
      <UsersDrawer
      users ={users}
      />
    </>
  );
}