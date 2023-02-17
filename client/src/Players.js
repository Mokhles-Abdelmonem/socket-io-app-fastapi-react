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
              socket.emit('join_room', localName, targetPlayer,(result) => {
                const player_x = result[0];
                const player_o = result[1];
                socket.emit('set_timer', player_x.room_number)
                setPlayer(player_x);
                setOpponentName(player_o.name);
              });
            };
          });

        }
      }}
      >{player.name}
      </button>
    )
  }};
