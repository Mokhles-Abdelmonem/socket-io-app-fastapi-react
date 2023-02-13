export const Message = ({ message }) => {
  if (message.type === 'join') return <p>{`${message.sid} just joined to room ${message.room}`}</p>;
  if (message.type === 'chat') return <p>{`${message.sid}: ${message.message}`}</p>;
  if (message.type === 'leaved') return <p>{`${message.sid} just leaved`}</p>;
  if (message.type === 'winner') return <p>{`winner of room ${message.roomNumber} is ${message.winner}`}</p>;
};
