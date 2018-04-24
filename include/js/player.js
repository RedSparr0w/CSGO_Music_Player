'use strict';

const version = require('electron').remote.app.getVersion();
const id3 = require('id3-parser');
const fs = require('fs');
const ipc = require('electron').ipcRenderer; //required for global shortcut keys
ipc.on('queueNext', queueNext);
ipc.on('togglePlayer', togglePlayer);

let settings = localStorage.settings ? JSON.parse(localStorage.settings) : {
  version,
  "theme" : "dark",
  "theme_color" : "red",
  "play_music_when_alive" : false,
  "alive_volume" : 0.1,
  "master_volume" : 0.8,
  "delay_music_amount" : 1500,
  "show_notifications" : 1
};

if (!settings.version){
  updateSetting('version',version);
  updateSetting('show_notifications',1);
}

$.each(settings,function(key,val){
  try{
    settings[key] = JSON.parse(val);
  }catch(e){
    settings[key] = val;
  }
});

let playlist = localStorage.playlist ? JSON.parse(localStorage.playlist) : [];

var player = $('#player')[0];
var source = $('#player > source')[0];
var playlistDiv = $('#playlist')[0];
var enablePlay = false;
var checkPlayerState;
var index = 0;
var closeNotification;

$(document).ready(function () {
  queueDisplay();
  player.volume = settings.master_volume;
});

/*********************
*** Apply Settings ***
*********************/

// Theme
var classList = $('body')[0].classList;
for (var i = 0; i < classList.length; i++) {
    if (classList[i].indexOf('theme') === 0) classList.remove(classList[i]);
}
classList.add('theme-' + settings.theme_color);
classList.add('layout-' + settings.theme);

// Radios
$('input:radio').each(function(){
  if(this.value == settings[this.name].toString()){
    this.checked = true;
  }else{
    this.checked = false;
  }
});

// Other inputs
$('input').not(':radio,:checkbox').each(function(){
  this.value = settings[this.name]
});

/********************/

// Drag and drop music
document.ondragover = document.ondrop = (ev) => {
  ev.preventDefault();
}

document.body.ondrop = (ev) => {
  ev.preventDefault();
  var total = ev.dataTransfer.files.length + playlist.length;
  Array.from(ev.dataTransfer.files).forEach(function(file){
    id3.parse(new Uint8Array(fs.readFileSync(file.path))).then(tags => {
      //console.info(tags);
      playlist.push({
        'title':tags.title ? tags.title : file.name,
        'artist':tags.artist ? tags.artist : 'unknown',
        'path':file.path
      });
      if (playlist.length == total){
        queueDisplay();
        localStorage.playlist = JSON.stringify(playlist);
      }
      if (source.src.indexOf('nofilesloaded')>=0){
        playIndex(index);
      }
    });
    console.info(`Added ${file.name} to playlist`);
  });
}

function notify(title,body,icon) {
  icon = icon || 'logo.ico';
  var options = {
      body,
      icon,
      silent: true
  }
  return new Notification(title,options);
}
let noti = {close:function(){}};

function updateSetting(obj,val){
  try {
    settings[obj] = JSON.parse(val);
  }catch(e){
    settings[obj] = val;
  }
  localStorage.settings = JSON.stringify(settings);
}

$('input').change(function() {
  updateSetting(this.name, this.value);
});

function togglePlayer(){
  if(!enablePlay){
    enablePlay = true;
    $('#togglePlayer').html('<i class="fa fa-stop" aria-hidden="true"></i>');
    checkPlayerState = setInterval(function() {
      if (!enablePlay) return;

      pullUpdate();
    }, 1000);
  }else{
    enablePlay = false;
    clearInterval(checkPlayerState);
    player.pause();
    $('#togglePlayer').html('<i class="fa fa-play" aria-hidden="true"></i>');
  }
}

function toggleShuffle(){
  playlist = playlist.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
  queueDisplay();
  index = 0;
  playIndex(index);
}

function playIndex(i) {
  if (i >= playlist.length) {
    return;
  }

  index = i;
  $('.playing').removeClass('playing');
  $('#playlist li').eq(index).addClass('playing').parents('.page-content').animate({ scrollTop: ($('.playing').position() ? $('.playing').position().top : -20) + 20 }, 600);
  source.src = playlist[i].path;
  player.load();
  if (settings.show_notifications >= 1){
    if(settings.show_notifications === 2 || settings.show_notifications === 1 && !!shouldPlay){
      clearTimeout(closeNotification);
      noti.close();
      noti = notify(playlist[i].title,playlist[i].artist);
      closeNotification = setTimeout(function() { noti.close() }, 2500);
    }
  }
  
}
playIndex(index);

