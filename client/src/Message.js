export const Message = ({ message }) => {
  if (message.type === 'join') return <p>{`${message.user} just joined`}</p>;
  if (message.type === 'chat') return <p>{`${message.user}: ${message.message}`}</p>;
  if (message.type === 'leaved') return <p>{`${message.user} just leaved`}</p>;
};
