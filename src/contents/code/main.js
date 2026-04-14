
function loadConfiguration() {
  var CFG = {
    "Home_Docked": `[{"h":1600,"w":2560,"x":0,"y":210},{"h":2160,"w":3840,"x":2560,"y":0}]`,
    "Work_Docked": `[{"h":1600,"w":2560,"x":0,"y":0},{"h":2160,"w":3840,"x":2560,"y":0}]`,
    "Mobile_Only": `[{"h":1600,"w":2560,"x":0,"y":0}]`,
  }

  // IDE
  CFG["Home_Docked_IDE"] = `{"c":${CFG["Home_Docked"]},"d":[0,1],"h":2100,"w":1908,"x":2568,"y":8}`;
  CFG["Work_Docked_IDE"] = `{"c":${CFG["Work_Docked"]},"d":[0,1],"h":2100,"w":1908,"x":2568,"y":8}`;
  CFG["Mobile_Only_IDE"] = `{"c":${CFG["Mobile_Only"]},"d":[0,1],"h":1540,"w":1702,"x":8,"y":8}`;
    
  // Dev Terminal
  CFG["Home_Docked_DevTerminal"] = `{"c":${CFG["Home_Docked"]},"d":[0],"h":2100,"w":950,"x":4484,"y":8}`;
  CFG["Work_Docked_DevTerminal"] = `{"c":${CFG["Work_Docked"]},"d":[0],"h":2100,"w":950,"x":4484,"y":8}`;
  CFG["Mobile_Only_DevTerminal"] = `{"c":${CFG["Mobile_Only"]},"d":[0],"h":1540,"w":834,"x":1718,"y":8}`;
    
  // Dev Browser
  CFG["Home_Docked_DevBrowser"] = `{"c":${CFG["Home_Docked"]},"d":[0],"h":1046,"w":950,"x":5442,"y":8}`;
  CFG["Work_Docked_DevBrowser"] = `{"c":${CFG["Work_Docked"]},"d":[0],"h":1046,"w":950,"x":5442,"y":8}`;
  CFG["Mobile_Only_DevBrowser"] = `{"c":${CFG["Mobile_Only"]},"d":[1],"h":1540,"w":834,"x":1718,"y":8}`;
    
  // Research Browser
  CFG["Home_Docked_RnDBrowser"] = `{"c":${CFG["Home_Docked"]},"d":[2],"h":2100,"w":1908,"x":3526,"y":8}`;
  CFG["Work_Docked_RnDBrowser"] = `{"c":${CFG["Work_Docked"]},"d":[2],"h":2100,"w":1908,"x":3526,"y":8}`;
  CFG["Mobile_Only_RnDBrowser"] = `{"c":${CFG["Mobile_Only"]},"d":[2],"h":1540,"w":1702,"x":850,"y":8}`;
    
  // Research Terminal
  CFG["Home_Docked_RnDTerminal"] = `{"c":${CFG["Home_Docked"]}:"d":[2],"h":2100,"w":950,"x":2568,"y":8}`;
  CFG["Work_Docked_RnDTerminal"] = `{"c":${CFG["Work_Docked"]}:"d":[2],"h":2100,"w":950,"x":2568,"y":8}`;
  CFG["Mobile_Only_RnDTerminal"] = `{"c":${CFG["Mobile_Only"]},"d":[2],"h":1540,"w":834,"x":8,"y":8}`;
    
  // Spotify
  CFG["Home_Docked_Music"] = `{"c":${CFG["Home_Docked"]},"d":[0,1,2,3],"h":766,"w":1268,"x":8,"y":8}`;
  CFG["Work_Docked_Music"] = `{"c":${CFG["Work_Docked"]},"d":[0,1,2,3],"h":766,"w":1268,"x":8,"y":8}`;
  CFG["Mobile_Only_Music"] = `{"c":${CFG["Mobile_Only"]},"d":[3],"h":766,"w":1268,"x":8,"y":8}`;

  // Generate reverse lookup for configurations.
  var RCFG = {}
  Object.keys(CFG).forEach((key) => {
    rkey = CFG[key];
    if (!(rkey in RCFG)) {
      RCFG[rkey] = [];
    }
    if (!(key in RCFG[rkey])) {
      RCFG[rkey].push(key);
    }
  });

  var GROUPS = [
    { // IDE
      [CFG["Home_Docked"]]: CFG["Home_Docked_IDE"],
      [CFG["Work_Docked"]]: CFG["Work_Docked_IDE"],
      [CFG["Mobile_Only"]]: CFG["Mobile_Only_IDE"],
    },
    { // Dev Terminal
      [CFG["Home_Docked"]]: CFG["Home_Docked_DevTerminal"],
      [CFG["Work_Docked"]]: CFG["Work_Docked_DevTerminal"],
      [CFG["Mobile_Only"]]: CFG["Mobile_Only_DevTerminal"],
    },
    { // Dev Browser
      [CFG["Home_Docked"]]: CFG["Home_Docked_DevBrowser"],
      [CFG["Work_Docked"]]: CFG["Work_Docked_DevBrowser"],
      [CFG["Mobile_Only"]]: CFG["Mobile_Only_DevBrowser"],
    },
    { // Research Browser
      [CFG["Home_Docked"]]: CFG["Home_Docked_RnDBrowser"],
      [CFG["Work_Docked"]]: CFG["Work_Docked_RnDBrowser"],
      [CFG["Mobile_Only"]]: CFG["Mobile_Only_RnDBrowser"],
    },
    { // Research Terminal
      [CFG["Home_Docked"]]: CFG["Home_Docked_RnDTerminal"],
      [CFG["Work_Docked"]]: CFG["Work_Docked_RnDTerminal"],
      [CFG["Mobile_Only"]]: CFG["Mobile_Only_RnDTerminal"],
    },
    { // Spotify
      [CFG["Home_Docked"]]: CFG["Home_Docked_Music"],
      [CFG["Work_Docked"]]: CFG["Work_Docked_Music"],
      [CFG["Mobile_Only"]]: CFG["Mobile_Only_Music"],
    },
  ];

  // Generate reverse lookup for groups.
  var RGROUPS = {};
  // Build GROUPS reverse lookup
  GROUPS.forEach(function(group) {
    Object.keys(group).forEach(function(mode) {
      RGROUPS[group[mode]] = group;
      console.log(`[zonemech] RGROUPS key: ${group[mode]}`);
    });
  });

  return { GROUPS, RGROUPS, CFG, RCFG };
}
const { GROUPS, RGROUPS, CFG, RCFG } = loadConfiguration();


