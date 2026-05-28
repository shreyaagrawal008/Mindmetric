const https = require('https');
const fs = require('fs');
const destDir = 'D:/mindmetric/frontend/public/audio/answers/';

const words = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"
];

const download = (num) => {
  const word = words[num];
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${word}`;
  const file = fs.createWriteStream(`${destDir}${num}.mp3`);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${num} as ${word}`);
    });
  }).on('error', (err) => {
    fs.unlink(`${destDir}${num}.mp3`, () => {});
    console.error(`Error downloading ${num}: ${err.message}`);
  });
};

for (let i = 0; i <= 20; i++) {
  download(i);
}
