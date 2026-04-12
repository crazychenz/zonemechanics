

// Output names: `kscreen-doctor --outputs`
const EXTERNAL = "DP-4";
const LAPTOP = "eDP-2";

const TRANSITIONS = [
  { // IDE
    "docked": { screen: EXTERNAL, vdesktops: [0, 1], x: 2568, y: 8, width: 2559, height: 2100, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [0, 1], x: 8,    y: 8, width: 1702, height: 1540, }, //GOOD
  },
  { // Dev Terminal
    "docked": { screen: EXTERNAL, vdesktops: [0], x: 4484, y: 8, width: 950, height: 2100, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [0], x: 1718, y: 8, width: 834, height: 1540, }, //GOOD
  },
  { // Dev Browser
    "docked": { screen: EXTERNAL, vdesktops: [0], x: 5442, y: 8, width: 950, height: 1046, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [1], x: 1718, y: 8, width: 834, height: 1540, }, //GOOD
  },
  { // Research Browser
    "docked": { screen: EXTERNAL, vdesktops: [2], x: 2568, y: 8, width: 2559, height: 2100, },
    "mobile": { screen: LAPTOP,   vdesktops: [2], x: 1718, y: 8, width: 834,  height: 1540, },
  },
  { // Research Terminal
    "docked": { screen: EXTERNAL, vdesktops: [2], x: 2568, y: 8, width: 950, height: 2100, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [2], x: 1718, y: 8, width: 834, height: 1540, },
  },
  { // Spotify
    "docked": { screen: EXTERNAL, vdesktops: [3], x: 2568, y: 8, width: 950, height: 1046, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [1], x: 1718, y: 8, width: 834, height: 1540, },
  },
  { // Chat Browser
    "docked": { screen: EXTERNAL, vdesktops: [0], x: 2568, y: 1062, width: 950, height: 1046, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [1], x: 1718, y: 8, width: 834,  height: 1540, },
  },
  { // Media Browser
    "docked": { screen: EXTERNAL, vdesktops: [0], x: 2568, y: 8, width: 2559, height: 2100, },
    "mobile": { screen: LAPTOP,   vdesktops: [1], x: 1718, y: 8, width: 834,  height: 1540, },
  },
]






// Get window position and sizes with:
//   qdbus6 org.kde.KWin /KWin org.kde.KWin.queryWindowInfo
const WINDOW_CFGS = {
  //wezterm-ide-desktop1 - consider a terminal based IDE
  "com.vscodium.codium-ide-desktop1and2": {
    "docked": { screen: EXTERNAL, x: 2568, y: 8, width: 2559, height: 2100, vdesktops: [0, 1] },
    "mobile": { screen: LAPTOP,   x: 8, y: 8, width: 1702,  height: 1540, vdesktops: [0, 1] },
  },
  "org.wezfurlong.wezterm-terminal-desktop1": {
    "docked": { screen: EXTERNAL, x: 5135, y: 8, width: 1257, height: 2100, vdesktops: [0] },
    "mobile": { screen: LAPTOP,   x: 1718, y: 8, width: 834,  height: 1540, vdesktops: [0] },
  },
  "app.zen_browser.zen-browser-desktop2": {
    "docked": { screen: EXTERNAL, x: 5135, y: 8, width: 1257, height: 2100, vdesktops: [1] },
    "mobile": { screen: LAPTOP,   x: 1718, y: 8, width: 834,  height: 1540, vdesktops: [1] },
  },
  /*
  "zen-browser-desktop3": {
    "docked": { x: 3833, y: 8, width: 1295, height: 2100 },
    "mobile": { x: 1718, y: 8, width: 834,  height: 1540 },
  },
  "wezterm-terminal-desktop3": {
    "docked": { x: 3833, y: 8, width: 1295, height: 2100 },
    "mobile": { x: 1718, y: 8, width: 834,  height: 1540 },
  },
  "zen-media-desktop4": {
    "docked": { x: 3833, y: 8, width: 1295, height: 2100 },
    "mobile": { x: 1718, y: 8, width: 834,  height: 1540 },
  },
  "spotify-media-desktop4": {
    "docked": { x: 3833, y: 8, width: 1295, height: 2100 },
    "mobile": { x: 1718, y: 8, width: 834,  height: 1540 },
  },
  "zen-chat-desktop4": {
    "docked": { x: 3833, y: 8, width: 1295, height: 2100 },
    "mobile": { x: 1718, y: 8, width: 834,  height: 1540 },
  },
  */
};






