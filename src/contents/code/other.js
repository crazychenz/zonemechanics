// ─────────────────────────────────────────────────────────────────────────────
// WezTerm Placer — KWin Script for KDE Plasma 6 / Wayland
//
// Responds to monitor connect/disconnect events and places WezTerm into the
// correct zone geometry depending on whether you are docked or mobile.
//
// HOW TO FIND YOUR VALUES:
//
//   Output names:
//     Run:  kscreen-doctor --outputs
//     Look for something like "eDP-1" (laptop) or "HDMI-A-1" / "DP-1" (external).
//     The name is the string after "Output:" in each entry.
//
//   Zone geometries:
//     In KZones settings, zones are defined as percentages of the screen.
//     Convert those percentages to pixel coordinates based on your resolution,
//     or just hover KZones zone handles to read the pixel positions.
//     You can also run the following in the KWin scripting console (Alt+F2 → "wm console")
//     to print all current screen geometries:
//
//       var outputs = workspace.screens;
//       for (var i = 0; i < outputs.length; i++) {
//           var g = workspace.clientArea(KWin.MaximizeArea, outputs[i], workspace.currentDesktop);
//           print(outputs[i].name + ": x=" + g.x + " y=" + g.y + " w=" + g.width + " h=" + g.height);
//       }
//
// ─────────────────────────────────────────────────────────────────────────────

// ⚙️ CONFIGURE: The output name of your external 4K monitor.
// Find it with: kscreen-doctor --outputs
const EXTERNAL_OUTPUT_NAME = "DP-4";

// ⚙️ CONFIGURE: The output name of your laptop's built-in screen.
const LAPTOP_OUTPUT_NAME = "eDP-2";

// ⚙️ CONFIGURE: Zone geometry for WezTerm when DOCKED (external monitor present).
// This is the pixel rect of the KZone you want WezTerm in on the external monitor.
// { x, y, width, height } — x/y are absolute desktop coordinates.
// Example: right-half of a 3840×2160 external monitor positioned to the right of the laptop screen.
// Adjust x offset if your laptop screen is to the left of the external (e.g. laptop=1920px wide → external starts at x=1920).
const DOCKED_ZONE = {
    x: 1920,      // ⚙️ x offset of the zone on the full virtual desktop
    y: 0,         // ⚙️ y offset
    width: 1920,  // ⚙️ zone width (e.g. half of 3840px 4K monitor)
    height: 2160  // ⚙️ zone height (full height of 4K monitor)
};

// ⚙️ CONFIGURE: Zone geometry for WezTerm when MOBILE (laptop screen only).
// Example: right-half of a 1920×1200 laptop display.
const MOBILE_ZONE = {
    x: 960,       // ⚙️ right half of 1920px wide laptop screen
    y: 0,
    width: 960,
    height: 1200  // ⚙️ adjust to your laptop's vertical resolution
};

// ─────────────────────────────────────────────────────────────────────────────

function isExternalConnected() {
    var outputs = workspace.screens;
    for (var i = 0; i < outputs.length; i++) {
        if (outputs[i].name === EXTERNAL_OUTPUT_NAME) {
            return true;
        }
    }
    return false;
}

function findWeztermWindows() {
    var windows = workspace.windowList();
    var found = [];
    for (var i = 0; i < windows.length; i++) {
        var w = windows[i];
        // WezTerm sets resourceClass to "org.wezfurlong.wezterm" or just "wezterm"
        // Caption matching is a fallback. Adjust if needed.
        if (w.resourceClass && w.resourceClass.toLowerCase().indexOf("org.wezfurlong.wezterm") !== -1) {
            found.push(w);
        }
    }
    return found;
}

function placeWezterm() {
    var docked = isExternalConnected();
    var zone = docked ? DOCKED_ZONE : MOBILE_ZONE;
    var targetOutputName = docked ? EXTERNAL_OUTPUT_NAME : LAPTOP_OUTPUT_NAME;

    var weztermWindows = findWeztermWindows();
    if (weztermWindows.length === 0) {
        print("[wezterm-placer] No WezTerm windows found.");
        return;
    }

    for (var i = 0; i < weztermWindows.length; i++) {
        var w = weztermWindows[i];

        // Un-maximize first so geometry changes take effect
        if (w.maximized) {
            w.setMaximize(false, false);
        }

        // Set geometry — KWin Plasma 6 uses frameGeometry as a writable rect
        w.frameGeometry = Qt.rect(zone.x, zone.y, zone.width, zone.height);

        print("[wezterm-placer] Placed WezTerm → "
            + (docked ? "DOCKED" : "MOBILE")
            + " zone on " + targetOutputName
            + " [" + zone.x + "," + zone.y + " " + zone.width + "×" + zone.height + "]");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Wire up signals

// React to monitor connect/disconnect
workspace.screensChanged.connect(function () {
    print("[wezterm-placer] screensChanged fired — re-placing WezTerm.");
    // Small delay to let KWin finish reconfiguring outputs before we move windows
    var timer = Qt.createQmlObject('import QtQuick 2.0; Timer {}', workspace);
    timer.interval = 1500;
    timer.repeat = false;
    timer.triggered.connect(function () {
        placeWezterm();
        timer.destroy();
    });
    timer.start();
});

// Also place WezTerm when it first opens (in case it launches after a screen change)
workspace.windowAdded.connect(function (window) {
    if (window.resourceClass && window.resourceClass.toLowerCase().indexOf("org.wezfurlong.wezterm") !== -1) {
        print("[wezterm-placer] WezTerm window added — placing.");
        placeWezterm();
    }
});

print("[wezterm-placer] Script loaded. Monitoring screen changes.");

/*

# 1. Create the package directory
mkdir -p ~/.local/share/kwin/scripts/winmech/contents/code

# 2. Place the files (save the content above into these paths):
#    ~/.local/share/kwin/scripts/wezterm-placer/metadata.json
#    ~/.local/share/kwin/scripts/wezterm-placer/contents/code/main.js

# 3. Install and enable
kpackagetool6 --type KWin/Script --install ~/.local/share/kwin/scripts/winmech

# 4. Enable via kwriteconfig (or System Settings → Window Management → KWin Scripts)
kwriteconfig6 --file kwinrc --group Plugins --key winmechEnabled true
qdbus6 org.kde.KWin /KWin reconfigure

# 5. Watch logs to verify
journalctl -f QT_CATEGORY=kwin_scripting | grep winmech


*/
