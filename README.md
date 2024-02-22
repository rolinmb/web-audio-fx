VST-Plugin like application using typescript and the Web Audio API; the user can select a local .mp3 file to preview with FX and then download the edited version.

How to build (compile from src/app.ts to dist/app.js then bundle dist/app.js into public/dist.bundle.js + public/dist.bundle.js.map):
- tsc && npm run prod

TODO:
- actually implement rendering effected audio stream to new .mp3 file for user to download (need to learn more about the WebAudio API and how to encode .mp3; likely need to use byte arrays and potentially other npm packages)