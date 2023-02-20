import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useHistory } from "react-router-dom";
import { useEffect, useState } from 'react';
  
export default function joinButton(store) {
  const handleClick = (event) => {
    console.log(event.target);

  };
    return (
      <Box sx={{ width: '100%', hight: 360, bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="main mailbox folders">
        <ListItemButton
          display="flex"
          alignItems="center"
          justify="center"
          onClick={(event) => handleClick(event)}
        >
          <ListItemIcon>
            <PersonOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="Account" />
        </ListItemButton>
      </List>
    </Box>
  
    );
  }
  