function queueAdd() {
  jsmediatags.read(selector.files[0], {
    onSuccess: function (tag) {
      var info = tag.tags;

      var picture = '';
      for (var i = 0; i < info.picture.data.length; i++) {
        picture += String.fromCharCode(info.picture.data[i]);
      }
      picture = 'data:' + info.picture.format + ';base64,' + window.btoa(picture);

      playlist.push({
        artist: info.artist,
        title: info.title,
        album: info.album,
        picture: picture,
        year: info.year,
        blob: selector.files[0]
      });
      queueDisplay();

      if (playlist.length === 1) playIndex(0);

      selector.value = '';
    },
    onError: function (error) {
      playlist.push({
        artist: 'Unknown',
        title: 'Unknown',
        album: 'Unknown',
        year: '?',
        picture: "data:image/jpeg;base64,",
        blob: selector.files[0]
      });

      queueDisplay();

      if (playlist.length === 1) playIndex(0);

      selector.value = '';
    }
  });
}

function removeQueue(i) {
  if (i >= playlist.length) return;

  if (i == index) queueNext();
  playlist.splice(i, 1);
  $('#playlist li').eq(i).slideUp(400,function(){$(this).remove();queueDisplay();});
  localStorage.playlist = JSON.stringify(playlist);
}

function queueNext() {
  URL.revokeObjectURL(source.src);

  if (index >= playlist.length - 1) {
    index = 0;
    playIndex(index);
    return;
  }

  playIndex(++index);
}

function queuePrev() {
  URL.revokeObjectURL(source.src);

  if (index < 1) {
    index = playlist.length - 1
    playIndex(index);
    return;
  }

  playIndex(--index);
}

function queueDisplay () {
  var html = '';
  if (!playlist.length){
    html += `<div class="drop_zone" style="margin-left: 10vw;width: 80vw;text-align: center;">
        <div style="display: table-cell;vertical-align: middle;border: 5px dotted;border-radius:15px;height: calc(100vh - 226px);width: 100vw;">
          <p>
            Drag &amp; Drop<br/>Your Music Here
            <br>
            <i class="fa fa-4x fa-music"></i>
          </p>
        </div>
      </div>`;
  }else{
    for (var i in playlist) {
      html += `<li>
                <a href="#" class="item-link item-content" data-index="${i}" onclick="playIndex(this.dataset.index);" oncontextmenu="removeQueue(this.dataset.index)">
                  <div class="item-inner">
                    <div class="item-title-row">
                      <div class="item-title">${playlist[i].title}</div>
                    </div>
                    <div class="item-subtitle">${playlist[i].artist}</div>
                  </div>
                </a>
              </li>`;
    }
  }

  playlistDiv.innerHTML = html;
  $('.playing').removeClass('playing');
  $('#playlist li').eq(index).addClass('playing');
  //barDisplay();
}

function pullUpdate () {
  if (!shouldPlay) {
    if (!settings.play_music_when_alive){
      player.pause();
    } else {
	    player.play();
	    player.volume = settings.alive_volume;
    }
  } else {
    // Delay Music on Death (listen to footsteps)
    setTimeout(function (){
      if(!!shouldPlay && !!enablePlay){
        player.play();
        player.volume = settings.master_volume;
      }
    }, settings.delay_music_amount);
  }
}

player.onended = function () {
  queueNext();
};


/*************************************************************
***************** Update Everything Below ********************
**************************************************************

window.onbeforeunload = function () {
  window.localStorage.index = index;
};

function queueDelete () {
  queue = [];
  //if (window.localStorage.playlist) delete window.localStorage.playlist;
  index = 0;
  //if (window.localStorage.index) delete window.localStorage.index;

  source.src = 'blank';

  queueNext();
}

function barDisplay () {
  if (!queue[index]) return info.innerHTML = "";

  var html = '<img class="player-bar-info-img" src="' + queue[index].picture + '"><div class="player-bar-info-top">' + queue[index].artist + ' - ' + queue[index].album + ' (' + queue[index].year + ')</div><div class="player-bar-info-bottom">' + queue[index].title + '</div>';

  info.innerHTML = html;
}

function barProgress () {
  if (!queue[index]) progressbar.style.width = '0%';

  progressbar.style.width = (player.currentTime/player.duration) * 100 + '%';

  if (player.paused) {
    statusbutton.className = 'icon ion-play';
  } else {
    statusbutton.className = 'icon ion-pause';
  }
}

function askDeleteQueue () {
  if (confirm('Delete entire queue?')) queueDelete();
}

window.setInterval(function () {
  barProgress();
}, 100);
*/