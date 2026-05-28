const https = require('https');
const fs = require('fs');
const destDir = 'D:/mindmetric/frontend/public/audio/answers/';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const download = (num) => {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${num}`;
  const file = fs.createWriteStream(`${destDir}${num}.mp3`);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${num}`);
    });
  }).on('error', (err) => {
    fs.unlink(`${destDir}${num}.mp3`, () => {});
    console.error(`Error downloading ${num}: ${err.message}`);
  });
};

for (let i = 0; i <= 20; i++) {
  download(i);
}
