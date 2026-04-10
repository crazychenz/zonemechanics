
#qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "winmech"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "winmech"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript ~/.local/share/kwin/scripts/winmech/contents/code/main.js "winmech"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.start
