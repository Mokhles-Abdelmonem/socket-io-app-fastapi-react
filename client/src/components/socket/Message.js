export const Message = ({ message }) => {
  if (message.type === 'join') return `${message.username} just joined`;
  if (message.type === 'joinedRoom') return `${message.username} welcom to room ${message.room_number}`
  if (message.type === 'chat') return `${message.player.username}: ${message.message}`;
  if (message.type === 'leaved') return `${message.sid} just leaved`;
  if (message.type === 'winner') return `winner of room ${message.roomNumber} is ${message.winner}`;
};
