
rm -rf $(realpath ~/.local/share/kwin/scripts/zonemechanics)
rsync -av src/ $(realpath ~/.local/share/kwin/scripts/zonemechanics)

#qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "zonemechanics"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "zonemechanics"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript ~/.local/share/kwin/scripts/zonemechanics/contents/code/main.js "zonemechanics"
#kwriteconfig6 --file kwinrc --group Plugins --key zonemechanicsEnabled true
#qdbus6 org.kde.KWin /KWin reconfigure
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.start
