import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert'; 
import AdminSettings from './adminSettings';


export default function UsersDrawer({users}) {
  const [selectedPlayer , SetSelectedPlayer] = useState('');
  console.log("users FROM  DRAWER", users)
  const handleListItemClick = (event, username) => {
    console.log("handleListItemClick", event, username);
    SetSelectedPlayer(username);
  };

  return (
  <>
    <Box sx={{ width: '100%', hight: 360, maxWidth: 360, bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="main mailbox folders">
        {users.map((username, index) => (
          <ListItemButton
            key={index}
            onClick={(event) => handleListItemClick(event, username)}
          >
            <ListItemIcon>
              <PersonOutlineIcon />
            </ListItemIcon>
            <ListItemText 
            primary={username}
            id={username}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
    <AdminSettings
    selectedPlayer={selectedPlayer}
    />
  </>
  );
}