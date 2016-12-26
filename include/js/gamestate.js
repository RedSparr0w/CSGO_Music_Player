'use strict';

const http = require('http');

let shouldPlay = true;
let playerDead = false;

http.createServer((req, res) => {
  if (req.method !== 'POST') return res.end();

  res.writeHead(200, {'Content-Type': 'text/html'});

  let body = '';
  req.on('data', (data) => {
    body += data;
  });

  req.on('end', () => {
    statusUpdate(JSON.parse(body));

    res.end();
  });
}).listen(1337);

function statusUpdate (data) {
  // Discard unwanted messenges
  if (!data.previously && !data.player) return;

  /*
    Music should play when
    - in menu
    - dead
  */

  if (
    (data.player && data.player.activity === 'menu') || // menu
    (data.player.state.health === 0 || data.player.steamid !== data.provider.steamid) // dead
  ) {
    shouldPlay = true;
    playerDead = true;
  } else {
    shouldPlay = false;
    playerDead = false;
  }
}