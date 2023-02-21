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


export default function PLayersDrawer({allPlayers, currentPlayer}) {
  const [players, setPlayers] = useState([]);

  const [selectedPlayer, setSelectedPlayer] = React.useState("account");
  
  const avPlayers = allPlayers.filter(function(e){ 
    return e.username != currentPlayer.username; 
  });
  const handleListItemClick = (event) => {
    setSelectedPlayer(event.target);

    

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
            <ListItemText primary={gamer.username}/>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}