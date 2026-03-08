#!/usr/bin/env node
/**
 * 天机卷 品牌素材生成脚本
 * 使用 fal.ai flux-pro 批量生成修仙风格素材
 *
 * 用法: FAL_KEY=xxx node scripts/generate-assets.js
 */

import { fal } from '@fal-ai/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');

// Ensure assets directory exists
fs.mkdirSync(ASSETS_DIR, { recursive: true });

// Configure fal client
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('ERROR: FAL_KEY environment variable is required.');
  console.error('Usage: FAL_KEY=your_key_here node scripts/generate-assets.js');
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

// Asset definitions
const ASSETS = [
  // === Background textures (3 themes) ===
  {
    name: 'bg-ink',
    prompt: 'Seamless subtle background texture, traditional Chinese ink wash painting style, very faint misty mountains and clouds in light gray on cream rice paper, minimal, elegant, ethereal, ultra subtle, low contrast, light beige base, no text, no objects, abstract landscape hint',
    width: 1920,
    height: 1080,
  },
  {
    name: 'bg-jade',
    prompt: 'Seamless subtle background texture, translucent jade stone surface, very faint green-white veining pattern, soft ethereal glow, light mint-white base color, polished smooth, no text, no objects, abstract luxury material texture, low contrast',
    width: 1920,
    height: 1080,
  },
  {
    name: 'bg-dao',
    prompt: 'Seamless subtle background texture, plain rice paper with very faint bamboo leaf shadows, minimal zen aesthetic, warm white base, extremely subtle texture, clean and serene, no text, no objects, Japanese washi paper feel',
    width: 1920,
    height: 1080,
  },

  // === Module icons ===
  {
    name: 'icon-liuyao',
    prompt: 'Minimalist icon design, three ancient Chinese bronze coins stacked in a triangular arrangement, thin ink brush stroke style, on pure white background, Chinese divination theme, elegant and mystical, simple flat design with subtle gold and brown tones, no text',
    width: 512,
    height: 512,
  },
  {
    name: 'icon-meihua',
    prompt: 'Minimalist icon design, single plum blossom flower with five petals, thin Chinese ink brush stroke style, on pure white background, elegant and ethereal, delicate branches, simple flat design with subtle pink and brown tones, no text',
    width: 512,
    height: 512,
  },
  {
    name: 'icon-bazi',
    prompt: 'Minimalist icon design, four vertical rectangular pillars arranged side by side representing Four Pillars of Destiny, thin Chinese ink brush stroke style, on pure white background, subtle yin-yang symbols, simple flat design with warm brown tones, no text',
    width: 512,
    height: 512,
  },

  // === Header banner ===
  {
    name: 'banner',
    prompt: 'Wide panoramic banner, ethereal Chinese landscape, misty mountains with flowing clouds, cranes flying in distance, soft watercolor ink wash style, very light and airy, pastel tones on cream background, no text, dreamy immortal realm aesthetic, xianxia cultivation world, ultra wide aspect ratio',
    width: 1920,
    height: 300,
  },

  // === Decorative divider ===
  {
    name: 'divider',
    prompt: 'Horizontal decorative divider line, traditional Chinese cloud and wave pattern, symmetric ornamental design, thin elegant line art in light brown ink on transparent white background, no text, minimal, subtle, horizontal seamless pattern',
    width: 1920,
    height: 60,
  },

  // === Coin animation assets ===
  {
    name: 'coin-front',
    prompt: 'Extreme close-up of single ancient Chinese bronze coin filling the entire frame edge to edge, front face showing Chinese characters 开元通宝, round coin with square center hole, aged patina bronze green-brown color, detailed relief texture, top-down flat lay view, the coin occupies 100% of the image with zero background visible, antique numismatic macro photography, high detail',
    width: 512,
    height: 512,
  },
  {
    name: 'coin-back',
    prompt: 'Extreme macro close-up photograph of ancient Chinese bronze coin back face, the coin surface completely fills the entire frame with no background visible at all, smooth worn surface with faint crescent moon mark near the square center hole, aged green-brown bronze patina with oxidation, detailed metal texture fills every pixel of the image, museum macro photography style, no edges of coin visible',
    width: 512,
    height: 512,
  },

  // === Dark theme background ===
  {
    name: 'bg-dark',
    prompt: 'Seamless subtle background texture, dark mystical night sky with very faint stars, distant misty mountains silhouette, deep navy blue-black color, ethereal celestial atmosphere, Chinese xianxia cultivation aesthetic, extremely subtle, low contrast on dark base, no text, no bright objects, moody and serene',
    width: 1920,
    height: 1080,
  },
];

async function generateAsset(asset) {
  const filename = `${asset.name}.webp`;
  const filepath = path.join(ASSETS_DIR, filename);

  // Skip if already exists
  if (fs.existsSync(filepath)) {
    console.log(`⏭️  ${filename} already exists, skipping`);
    return;
  }

  console.log(`🎨 Generating ${filename} (${asset.width}×${asset.height})...`);
  console.log(`   Prompt: ${asset.prompt.substring(0, 80)}...`);

  try {
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input: {
        prompt: asset.prompt,
        image_size: {
          width: asset.width,
          height: asset.height,
        },
        num_images: 1,
        output_format: 'jpeg',
        guidance_scale: 3.5,
        num_inference_steps: 28,
        safety_tolerance: '5',
      },
      logs: false,
    });

    const imageUrl = result.data.images[0].url;
    console.log(`   📥 Downloading from ${imageUrl.substring(0, 60)}...`);

    // Download and save
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    console.log(`   ✅ Saved ${filename} (${sizeMB} MB)`);
  } catch (err) {
    console.error(`   ❌ Failed to generate ${filename}:`, err.message);
  }
}

async function main() {
  console.log('=== 天机卷 品牌素材生成 ===');
  console.log(`Output: ${ASSETS_DIR}`);
  console.log(`Total assets: ${ASSETS.length}`);
  console.log('');

  // Generate in batches of 3 (parallel within batch)
  const BATCH_SIZE = 3;
  for (let i = 0; i < ASSETS.length; i += BATCH_SIZE) {
    const batch = ASSETS.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(generateAsset));
    console.log('');
  }

  console.log('=== Done! ===');

  // List generated files
  const files = fs.readdirSync(ASSETS_DIR);
  console.log(`\nGenerated files in ${ASSETS_DIR}:`);
  files.forEach(f => {
    const stat = fs.statSync(path.join(ASSETS_DIR, f));
    console.log(`  ${f} (${(stat.size / 1024).toFixed(0)} KB)`);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