////////////////////////////////////////////////////////////////////////


function isExternalConnected() {
    for (var i = 0; i < workspace.screens.length; i++) {
        if (workspace.screens[i].name === EXTERNAL) {
            return true;
        }
    }
    return false;
}


// "org.wezfurlong.wezterm"
function findWindowByClass(class_name) {
    var windows = workspace.windowList();
    var found = [];
    for (var i = 0; i < windows.length; i++) {
        var w = windows[i];
        if (w.resourceClass && w.resourceClass.toLowerCase().indexOf(class_name) !== -1) {
            found.push(w);
        }
    }
    return found;
}


function tryWindowPlacements() {
  var docked = isExternalConnected();

  for (var class_name in WINDOW_CFGS) {
    console.log("Looking for windows with class: " + class_name);

    var cfg = docked ? WINDOW_CFGS[class_name].docked : WINDOW_CFGS[class_name].mobile;

    // Note: I don't think we need the screen because the stable arrangement accounts for it atm.
    //var tgt_screen = tgt_config.screen;

    var tgt_windows = findWindowByClass(class_name);
    if (tgt_windows.length === 0) {
      console.log("[winmech] No " + class_name + " windows found.");
      continue;
    }

    for (var i = 0; i < tgt_windows.length; i++) {

      var tgt = tgt_windows[i];

      // To be maximized is not the way.
      if (tgt.maximized) tgt.setMaximize(false, false);

      // Set the position and size of tgt window.
      tgt.frameGeometry = { "x": cfg.x, "y": cfg.y, "width": cfg.width, "height": cfg.height };

      // Set the window's associated virtual desktops
      var tgt_desktops = [];
      for (var idx in cfg.vdesktops) {
        tgt_desktops.push(workspace.desktops[idx]);
      }
      tgt.desktops = tgt_desktops;

      console.log("[winmech] Placed " + class_name + " window using " + (docked ? "DOCKED" : "MOBILE"));

    }
  }
}


// React to screensChanged events.
workspace.screensChanged.connect(function () {
    console.log("[winmech] screensChanged fired — attempting to reset configured windows.");
    tryWindowPlacements();
});


// Optionally, place windows when they first opens (since they miss the screen event).
// TODO: This is currently a mess and needs rewrite.
/*
workspace.windowAdded.connect(function (window) {
  for (var class_name in WINDOW_CFGS) {
    if (window.resourceClass && window.resourceClass.toLowerCase().indexOf("org.wezfurlong.wezterm") !== -1) {
      console.log("[winmech] WezTerm window added — placing.");
      tryWindowPlacements();
    }
  }
});
*/

console.log("[winmech] Script loaded. Monitoring screen changes.");



/*

Install and enable:

```
kpackagetool6 --type KWin/Script --install ~/.local/share/kwin/scripts/winmech
```

Enable the script (This can also be done via System Settings, Window Management, KWin Scripts):

```
kwriteconfig6 --file kwinrc --group Plugins --key winmechEnabled true
qdbus6 org.kde.KWin /KWin reconfigure
```

Watch logs with:

```
journalctl -f | grep winmech
```

Reload with:

```
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "winmech"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript ~/.local/share/kwin/scripts/winmech/contents/code/main.js "winmech"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.start
```

Check if loaded with:

```
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "winmech"
```

*/
