const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

https.get('https://marthysorthopaedic.com/index.php', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', async () => {
    const imgRegex = /<img[^>]+src="([^">]+logo[^">]*)"/gi;
    let match = imgRegex.exec(data);
    if (!match) {
        // just find any image that might be a logo
        const imgRegex2 = /<img[^>]+src="([^">]+)"/gi;
        while ((match = imgRegex2.exec(data)) !== null) {
            if (match[1].toLowerCase().includes('logo') || match[1].toLowerCase().includes('marthys')) {
                break;
            }
        }
    }
    
    let logoUrl = match ? match[1] : null;
    if (logoUrl && !logoUrl.startsWith('http')) {
        logoUrl = `https://marthysorthopaedic.com/${logoUrl}`;
    }
    
    console.log("Found logo:", logoUrl);
    
    if (logoUrl) {
        await prisma.manufacturer.update({
            where: { slug: 'marthys' },
            data: { logoUrl: logoUrl }
        });
        console.log("Updated Manufacturer logo in DB.");
    }
    await prisma.$disconnect();
  });
}).on('error', (err) => console.error(err));
