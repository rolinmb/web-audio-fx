VST-Plugin like application using typescript and the Web Audio API; the user can select a local .mp3 file to preview with FX and then download the edited version.

TODO: Need to convert PCM blob to .wav then to .mp3 or something else for users to download; lamejs currently not an option to convert thus need to implement manually

How to build (compile from src/app.ts to dist/app.js then bundle dist/app.js into public/dist.bundle.js + public/dist.bundle.js.map):
- tsc && npm run prod
