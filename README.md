# CS:GO Music Player
<img src="http://i.imgur.com/FKWEeSc.png" width="100%">

CS:GO Music Player is a node/browser-based music player that will connect to CSGO and only play music when you don't need sound!

Settings | Empty Playlist | Theme Changer
:---: | :---: | :---:
![](https://i.imgur.com/rwtTsTj.png) | ![](https://i.imgur.com/8aGOfdr.png) | ![](https://i.imgur.com/fhgAJ6A.png)

# Installation
- Place `gamestate_integration_music.cfg` in your `SteamApps\common\Counter-Strike: Global Offensive\csgo\cfg` folder
- Install [NodeJS](https://nodejs.org/en/) if you haven't already
- Run `npm install` in cmd prompt

# Testing Program
- Run `npm test` in cmd prompt to launch the music player
- Start CSGO _(`gamestate_integration_music.cfg` must be in correct folder before launching)_

# Build Program (.exe, win32)
- Run `npm start` in cmd prompt

# Usage
- Build your playlist by dropping files into the window
- Click the "Play" button, and the program will listen to CS:GO and play music accordingly
- Left Click a song to play now.
- Right Click to remove from playlist.
- Click the bottom right icon to toggle shuffle mode.
- To Change the theme, click the "Cog" icon up the top left then click "change theme".

# Global Shortcut Keys
- `ALT + N` Next Song
- `ALT + M` Start or Stop player

# To-do
- [x] Make to-do list
- [x] Add "Dropzone" when playlist empty
- [ ] Add setting to "Delay Music on Death" (make listening for footsteps easier)
- [ ] Add "Clear Playlist" button
- [ ] Add ability to move playlist items up/down
- [ ] Add ability to randomize playlist order
- [ ] Make "Splash Screen" explaining certain aspects
- [ ] Remember if user is in shuffle mode
- [ ] Add "CS:GO folder finder" on first startup to auto place cfg
- [ ] Add option to remember which song was last playing on exit
- [ ] Refine volume controls?
- [ ] Add "auto update" option OR some other way to update easily?
- [ ] Add Youtube/Stream support?

# Credits
- Originally forked from [BlackCetha/csgo-musicsync](https://github.com/BlackCetha/csgo-musicsync)
- Theme | [Framework7](http://framework7.io/)
