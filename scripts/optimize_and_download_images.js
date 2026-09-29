const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DIRS = {
  manufacturers: path.join(__dirname, '..', 'public', 'images', 'manufacturers'),
  categories: path.join(__dirname, '..', 'public', 'images', 'categories'),
  products: path.join(__dirname, '..', 'public', 'images', 'products'),
};

for (const dir of Object.values(DIRS)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fetchBuffer(rawUrl, retries = 3) {
  return new Promise((resolve, reject) => {
    // Handle URL encoding (e.g. spaces, special chars)
    let parsedUrl;
    try {
      parsedUrl = new URL(rawUrl);
    } catch (e) {
      return reject(new Error(`Invalid URL: ${rawUrl}`));
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.get(parsedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 20000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect
        const redirectUrl = new URL(res.headers.location, parsedUrl.href).href;
        return fetchBuffer(redirectUrl, retries - 1).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        if (retries > 0) {
          setTimeout(() => fetchBuffer(rawUrl, retries - 1).then(resolve).catch(reject), 1000);
          return;
        }
        return reject(new Error(`HTTP ${res.statusCode} for ${rawUrl}`));
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => fetchBuffer(rawUrl, retries - 1).then(resolve).catch(reject), 1500);
      } else {
        reject(err);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) {
        setTimeout(() => fetchBuffer(rawUrl, retries - 1).then(resolve).catch(reject), 1500);
      } else {
        reject(new Error(`Timeout fetching ${rawUrl}`));
      }
    });
  });
}

// Simple concurrency runner
async function runConcurrent(items, concurrency, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      try {
        const res = await fn(items[i], i);
        results[i] = { success: true, res };
      } catch (err) {
        results[i] = { success: false, err, item: items[i] };
      }
    }
  }

  const workers = Array(Math.min(concurrency, items.length)).fill(0).map(() => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('=== STARTING IMAGE OPTIMIZATION & LOCALIZATION ===\n');

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  // 1. Manufacturers
  console.log('1. Processing Manufacturers...');
  const manufacturers = await prisma.manufacturer.findMany();
  for (const mfr of manufacturers) {
    if (!mfr.logoUrl || mfr.logoUrl.startsWith('/images/')) continue;
    try {
      console.log(` Downloading logo for [${mfr.slug}]: ${mfr.logoUrl}`);
      const buf = await fetchBuffer(mfr.logoUrl);
      totalOriginalBytes += buf.length;

      const filename = `${mfr.slug}.webp`;
      const outPath = path.join(DIRS.manufacturers, filename);
      const webpBuf = await sharp(buf)
        .resize({ width: 400, height: 200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();

      fs.writeFileSync(outPath, webpBuf);
      totalOptimizedBytes += webpBuf.length;

      const localPath = `/images/manufacturers/${filename}`;
      await prisma.manufacturer.update({
        where: { id: mfr.id },
        data: { logoUrl: localPath }
      });
      console.log(`  -> Saved ${localPath} (${(buf.length/1024).toFixed(1)} KB -> ${(webpBuf.length/1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`  x Failed to optimize logo for ${mfr.slug}:`, e.message);
    }
  }

  // 2. Categories
  console.log('\n2. Processing Categories...');
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (!cat.imageUrl || cat.imageUrl.startsWith('/images/')) continue;
    try {
      console.log(` Downloading category [${cat.slug}]: ${cat.imageUrl}`);
      const buf = await fetchBuffer(cat.imageUrl);
      totalOriginalBytes += buf.length;

      const filename = `${cat.slug}.webp`;
      const outPath = path.join(DIRS.categories, filename);
      const webpBuf = await sharp(buf)
        .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      fs.writeFileSync(outPath, webpBuf);
      totalOptimizedBytes += webpBuf.length;

      const localPath = `/images/categories/${filename}`;
      await prisma.category.update({
        where: { id: cat.id },
        data: { imageUrl: localPath }
      });
      console.log(`  -> Saved ${localPath} (${(buf.length/1024).toFixed(1)} KB -> ${(webpBuf.length/1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`  x Failed to optimize category ${cat.slug}:`, e.message);
    }
  }

  // 3. Products
  console.log('\n3. Processing Products...');
  const products = await prisma.product.findMany();
  const prodsToProcess = products.filter(p => p.imageUrl && !p.imageUrl.startsWith('/images/'));
  console.log(` Found ${prodsToProcess.length} products to download and optimize.`);

  let processedCount = 0;
  let successCount = 0;
  let failCount = 0;

  await runConcurrent(prodsToProcess, 4, async (p, idx) => {
    try {
      const buf = await fetchBuffer(p.imageUrl);
      totalOriginalBytes += buf.length;

      // Clean filename from product id, e.g. mrt-0001.webp
      const cleanId = p.id.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const filename = `${cleanId}.webp`;
      const outPath = path.join(DIRS.products, filename);

      const webpBuf = await sharp(buf)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      fs.writeFileSync(outPath, webpBuf);
      totalOptimizedBytes += webpBuf.length;

      const localPath = `/images/products/${filename}`;
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: localPath }
      });

      successCount++;
      processedCount++;
      if (processedCount % 10 === 0 || processedCount === prodsToProcess.length) {
        console.log(` [${processedCount}/${prodsToProcess.length}] Processed products... (latest: ${p.id})`);
      }
    } catch (e) {
      failCount++;
      processedCount++;
      console.error(` x [${p.id}] Failed: ${e.message} (URL: ${p.imageUrl})`);
    }
  });

  console.log('\n=============================================');
  console.log('OPTIMIZATION SUMMARY:');
  console.log(`Total Products Processed: ${processedCount} (Success: ${successCount}, Failed: ${failCount})`);
  console.log(`Original Total Size:    ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Optimized WebP Size:    ${(totalOptimizedBytes / (1024 * 1024)).toFixed(2)} MB`);
  if (totalOriginalBytes > 0) {
    const saved = ((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1);
    console.log(`Bandwidth Saved:        ${saved}%`);
  }
  console.log('=============================================\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error during optimization:', err);
  prisma.$disconnect();
  process.exit(1);
});
