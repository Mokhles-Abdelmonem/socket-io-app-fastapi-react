import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useHistory } from "react-router-dom";
import { useEffect, useState } from 'react';

export default function PLayersDrawer({socket}) {
  const [selectedPlayer, setSelectedPlayer] = React.useState("account");
  let history = useHistory();

  const handleListItemClick = (event) => {
    setSelectedPlayer(event.target);
    console.log(event.target);

  };




  
  useEffect(() => {
    // socket.on('playerJoined', (data) => {
    //   setMessages((prevMessages) => [...prevMessages, { ...data, type: 'join'}]);
    //   socket.emit('get_players' ,(result) => {
    //     const playersList = result;
    //     if (playersList.length === 0) {
    //       localStorage.removeItem('username');
    //       setPlayers([]);
    //     }else{
    //       setPlayers(playersList);
    //     }

    //   });
    // });



    
  }, []);


  return (
    <Box sx={{ width: '100%', hight: 360, maxWidth: 360, bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="main mailbox folders">
        <ListItemButton
          selected={selectedPlayer === "account"}
          onClick={(event) => handleListItemClick(event)}
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