const https = require('https');

https.get('https://marthysorthopaedic.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const imgRegex = /<img[^>]+src="([^">]+)"/gi;
    let match;
    console.log("Images found:");
    while ((match = imgRegex.exec(data)) !== null) {
      console.log(match[1]);
    }
  });
}).on('error', (err) => console.error(err));
