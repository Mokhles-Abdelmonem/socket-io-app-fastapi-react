export const Message = ({ message }) => {
  if (message.type === 'join') return <p>{`${message.sid} just joined to room ${message.room}`}</p>;
  if (message.type === 'chat') return <p>{`${message.sid}: ${message.message}`}</p>;
  if (message.type === 'leaved') return <p>{`${message.sid} just leaved`}</p>;
};
