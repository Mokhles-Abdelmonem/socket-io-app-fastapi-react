import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useHistory } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert'; // Import


export default function PLayersDrawer({allPlayers, currentPlayer, socket}) {

  
  const avPlayers = allPlayers.filter(function(e){ 
    return e.username != currentPlayer.username && !e.in_room; 
  });
  const handleListItemClick = (event) => {
    const targetPlayer = event.target.innerHTML;
    if (event.target){
      socket.emit('check_player', targetPlayer, (exist) => {
        if(exist){
          socket.emit('game_request', currentPlayer.username , targetPlayer)
          confirmAlert({
            title: 'Confirm game request',
            message: `Waiting ${targetPlayer} response`,
            buttons: [
              {
                label: 'Cancel',
                onClick: () => {
                  socket.emit('cancel_request', targetPlayer);
                }
              }
            ]
          });
        };
      });

    }

    

  };
  useEffect(() => {
    
    
  }, []);


  return (
    <Box sx={{ width: '100%', hight: 360, maxWidth: 360, bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="main mailbox folders">
        {avPlayers.map((gamer, index) => (
          <ListItemButton
            key={index}
            onClick={(event) => handleListItemClick(event)}
          >
            <ListItemIcon>
              <PersonOutlineIcon />
            </ListItemIcon>
            <ListItemText 
            primary={gamer.username}
            id={`player_${gamer.username}`}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}