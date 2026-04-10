

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
    "docked": { screen: EXTERNAL, vdesktops: [2], x: 3526, y: 8, width: 1908, height: 2100, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [2], x: 1718, y: 8, width: 834,  height: 1540, },
  },
  { // Research Terminal
    "docked": { screen: EXTERNAL, vdesktops: [2], x: 2568, y: 8, width: 950, height: 2100, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [2], x: 1718, y: 8, width: 834, height: 1540, },
  },
  { // Spotify
    "docked": { screen: EXTERNAL, vdesktops: [3], x: 2568, y: 8, width: 950, height: 1046, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [3], x: 1718, y: 8, width: 834, height: 1540, },
  },
  { // Chat Browser
    "docked": { screen: EXTERNAL, vdesktops: [3], x: 2568, y: 1062, width: 950, height: 1046, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [3], x: 1718, y: 8, width: 834,  height: 1540, },
  },
  { // Media Browser
    "docked": { screen: EXTERNAL, vdesktops: [3], x: 3526, y: 8, width: 1908, height: 2100, }, //GOOD
    "mobile": { screen: LAPTOP,   vdesktops: [3], x: 1718, y: 8, width: 834,  height: 1540, },
  },
];

/*

  PLAN:

  - Cache the environment mode (docked or mobile) when the script starts.

  - Track all window geometry updates via `frameGeometryChanged`. When a geometry matches any 
    of the definitions above, we cache/uncache the association with that environment mode.

    - Note: We also use `windowAdded` event to get new windows.

  - When screensChanged event triggers, cache the new environment mode and set the geometries
    for all of the associated windows as defined for the specified environment mode.

*/





////////////////////////////////////////////////////////////////////////

/*

{
  prevMode: "docked",
  nextMode: "mobile",
  byGeom: {
    _geom_summary_: [window0, window2, window3]
  }
}

*/


const windowGeometries = new Map();

function isDocked() {
    for (var i = 0; i < workspace.screens.length; i++) {
        if (workspace.screens[i].name === EXTERNAL) {
            return true;
        }
    }
    return false;
}


function trackWindow(window) {
    // Store geometry whenever it changes
    window.frameGeometryChanged.connect(function() {
        windowGeometries.set(window.internalId, {
            geometry: window.frameGeometry,
            output: window.output ? window.output.name : null
        });
    });
    // Store initial geometry immediately
    windowGeometries.set(window.internalId, {
        geometry: window.frameGeometry,
        output: window.output ? window.output.name : null
    });
}


function getWindowById(id) {
    return workspace.windowList().find(function(w) {
        return w.internalId === id;
    });
}


// "org.wezfurlong.wezterm"
function findWindowByPlacement(placement) {
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
  var docked = isDocked();

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

// Track future windows
workspace.windowAdded.connect(trackWindow);


workspace.windowRemoved.connect(function(window) {
    // These are all safe to read here:
    print("Removed:", window.caption);
    print("Geometry:", window.frameGeometry.x, window.frameGeometry.y,
                       window.frameGeometry.width, window.frameGeometry.height);
    print("Was on output:", window.output ? window.output.name : "unknown");
    print("Resource:", window.resourceName);
});


// React to screensChanged events.
workspace.screensChanged.connect(function () {
    console.log("[winmech] screensChanged fired — attempting to reset configured windows.");
    tryWindowPlacements();
});

workspace.screensChanged.connect(function() {
    // At this point workspace.screens reflects the NEW screen list.
    // Use windowGeometries for pre-change positions.
    workspace.windowList().forEach(function(window) {
        const cached = windowGeometries.get(window.internalId);
        if (!cached) return;

        // Check if the output this window was on still exists
        const outputStillExists = workspace.screens.some(
            s => s.name === cached.output
        );

        if (!outputStillExists) {
            // Reposition the window using cached geometry as a reference
            // e.g. move to primary screen, scaled/offset as needed
        }
    });
});


workspace.windowList().forEach(trackWindow);

console.log("[winmech] Script loaded. Monitoring screen changes.");




/*

var trackedWindows = new Map();

function trackWindow(window) {
    // Store initial state
    trackedWindows.set(window.internalId, {
        geometry: window.frameGeometry,
        output: window.output ? window.output.name : null
    });

    // Update cache when a drag/resize finishes
    window.moveResizedChanged.connect(function() {
        if (!window.move && !window.resize) {
            trackedWindows.set(window.internalId, {
                geometry: window.frameGeometry,
                output: window.output ? window.output.name : null
            });
        }
    });
}

workspace.windowList().forEach(trackWindow);
workspace.windowAdded.connect(trackWindow);

workspace.windowRemoved.connect(function(window) {
    trackedWindows.delete(window.internalId);
});

*/


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

