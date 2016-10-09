'use strict';

console.log('CSGO Gamestate Integration Music Player starting...');

const http = require('http');

let shouldPlay = true;
let playerDead = false;
let lastUpdate = null;

http.createServer((req, res) => {
  if (req.method !== 'POST') return res.end();

  res.writeHead(200, {'Content-Type': 'text/html'});

  let body = '';
  req.on('data', (data) => {
    body += data;
  });

  req.on('end', () => {
    console.log(body);
    statusUpdate(JSON.parse(body));

    res.end();
  });
}).listen(3000);

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
  res.end(`{"play":${shouldPlay}}`);
}).listen(3001);

function statusUpdate (data) {
  lastUpdate = new Date();

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
