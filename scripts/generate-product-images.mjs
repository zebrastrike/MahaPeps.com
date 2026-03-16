/**
 * MAHA Peptides — AI Product Image Generator
 *
 * Generates a DALL-E 3 image for every product, then composites
 * the MAHA logo onto it. Saves output to apps/web/public/products/
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-product-images.mjs
 *
 * Optional flags:
 *   --product "BPC-157"     only regenerate one product by name
 *   --skip-existing         skip products that already have an image
 *   --dry-run               print prompts without calling the API
 */

import OpenAI from 'openai';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const OUT_DIR   = path.join(ROOT, 'apps/web/public/products');
const LOGO_PATH = path.join(ROOT, 'apps/web/public/branding/maha-logo.png');

// ── CLI flags ────────────────────────────────────────────────────────────────
const args        = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const SKIP_EXIST  = args.includes('--skip-existing');
const ONLY_IDX    = args.indexOf('--product');
const ONLY_NAME   = ONLY_IDX !== -1 ? args[ONLY_IDX + 1]?.toLowerCase() : null;

// ── Products ──────────────────────────────────────────────────────────────────
// Each entry: { name, slug, prompt_hint }
// prompt_hint is extra context DALL-E uses for a better image.
const PRODUCTS = [
  { name: 'AOD-9604',             slug: 'aod-9604',          hint: 'modified growth hormone fragment, weight loss peptide, sleek silver vial' },
  { name: 'Oxytocin',             slug: 'oxytocin',          hint: 'bonding neuropeptide hormone, warm amber vial, social behavior research' },
  { name: 'PT-141',               slug: 'pt-141',            hint: 'melanocortin receptor agonist, deep violet vial, CNS pathway research' },
  { name: 'SS-31 (Elamipretide)', slug: 'ss-31',             hint: 'mitochondrial peptide, cellular energy, blue-green crystalline vial' },
  { name: 'Semaglutide',          slug: 'semaglutide',       hint: 'GLP-1 receptor agonist, metabolic research, clean clinical vial, white' },
  { name: 'Thymosin Alpha-1',     slug: 'thymosin-alpha-1',  hint: 'immune modulating thymic peptide, pale gold vial, T-cell research' },
  { name: 'hCG',                  slug: 'hcg',               hint: 'human chorionic gonadotropin, reproductive research, clear glass vial' },
  { name: 'Tirzepatide',          slug: 'tirzepatide',       hint: 'dual GIP GLP-1 agonist, metabolic research, modern pharmaceutical vial' },
  { name: 'BPC-157',              slug: 'bpc-157',           hint: 'body protection compound, healing peptide, deep blue crystalline vial' },
  { name: 'TB-500',               slug: 'tb-500',            hint: 'thymosin beta-4, tissue repair, gold-toned molecule, cellular regeneration' },
  { name: 'BPC-157 + TB-500',     slug: 'bpc-157-tb-500',   hint: 'dual peptide stack, healing synergy, blue and gold crystals together' },
  { name: 'CJC-1295 + Ipamorelin',slug: 'cjc-1295-ipam',    hint: 'growth hormone peptide blend, silver molecular lattice, laboratory elegance' },
  { name: 'CJC-1295 (with DAC)',  slug: 'cjc-1295-dac',     hint: 'growth hormone secretagogue with Drug Affinity Complex, silver vial' },
  { name: 'GHK-Cu',               slug: 'ghk-cu',            hint: 'copper peptide, deep copper-blue luminescence, skin regeneration molecule' },
  { name: 'SNAP-8 + GHK-Cu Serum',slug: 'snap8-ghkcu-serum',hint: 'anti-aging serum peptides, copper shimmer liquid in dark glass vial' },
  { name: 'IGF-1 LR3',            slug: 'igf-1-lr3',         hint: 'insulin-like growth factor, green-gold molecular helix, cellular growth' },
  { name: 'NAD+',                 slug: 'nad-plus',           hint: 'nicotinamide adenine dinucleotide, glowing amber molecule, longevity' },
  { name: 'Retatrutide',          slug: 'retatrutide',        hint: 'triple agonist peptide, sleek modern molecule, weight management research' },
  { name: 'Tesamorelin',          slug: 'tesamorelin',        hint: 'growth hormone releasing factor, precise molecular structure, silver-white' },
  { name: 'Selank',               slug: 'selank',             hint: 'anxiolytic peptide, calm blue crystalline structure, nootropic research' },
  { name: 'Semax',                slug: 'semax',              hint: 'cognitive peptide, neural network inspired, deep indigo molecular glow' },
  { name: 'KPV',                  slug: 'kpv',                hint: 'anti-inflammatory tripeptide, minimal clean molecule, white crystal' },
  { name: 'Epithalon',            slug: 'epithalon',          hint: 'telomere peptide, lifespan research, purple-blue helix structure' },
  { name: 'Pinealon',             slug: 'pinealon',           hint: 'neuropeptide, pineal gland research, deep violet crystalline' },
  { name: 'DSIP',                 slug: 'dsip',               hint: 'delta sleep-inducing peptide, midnight blue, sleep cycle molecule' },
  { name: 'MOTS-c',               slug: 'mots-c',             hint: 'mitochondrial peptide, energy metabolism, gold-green molecular lattice' },
  { name: 'Melanotan 2',          slug: 'melanotan-2',        hint: 'melanocyte peptide, warm bronze tones, sun research molecule' },
  { name: 'Kisspeptin-10',        slug: 'kisspeptin-10',      hint: 'reproductive peptide, rose-gold molecular structure, endocrine research' },
  { name: '5-Amino-1MQ',         slug: '5-amino-1mq',        hint: 'NNMT inhibitor, metabolic research, deep amber crystalline structure' },
  { name: 'Ipamorelin',           slug: 'ipamorelin',         hint: 'selective growth hormone secretagogue, clean silver molecular form' },
  { name: 'SLU-PP-332',           slug: 'slu-pp-332',         hint: 'ERR agonist, exercise mimetic research, dynamic energy molecule, green' },
];