// Desktop index lookup by ID.
const DESKTOP_IDX_BY_ID = new Map();
workspace.desktops.forEach(function(desktop, idx) {
  console.log(`[zonemech] DESKTOP_IDX_BY_ID desktop ${desktop} key ${desktop.id} value ${idx}`);
  DESKTOP_IDX_BY_ID.set(desktop.id, idx);
});


function getCurrentMode() {
  let parts = workspace.screens.map(screen => {
    let g = screen.geometry;
    return '{"h":'+g.height+',"w":'+g.width+',"x":'+g.x+',"y":'+g.y+'}';
  });
  parts.sort();
  return '['+parts.join(",")+']';
}
var CURRENT_MODE = getCurrentMode();


//  Get workspace desktop indicies for windows' desktops as array.
function getDesktops(window) {
  var indicies = window.desktops.map(desktop => DESKTOP_IDX_BY_ID.get(desktop.id))
  indicies.sort();
  return indicies;
}


// Get a canonicalized representation of window position/size/desktops.
function getWindowFlatKey(window) {
  var g = window.frameGeometry;
  var gJson = '"h":' + g.height + ',"w":' + g.width + ',"x":' + g.x + ',"y":' + g.y;

  gJson = '"d":[' + getDesktops(window).join(",") + '],' + gJson;
  
  return '{"c":'+CURRENT_MODE+',' + gJson + '}';
}


// Return the entry put in the WINDOW_CACHE.
function windowEntry(window) {
  return { window: window, flat_key: getWindowFlatKey(window) };
}

/*

The intention with this script is to track a subset of windows based on their
position, size, and desktop settings. When different monitor configurations are
activated, we want the subset of tracked applications to be moved and resized
to locations that are appropriate for that environment. For example, I want my
IDE to take half of my 4K monitor when connected, but two-thirds of my laptop
when disconnected.

The general design is to have a collection of groups. Each group lists the
location, size, and desktops for a single monitor configuration. When the
script detects screensChanged event, it looks at what the previous state of
the windows were and if any windows match one of the groups, we move and
resize that window for the new monitor configuration.

! Plasma has some really dumb behaviors we need to hack around.

When screensChanged fires, it fires multiple times with different states. At
the moment, I believe the last event in the chain is what we want. Therefore
we create a timer object (screensChangedTimer) to determine when the event
has settled.

Additionally, when a screensChange event occurs, it automatically moves
windows around to "keep things visible". I have no idea what the algorithm
for this behavior looks like and its feels non-deterministic. Either way,
it affects my ability to track windows by watching their frameGeometryChanged
and desktopsChanged events because those events also fire when screensChanged.
The hacky work around is to have both a timer for frameGeometry and desktops
that only allows a update to the cache if a screensChanged doesn't occur
within the given settle down period. (In other words, a screensChanged event
will cancel any updates to frameGeometry or desktops before the timeout.

*/

var frameGeometryChangedTimer = null;
var desktopsChangedTimer = null;
var screensChangedTimer = null;

// Cache the flat_key of all windows.
const WINDOW_CACHE = {}

