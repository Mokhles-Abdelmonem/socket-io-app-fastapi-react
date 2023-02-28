import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useEffect } from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import


export default function PLayersDrawer({allPlayers, currentPlayer, socket}) {

  let avPlayers 
  if (allPlayers.length > 0 && currentPlayer){
    avPlayers = allPlayers.filter(function(e){ 
      return e.username !== currentPlayer.username && !e.in_room; 
    });
  }else{
    avPlayers = []
  }
  const handleListItemClick = (event, playerId) => {
    const parent = document.getElementById(playerId);
    const targetPlayer = parent.getElementsByTagName('span')[0].innerHTML;
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
            onClick={(event) => handleListItemClick(event, `player_${gamer.username}`)}
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