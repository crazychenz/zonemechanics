

// Note: With two monitors, we have 3 modes: mobile, docked-dual, docked-single (laptop lid closed).
// Note: Each distinct entry in mode arrays are a distinct screen. DOCKED_DUAL-"eDP-2" != MOBILE_ONLY-"eDP-2".
// Note: We're layout dependent, hardware independent (i.e. no names.)

// Modes:
const DOCKED_DUAL = '[{"w":2560,"h":1600,"x":0,"y":210},{"w":3840,"h":2160,"x":2560,"y":0}]'; //DP-4+eDP-2
const MOBILE_ONLY = '[{"w":2560,"h":1600,"x":0,"y":0}]'; //eDP-2
const DOCKED_SINGLE = '[{"w":3840,"h":2160,"x":2048,"y":0}]'; //DP-4 (!BUG: The x _should_ be zero.)

const TRANSITION_GROUPS = [
  { // IDE
    DOCKED_DUAL: `{"c":${DOCKED_DUAL},"d":[0,1],"h":2100,"w":2559,"x":2568,"y":8}`, //GOOD
    MOBILE_ONLY: `{"c":${MOBILE_ONLY}:"d":[0,1],"h":1540,"w":1702,"x":8,"y":8}`,
  },
  { // Dev Terminal
    DOCKED_DUAL: `{"c":${DOCKED_DUAL},"d":[0],"h":2100,"w":950,"x":4484,"y":8}`, //GOOD
    MOBILE_ONLY: `{"c":${MOBILE_ONLY},"d":[0],"h":1540,"w":834,"x":1718,"y":8}`, //GOOD
  },
  { // Dev Browser
    DOCKED_DUAL: `{"c":${DOCKED_DUAL},"d":[0],"h":1046,"w":950,"x":5442,"y":8}`, //GOOD
    MOBILE_ONLY: `{"c":${MOBILE_ONLY},"d":[1],"h":1540,"w":834,"x":1718,"y":8}`, //GOOD
  },
  // { // Research Browser
  //   DOCKED_DUAL: { vdesktops: [2], width: 1908, height: 2100, x: 3526, y: 8,  }, //GOOD
  //   MOBILE_ONLY: { vdesktops: [2], width: 834,  height: 1540, x: 1718, y: 8,  },
  // },
  // { // Research Terminal
  //   DOCKED_DUAL: { vdesktops: [2], width: 950, height: 2100, x: 2568, y: 8,  }, //GOOD
  //   MOBILE_ONLY: { vdesktops: [2], width: 834, height: 1540, x: 1718, y: 8,  },
  // },
  // { // Spotify
  //   DOCKED_DUAL: { vdesktops: [3], width: 950, height: 1046, x: 2568, y: 8,  }, //GOOD
  //   MOBILE_ONLY: { vdesktops: [3], width: 834, height: 1540, x: 1718, y: 8,  },
  // },
  // { // Chat Browser
  //   DOCKED_DUAL: { vdesktops: [3], width: 950, height: 1046, x: 2568, y: 1062,  }, //GOOD
  //   MOBILE_ONLY: { vdesktops: [3], width: 834,  height: 1540, x: 1718, y: 8,  },
  // },
  // { // Media Browser
  //   DOCKED_DUAL: { vdesktops: [3], width: 1908, height: 2100, x: 3526, y: 8, }, //GOOD
  //   MOBILE_ONLY: { vdesktops: [3], width: 834,  height: 1540, x: 1718, y: 8,  },
  // },
];


// TODO: Create a flat object of flat keys that each map to the transition group. (Reverse Group Lookup)
// TODO: When a window is tracked, resized, or moved:
// TODO:   - Re-calculate the flat_key.
// TODO: When there is a screenChange, for each window:
// TODO:   - If the window's flat_key is in "transition group reverse lookup" keys
// TODO:     - Use GROUP[CURRENT_MODE] to get the desired window attrs. Parse and apply.


// Cache the flat_key of all windows.
const WINDOW_CACHE = new Map();

// All of the windows currently mapped to each active group member.
const TRANSITION_RLUT = {};

