VST-Plugin like application using typescript and the Web Audio API; the user can select a local .mp3 file to preview with FX and then download the edited version.

TODO: Need to test recent push locally; then adapt to output other filetypes maybe with the help of lame.js

How to build (compile from src/app.ts to dist/app.js then bundle dist/app.js into public/dist.bundle.js + public/dist.bundle.js.map):
- tsc && npm run prod
