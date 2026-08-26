const https = require('https');

https.get('https://marthysorthopaedic.com/product3?merk=marthys', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    // Extract background images from style tags or img tags
    const imgRegex = /<img[^>]+src="([^">]+)"/gi;
    let match;
    const images = new Set();
    while ((match = imgRegex.exec(data)) !== null) {
      images.add(match[1]);
    }
    
    // Also check for background-image
    const bgRegex = /background-image:\s*url\('?([^')]+)'?\)/gi;
    while ((match = bgRegex.exec(data)) !== null) {
      images.add(match[1]);
    }

    console.log("Found Images:");
    Array.from(images).filter(img => img.includes('dist/')).forEach(img => {
      console.log(`https://marthysorthopaedic.com/${img}`);
    });
  });
}).on('error', (err) => {
  console.error(err);
});
