import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css




export const Players = ({ player, socket, setOpponentName, setPlayer }) => {
  const localName = localStorage.getItem('username');
  if (localName !== player.name && player.name !== '' && !player.in_room) {

    return (
      <button className="players"
      onClick={(event) => {
        const  targetPlayer = event.target.innerHTML;
        if (event.target){
          socket.emit('check_player', targetPlayer, (exist) => {
            if(exist){
              socket.emit('game_request', localName, targetPlayer)
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
      }}
      >{player.name}
      </button>
    )
  }};
