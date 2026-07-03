const fs = require('fs');
const https = require('https');

const files = [
    {
        url: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        name: 'ffmpeg-core.js'
    },
    {
        url: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.wasm',
        name: 'ffmpeg-core.wasm'
    }
];

files.forEach(file => {
    console.log(`Downloading ${file.name}...`);
    const fileStream = fs.createWriteStream(file.name);
    https.get(file.url, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`✅ ${file.name} downloaded successfully!`);
        });
    }).on('error', (err) => {
        console.error(`❌ Error downloading ${file.name}:`, err.message);
    });
});
