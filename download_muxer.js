const fs = require('fs');
const https = require('https');

const url = 'https://unpkg.com/mp4-muxer@5.1.0/build/mp4-muxer.min.js';
const filename = 'mp4-muxer.min.js';

console.log(`Downloading ${filename}...`);

const file = fs.createWriteStream(filename);
https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log(`✅ ${filename} downloaded successfully!`);
        console.log(`   Size: ${fs.statSync(filename).size} bytes`);
    });
}).on('error', (err) => {
    fs.unlink(filename, () => { });
    console.error(`❌ Error downloading ${filename}:`, err.message);
});
