
if [ ! -e '~/.local/share/kwin/scripts/zonemechanics' ]; then
  rm -rf $(realpath ~/.local/share/kwin/scripts/zonemechanics)
  rsync -av src/ $(realpath ~/.local/share/kwin/scripts/zonemechanics)
fi

#qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "zonemechanics"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "zonemechanics"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript ~/.local/share/kwin/scripts/zonemechanics/contents/code/main.js "zonemechanics"
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.start
