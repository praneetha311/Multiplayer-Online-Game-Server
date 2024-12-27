const ws = new WebSocket('ws://localhost:3006');

document.getElementById('join-game').addEventListener('click', () => {
  const playerName = document.getElementById('player-name').value;

  if (playerName) {
    ws.send(JSON.stringify({ type: 'join', name: playerName }));
  }
});

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'playerList':
      const playerListItems = document.getElementById('player-list-items');
      playerListItems.innerHTML = '';

      data.players.forEach((player) => {
        const listItem = document.createElement('li');
        listItem.textContent = player.name;
        playerListItems.appendChild(listItem);
      });
      break;

    default:
      console.log('Unknown message type:', data.type);
  }
};