// ── Image prompt builder ──────────────────────────────────────────────────────
function buildPrompt(product) {
  return `
Luxury pharmaceutical product photography. A single small glass peptide vial, centered on a deep midnight navy background.

The vial:
- Clear borosilicate glass, 10ml, sealed with a brushed gold aluminum crimp cap
- Filled with a clear to slightly opalescent liquid
- Clean white label with "${product.name}" printed in minimal serif font
- Subtle reflections on the glass surface
- One or two small glass syringes or needles arranged beside the vial

Lighting and mood:
- Single dramatic side light casting a long soft shadow
- Warm gold rim light catching the cap edge
- Deep navy-black background, almost no ambient light
- The feel is Tom Ford meets pharmaceutical precision — dark luxury

Composition:
- Square format, vial centered and slightly angled (3/4 view)
- Shallow depth of field, background completely dark
- NO text other than the product name on the vial label
- NO logos, NO watermarks anywhere in the image
- Photorealistic studio product photography, not illustrated
`.trim();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function compositeLogoOnImage(imagePath, logoPath, outputPath) {
  const base = sharp(imagePath);
  const meta = await base.metadata();
  const w = meta.width;
  const h = meta.height;

  // Resize logo to 22% of image width, placed bottom-right with padding
  const logoWidth = Math.round(w * 0.22);

  const logoResized = await sharp(logoPath)
    .resize(logoWidth, null, { fit: 'inside' })
    .toBuffer();

  const logoMeta = await sharp(logoResized).metadata();
  const padding = Math.round(w * 0.04);

  await base
    .composite([{
      input: logoResized,
      gravity: 'southeast',
      top: h - logoMeta.height - padding,
      left: w - logoWidth - padding,
      blend: 'over',
    }])
    .png({ quality: 95 })
    .toFile(outputPath);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey && !DRY_RUN) {
    console.error('ERROR: Set OPENAI_API_KEY env var first.');
    console.error('  OPENAI_API_KEY=sk-... node scripts/generate-product-images.mjs');
    process.exit(1);
  }

  const openai = DRY_RUN ? null : new OpenAI({ apiKey });

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const toProcess = PRODUCTS.filter(p =>
    ONLY_NAME ? p.name.toLowerCase().includes(ONLY_NAME) : true
  );

  console.log(`\nMAHA Peptides — Image Generator`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | Products: ${toProcess.length}\n`);

  let generated = 0;
  let skipped   = 0;
  let failed    = 0;

  for (const product of toProcess) {
    const outFile = path.join(OUT_DIR, `${product.slug}.png`);

    if (SKIP_EXIST && fs.existsSync(outFile)) {
      console.log(`  ⏭  ${product.name} — skipped (exists)`);
      skipped++;
      continue;
    }

    const prompt = buildPrompt(product);

    if (DRY_RUN) {
      console.log(`\n[DRY RUN] ${product.name}`);
      console.log('Prompt:', prompt.slice(0, 120) + '...');
      continue;
    }

    try {
      process.stdout.write(`  ⏳ ${product.name} — generating...`);

      const response = await openai.images.generate({
        model:   'dall-e-3',
        prompt,
        n:       1,
        size:    '1024x1024',
        quality: 'hd',
        style:   'natural',
      });

      const imageUrl = response.data[0].url;
      const tmpFile  = outFile.replace('.png', '_raw.png');

      process.stdout.write(' downloading...');
      await downloadImage(imageUrl, tmpFile);

      process.stdout.write(' compositing logo...');
      await compositeLogoOnImage(tmpFile, LOGO_PATH, outFile);

      fs.unlinkSync(tmpFile);
      console.log(` ✓ saved → ${path.relative(ROOT, outFile)}`);
      generated++;

      // DALL-E rate limit: ~5 req/min on tier 1 — wait 13s between calls
      if (generated < toProcess.length) {
        await new Promise(r => setTimeout(r, 13000));
      }

    } catch (err) {
      console.log(` ✗ FAILED`);
      console.error(`     ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
  if (generated > 0) {
    console.log(`\nImages saved to: apps/web/public/products/`);
    console.log('Deploy with: git add apps/web/public/products && git commit -m "Add AI product images" && git push');
  }
}

main();
