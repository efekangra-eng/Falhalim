const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#6b21a8'; // Purple 800
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size/2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F', size/2, size/2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
}

createIcon(192, 'public/icon-192.png');
createIcon(512, 'public/icon-512.png');
