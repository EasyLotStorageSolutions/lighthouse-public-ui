# Video playback dependency

`hls.light.min.js` is the unmodified minified light build of hls.js 1.6.13, obtained from the npm package `hls.js@1.6.13`. Its license is preserved in `hls-LICENSE`.

The Marketplace uses native HLS playback when available and loads this local dependency on pages containing video otherwise. Video does not autoplay. No CDN script is loaded at runtime.
