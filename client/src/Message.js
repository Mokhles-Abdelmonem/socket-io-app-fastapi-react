export const Message = ({ message }) => {
  if (message.type === 'join') return <p>{`${message.username} just joined`}</p>;
  if (message.type === 'joinedRoom') {

    
    return (
      <p>{`${message.name} welcom to room ${message.room_number}`}</p>
      )};
  if (message.type === 'chat') return <p>{`${message.player.name}: ${message.message}`}</p>;
  if (message.type === 'leaved') return <p>{`${message.sid} just leaved`}</p>;
  if (message.type === 'winner') return <p>{`winner of room ${message.roomNumber} is ${message.winner}`}</p>;
};