// Desktop index lookup by ID.
const DESKTOP_IDX_BY_ID = new Map();
// TODO: Need a way to track changes here?
// TODO: TEST: Does this work across activities?
workspace.desktops.forEach(function(desktop, idx) {
  console.log(`[zonemech] DESKTOP_IDX_BY_ID key ${desktop.id} value ${idx}`);
  DESKTOP_IDX_BY_ID.set(desktop.id, idx);
});


function getCurrentMode() {
  let parts = workspace.screens.map(screen => {
    let g = screen.geometry;

    return '{"w":'+g.width+',"h":'+g.height+',"x":'+g.x+',"y":'+g.y+'}';
  });

  parts.sort();

  return '['+parts.join(",")+']';
}
var CURRENT_MODE = getCurrentMode();


function getFlatKey(window) {
  // '{"d":[0,1],"h":1540,"w":1702,"x":8,"y":8}'

  var g = window.frameGeometry;
  var gJson = '"h":' + g.height + ',"w":' + g.width + ',"x":' + g.x + ',"y":' + g.y;

  
  var indicies = window.desktops.map(desktop => DESKTOP_IDX_BY_ID.get(desktop.id))
  indicies.sort();
  gJson = '"d":[' + indicies.join(",") + '],' + gJson;
  
  return '{"c":'+CURRENT_MODE+',' + gJson + '}';
}


function trackWindow(window) {

    // Store initial state
    WINDOW_CACHE.set(window.internalId, {
        window: window,
        flat_key: getFlatKey(window),
    });
    //console.log(`[zonemech] Initial, window ${window.internalId} to flat_key ${getFlatKey(window)}.`);

    // Update cache when a drag/resize finishes (in contrast to 
    // frameGeometryChanged that happens while dragging.)
    window.moveResizedChanged.connect(function() {
        if (window.move || window.resize) {
          WINDOW_CACHE.set(window.internalId, {
              window: window,
              flat_key: getFlatKey(window),
          });
          //console.log(`[zonemech] Position/Size, window ${window.internalId} to flat_key ${getFlatKey(window)}.`);
        }

        //console.log("[zonemech] Updating geometry cache for windowInternalId: " + window.internalId);
    });

    // Track window desktop updates.
    window.desktopsChanged.connect(() => {
        WINDOW_CACHE.set(window.internalId, {
            window: window,
            flat_key: getFlatKey(window),
        });
        //console.log(`[zonemech] Desktop, window ${window.internalId} to flat_key ${getFlatKey(window)}.`);
    });

    //console.log("[zonemech] Added window to cache with internalId: " + window.internalId);
}


function untrackWindow(window) {
    // TODO: Delete all the window memberships.
    WINDOW_CACHE.delete(window.internalId);
    //console.log("[zonemech] Removed window to cache with internalId: " + window.internalId);
}


// React to screensChanged events.
workspace.screensChanged.connect(function () {
    CURRENT_MODE = getCurrentMode()
    //console.log(`[zonemech] New Current Mode: ${CURRENT_MODE}`);
    WINDOW_CACHE.forEach(function(value, key) {
      //console.log(`[zonemech] Checking ${value.flat_key}`);
      if (value.flat_key in TRANSITION_RLUT) {
        //console.log(`[zonemech] XXXXX ${value.window.caption} found in TRANSITION_RLUT, doing transition to: ${value.flat_key}`)
        group = TRANSITION_RLUT[value.flat_key];
        obj = JSON.parse(group[CURRENT_MODE]);
        var window = value.window;

        window.frameGeometry = { "x": obj.x, "y": obj.y, "width": obj.w, "height": obj.h };
        window.desktops = obj.d.map(idx => workspace.desktops[idx]);
      }

    });
});


// Track all window geometries
workspace.windowAdded.connect(trackWindow);
workspace.windowRemoved.connect(untrackWindow);
workspace.windowList().forEach(trackWindow);


// Build TRANSITION_GROUPS reverse lookup
TRANSITION_GROUPS.forEach(function(group) {
  Object.keys(group).forEach(function(mode) {
    TRANSITION_RLUT[group[mode]] = group;
    //console.log(`[zonemech] Adding flat_key ${group[mode]} to RLUT.`);
  });
});


//console.log(`[zonemech] Desktops: ${workspace.desktops.map(desktop => desktop.id)}`);
//console.log(`[zonemech] Current Mode: ${getCurrentMode()}`);
console.log("[zonemech] Script loaded. Monitoring screen changes.");







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

