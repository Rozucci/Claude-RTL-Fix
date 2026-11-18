#!/bin/sh
# Rebuilds docs/demo rtl-fix off and on.{gif,mp4} from the engine's real output.
# macOS, with Google Chrome, bun and ffmpeg installed. Run from the repo root.
set -e
work=$(mktemp -d)
bun scripts/make-demo.ts "$work"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
set --
for f in fa-off fa-on ar-off ar-on he-off he-on; do
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="$work/profile" --force-device-scale-factor=2 \
    --window-size=860,480 --virtual-time-budget=4000 \
    --screenshot="$work/$f.png" "file://$work/$f.html" 2>/dev/null
  set -- "$@" -loop 1 -t 3 -framerate 25 -i "$work/$f.png"
done
fade="[0][1]xfade=transition=fade:duration=0.4:offset=2.6[v1];[v1][2]xfade=transition=fade:duration=0.4:offset=5.2[v2];[v2][3]xfade=transition=fade:duration=0.4:offset=7.8[v3];[v3][4]xfade=transition=fade:duration=0.4:offset=10.4[v4];[v4][5]xfade=transition=fade:duration=0.4:offset=13.0,scale=1280:-2:flags=lanczos,format=yuv420p[out]"
ffmpeg -y -loglevel error "$@" -filter_complex "$fade" -map "[out]" \
  -c:v libx264 -crf 20 -preset slow -movflags +faststart "docs/demo rtl-fix off and on.mp4"
ffmpeg -y -loglevel error -i "docs/demo rtl-fix off and on.mp4" \
  -vf "fps=10,scale=860:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
  -loop 0 "docs/demo rtl-fix off and on.gif"
rm -rf "$work"
echo "Wrote docs/demo rtl-fix off and on.gif and .mp4"