function trackWindow(window) {
    // if (window.internalId != '{9d9f551d-4049-4abe-81e7-cf1d710a2fca}') {
    //   return;
    // }

    // Store initial state from window's real state.
    WINDOW_CACHE[window.internalId] = windowEntry(window);
    console.log(`\n[zonemech] ${window.internalId}: ${window.caption} ${getWindowFlatKey(window)}`);

    window.frameGeometryChanged.connect(() => {
      // Cancel the previous timer if it exists
      if (frameGeometryChangedTimer !== null) {
          frameGeometryChangedTimer.stop();
          frameGeometryChangedTimer = null;
      }

      // Create a new QTimer
      frameGeometryChangedTimer = new QTimer();
      frameGeometryChangedTimer.interval = 500; // 500ms debounce window
      frameGeometryChangedTimer.singleShot = true;
      frameGeometryChangedTimer.timeout.connect(function() {
        frameGeometryChangedTimer = null;

        WINDOW_CACHE[window.internalId] = windowEntry(window);
        console.log(`[zonemech] ${window.internalId} Frame geometry updated. ${window.frameGeometry}`);
      });
    });


    // Track window desktop updates.
    window.desktopsChanged.connect(() => {
      // Cancel the previous timer if it exists
      if (desktopsChangedTimer !== null) {
          desktopsChangedTimer.stop();
          desktopsChangedTimer = null;
      }

      // Create a new QTimer
      desktopsChangedTimer = new QTimer();
      desktopsChangedTimer.interval = 500; // 500ms debounce window
      desktopsChangedTimer.singleShot = true;
      desktopsChangedTimer.timeout.connect(function() {
        desktopsChangedTimer = null;

        WINDOW_CACHE[window.internalId] = windowEntry(window);
        console.log(`\n[zonemech] ${window.internalId} Desktops updated. ${window.desktops}`);
      });
    });
}


function untrackWindow(window) {
    delete WINDOW_CACHE[window.internalId];
}


function handleOutputsUpdate() {
  screensChangedTimer = null;

  CURRENT_MODE = getCurrentMode();

  // console.log('[zonemech] vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
  // console.log(`[zonemech] New Current Mode: ${CURRENT_MODE}`);
  // console.log('[zonemech] ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

  Object.keys(WINDOW_CACHE).forEach(function(key) {
    var value = WINDOW_CACHE[key];
    //console.log(`[zonemech] ${value.window.internalId} Checking: ${value.flat_key}`)

    // Note: By the time we're here, Plasma has already !@#$ing moved the window.

    if (value.flat_key in RGROUPS) {
      var window = value.window;
      group = RGROUPS[value.flat_key];
      obj = JSON.parse(group[CURRENT_MODE]);

      //console.log(`[zonemech] ${window.internalId} From: ${value.flat_key}`);
      //console.log(`[zonemech] ${window.internalId} New Position: ${group[CURRENT_MODE]}`);

      newGeometry = { "x": obj.x, "y": obj.y, "width": obj.w, "height": obj.h };
      window.frameGeometry = newGeometry;
      window.desktops = obj.d.map(idx => workspace.desktops[idx]);

      //WINDOW_CACHE[key].flat_key = group[CURRENT_MODE];

      //console.log(`[zonemech] ${window.internalId} To: ${group[CURRENT_MODE]}`);
      //console.log(`[zonemech] ENDENDENDENDENDEND`);
    }

  });
}


function handleOutputsUpdateTiming() {
  // Cancel the previous timer if it exists
  if (screensChangedTimer !== null) {
    screensChangedTimer.stop();
    screensChangedTimer = null;
  }
  if (frameGeometryChangedTimer !== null) {
    frameGeometryChangedTimer.stop();
    frameGeometryChangedTimer = null;
  }
  if (desktopsChangedTimer !== null) {
    desktopsChangedTimer.stop();
    desktopsChangedTimer = null;
  }

  // Create a new QTimer
  screensChangedTimer = new QTimer();
  screensChangedTimer.interval = 500; // 500ms debounce window
  screensChangedTimer.singleShot = true;
  screensChangedTimer.timeout.connect(handleOutputsUpdate);
  screensChangedTimer.start();
}


function init() {
  workspace.screensChanged.connect(handleOutputsUpdateTiming);

  // Track all window geometries
  workspace.windowAdded.connect(trackWindow);
  workspace.windowRemoved.connect(untrackWindow);
  workspace.windowList().forEach(trackWindow);

  // Add a noticeable log entry for script restart.
  console.log('[zonemech] ');
  console.log('[zonemech] ');
  console.log('[zonemech] ');
  console.log(`[zonemech] Script loaded. Monitoring screen changes. ${Date.now()}`);
  console.log('[zonemech] ');
  console.log('[zonemech] ');
  console.log('[zonemech] ');

}

init();
