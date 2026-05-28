const fs = require('fs');
let code = fs.readFileSync('D:/Mindmetric/frontend/src/NumberCometGame.jsx', 'utf8');
code = code.replace(/const getEmoji =[\s\S]*?};/, `const getEmoji = (name) => {
    switch (name) {
      case 'star': return '⭐';
      case 'asteroid': return '🪨';
      case 'planet': return '🪐';
      case 'ufo': return '🛸';
      case 'pumpkin': return '🎃';
      case 'apple': return '🍎';
      default: return name || '?';
    }
  };`);
fs.writeFileSync('D:/Mindmetric/frontend/src/NumberCometGame.jsx', code, 'utf8');
console.log("Fixed emojis");
