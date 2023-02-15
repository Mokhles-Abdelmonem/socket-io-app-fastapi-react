export const Players = ({ player, socket, setPlayers, setPlayer }) => {
  const localName = localStorage.getItem('username');
  if (localName !== player.name && player.name !== '' && !player.in_room) {

    return (
      <button className="players"
      onClick={(event) => {
        const  targetPlayer = event.target.innerHTML;
        console.log(targetPlayer)
        if (event.target){
          socket.emit('check_player', targetPlayer, (exist) => {
            if(exist){
              socket.emit('join_room', localName, targetPlayer,(result) => {
                const player_x = result[0];
                const player_o = result[1];
                socket.emit('set_x_turn', player_x.room_number)
                socket.emit('run_x_timer', player_x.room_number, player_x, player_o)
                console.log(player_x.room_number)
                setPlayer(player_x);
              });
            };
          });

        }
      }}
      >{player.name}
      </button>
    )
  }};
