export const Players = ({ player, socket, setPlayers, setPlayer }) => {
  const localName = localStorage.getItem('username');
  if (localName !== player.name && player.name !== '' && !player.in_room) {

    return (
      <button className="players"
      onClick={(event) => {
        const  targetPlayer = event.target.innerHTML;
        console.log(targetPlayer)
        if (event.target){
          socket.emit('join_room', localName, targetPlayer,(result) => {
            console.log(result)
            setPlayers(result.players);
            setPlayer(result.player);
          });
        }
      }}
      >{player.name}
      </button>
    )
  }};
