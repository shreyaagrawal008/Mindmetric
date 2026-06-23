const fs = require('fs');
let css = fs.readFileSync('src/SodaCanFactoryGame.css', 'utf8');

const newCss = css.replace(/(-?\d+(?:\.\d+)?)px/g, (match, p1) => {
    const val = parseFloat(p1);
    if (val <= 2 && val >= -2) return match; // don't scale small borders
    return Math.round(val * 0.7) + 'px';
});

fs.writeFileSync('src/SodaCanFactoryGame.css', newCss);
console.log('Scaled CSS successfully!');
