/**
 * PHOTOBOOTH BY SHYPIX.ID - SCRIPT.JS
 * Complete Modern Korean Aesthetic Photobooth Engine
 * 100% Custom Vector SVG Stickers & 28 Detailed Frame Templates
 * by: shypix.id
 */

// ==========================================
// 1. STATE & GLOBAL CONFIGURATION
// ==========================================
let currentStep = 1;
let layoutMode = 'strip4'; // 'strip3' (1x3), 'strip4' (1x4), 'grid2x2' (2x2)
let captureTimer = 3; // 3, 5, 10 seconds
let currentFilter = 'none'; // 'none', 'beauty', 'bw', 'sepia', 'warm', 'cool'
let activeCategory = 'all';
let activeFrameId = 'retro_strawberry_milk';

let currentStream = null;
let capturedPhotos = []; // Array of HTMLImageElement
let isCapturing = false;
let soundEnabled = true;

// Custom Frame Overrides
let customBgOverride = null;
let customTextOverride = null;

// Retake state
let activeRetakeIndex = null;
let isRetaking = false;

// Vector SVG Sticker State
let stickers = []; // Array of { id, stickerId, x, y, size, rotation }
let selectedStickerUid = null;
let activeDrag = null;

// Sticker Vector SVG Image Cache for Canvas Drawing
const stickerImgCache = {};

// Website background themes
const siteThemes = {
  cream: '#FAF7F2',
  pink: '#FDEEF1',
  sage: '#EAF2EC',
  lilac: '#F3EEF9',
  dark: '#1C1917'
};

// ==========================================
// 2. 24 CUSTOM VECTOR SVG STICKERS (NO EMOJIS)
// ==========================================
const STICKER_CATALOG = [
  // 1. Pita Coquette Ribbon
  {
    id: 'ribbon_coquette',
    name: 'Pita Coquette Pink',
    cat: 'accessories',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDA4AF"/>
          <stop offset="50%" stop-color="#FB7185"/>
          <stop offset="100%" stop-color="#F43F5E"/>
        </linearGradient>
      </defs>
      <!-- Left loop -->
      <path d="M 48 45 C 22 20 8 36 20 54 C 28 64 45 52 48 48 Z" fill="url(#coqGrad)" stroke="#BE123C" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 30 38 C 22 42 22 50 32 48" fill="none" stroke="#FFF1F2" stroke-width="2" stroke-linecap="round"/>
      <!-- Right loop -->
      <path d="M 52 45 C 78 20 92 36 80 54 C 72 64 55 52 52 48 Z" fill="url(#coqGrad)" stroke="#BE123C" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 70 38 C 78 42 78 50 68 48" fill="none" stroke="#FFF1F2" stroke-width="2" stroke-linecap="round"/>
      <!-- Left ribbon tail -->
      <path d="M 46 52 C 38 68 25 80 18 88 C 28 84 35 88 42 84 C 46 72 48 58 48 54 Z" fill="url(#coqGrad)" stroke="#BE123C" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Right ribbon tail -->
      <path d="M 54 52 C 62 68 75 80 82 88 C 72 84 65 88 58 84 C 54 72 52 58 52 54 Z" fill="url(#coqGrad)" stroke="#BE123C" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Center knot -->
      <ellipse cx="50" cy="48" rx="8" ry="7" fill="#F43F5E" stroke="#BE123C" stroke-width="2.5"/>
      <ellipse cx="49" cy="46" rx="4" ry="2.5" fill="#FFE4E6"/>
    </svg>`
  },

  // 2. Pita Merah Holiday
  {
    id: 'ribbon_red_holiday',
    name: 'Pita Holiday Red',
    cat: 'accessories',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 47 44 C 20 22 10 38 22 55 C 30 64 45 51 47 48 Z" fill="#DC2626" stroke="#991B1B" stroke-width="2.5"/>
      <path d="M 53 44 C 80 22 90 38 78 55 C 70 64 55 51 53 48 Z" fill="#DC2626" stroke="#991B1B" stroke-width="2.5"/>
      <path d="M 45 52 C 36 70 24 82 16 90 C 26 86 34 89 40 85 C 45 74 47 59 47 54 Z" fill="#B91C1C" stroke="#991B1B" stroke-width="2"/>
      <path d="M 55 52 C 64 70 76 82 84 90 C 74 86 66 89 60 85 C 55 74 53 59 53 54 Z" fill="#B91C1C" stroke="#991B1B" stroke-width="2"/>
      <circle cx="50" cy="48" r="7.5" fill="#EF4444" stroke="#991B1B" stroke-width="2.5"/>
      <circle cx="50" cy="48" r="3" fill="#FDE047"/>
    </svg>`
  },

  // 3. Kilauan Sparkles Emas
  {
    id: 'sparkles_gold',
    name: 'Kilau Sparkles Emas',
    cat: 'sparkles',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Main Sparkle -->
      <path d="M 50 15 Q 50 50 15 50 Q 50 50 50 85 Q 50 50 85 50 Q 50 50 50 15 Z" fill="#FACC15" stroke="#EAB308" stroke-width="2"/>
      <circle cx="50" cy="50" r="4.5" fill="#FFFFFF"/>
      <!-- Top right small sparkle -->
      <path d="M 78 18 Q 78 32 64 32 Q 78 32 78 46 Q 78 32 92 32 Q 78 32 78 18 Z" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5"/>
      <!-- Bottom left small sparkle -->
      <path d="M 22 64 Q 22 75 11 75 Q 22 75 22 86 Q 22 75 33 75 Q 22 75 22 64 Z" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5"/>
    </svg>`
  },

  // 4. Bintang Y2K Starburst
  {
    id: 'y2k_starburst',
    name: 'Bintang Y2K Chrome',
    cat: 'sparkles',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="y2kGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C084FC"/>
          <stop offset="50%" stop-color="#F472B6"/>
          <stop offset="100%" stop-color="#38BDF8"/>
        </linearGradient>
      </defs>
      <path d="M 50 5 Q 50 50 5 50 Q 50 50 50 95 Q 50 50 95 50 Q 50 50 50 5 Z" fill="url(#y2kGrad)" stroke="#7E22CE" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="9" fill="#FFFFFF"/>
      <circle cx="50" cy="50" r="4" fill="#7E22CE"/>
      <circle cx="28" cy="28" r="3" fill="#F472B6"/>
      <circle cx="72" cy="72" r="3" fill="#38BDF8"/>
    </svg>`
  },

  // 5. Kacamata Pixel Y2K
  {
    id: 'pixel_glasses',
    name: 'Kacamata Pixel Thug',
    cat: 'accessories',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Bridge -->
      <rect x="42" y="47" width="16" height="5" fill="#18181B"/>
      <!-- Left Lens Frame -->
      <rect x="12" y="43" width="30" height="15" fill="#18181B"/>
      <rect x="16" y="58" width="22" height="4" fill="#18181B"/>
      <!-- Right Lens Frame -->
      <rect x="58" y="43" width="30" height="15" fill="#18181B"/>
      <rect x="62" y="58" width="22" height="4" fill="#18181B"/>
      <!-- Pixel Glare White Left -->
      <rect x="16" y="45" width="4" height="4" fill="#FFFFFF"/>
      <rect x="20" y="49" width="4" height="4" fill="#FFFFFF"/>
      <!-- Pixel Glare White Right -->
      <rect x="62" y="45" width="4" height="4" fill="#FFFFFF"/>
      <rect x="66" y="49" width="4" height="4" fill="#FFFFFF"/>
      <!-- Side arms -->
      <rect x="6" y="45" width="6" height="4" fill="#18181B"/>
      <rect x="88" y="45" width="6" height="4" fill="#18181B"/>
    </svg>`
  },

  // 6. Kacamata Hati Retro
  {
    id: 'heart_glasses',
    name: 'Kacamata Hati Pink',
    cat: 'accessories',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Center bridge -->
      <path d="M 44 48 Q 50 45 56 48" fill="none" stroke="#BE123C" stroke-width="3" stroke-linecap="round"/>
      <!-- Left Heart -->
      <path d="M 28 36 C 20 36 14 42 14 50 C 14 62 28 72 28 72 C 28 72 42 62 42 50 C 42 42 36 36 28 36 Z" fill="#FB7185" fill-opacity="0.85" stroke="#BE123C" stroke-width="3"/>
      <ellipse cx="23" cy="44" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.8" transform="rotate(-20, 23, 44)"/>
      <!-- Right Heart -->
      <path d="M 72 36 C 64 36 58 42 58 50 C 58 62 72 72 72 72 C 72 72 86 62 86 50 C 86 42 80 36 72 36 Z" fill="#FB7185" fill-opacity="0.85" stroke="#BE123C" stroke-width="3"/>
      <ellipse cx="67" cy="44" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.8" transform="rotate(-20, 67, 44)"/>
      <!-- Temples -->
      <path d="M 14 47 L 6 45" stroke="#BE123C" stroke-width="3" stroke-linecap="round"/>
      <path d="M 86 47 L 94 45" stroke="#BE123C" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },

  // 7. Telinga Kelinci Lucu
  {
    id: 'bunny_ears',
    name: 'Telinga Kelinci Bunny',
    cat: 'characters',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Headband Arc -->
      <path d="M 24 75 Q 50 68 76 75" fill="none" stroke="#E2E8F0" stroke-width="5" stroke-linecap="round"/>
      <!-- Left Outer Ear -->
      <path d="M 28 70 C 16 48 18 16 33 12 C 45 10 46 45 38 70 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5"/>
      <!-- Left Inner Pink Ear -->
      <path d="M 30 63 C 24 46 25 24 33 20 C 39 19 40 45 35 63 Z" fill="#F472B6"/>
      <!-- Right Outer Ear (Cute bent tip) -->
      <path d="M 62 70 C 54 45 55 10 67 12 C 82 16 84 48 72 70 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5"/>
      <!-- Right Inner Pink Ear -->
      <path d="M 65 63 C 60 45 61 19 67 20 C 75 24 76 46 70 63 Z" fill="#F472B6"/>
      <!-- Little Star Decoration -->
      <polygon points="50,66 52,71 57,71 53,74 55,79 50,76 45,79 47,74 43,71 48,71" fill="#FACC15"/>
    </svg>`
  },

  // 8. Telinga Kucing Lucu
  {
    id: 'cat_ears',
    name: 'Telinga Kucing Cute',
    cat: 'characters',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Headband -->
      <path d="M 18 72 Q 50 58 82 72" fill="none" stroke="#475569" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Left Outer Ear -->
      <path d="M 22 66 C 18 48 24 22 36 20 C 44 32 46 54 44 62 Z" fill="#FFFFFF" stroke="#475569" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 26 58 C 24 45 27 30 35 28 C 39 36 40 48 39 56 Z" fill="#FB7185"/>
      <!-- Right Outer Ear -->
      <path d="M 78 66 C 82 48 76 22 64 20 C 56 32 54 54 56 62 Z" fill="#FFFFFF" stroke="#475569" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M 74 58 C 76 45 73 30 65 28 C 61 36 60 48 61 56 Z" fill="#FB7185"/>
      <!-- Mini Bow on Right Ear -->
      <circle cx="70" cy="30" r="3" fill="#F43F5E"/>
      <path d="M 67 30 C 62 26 62 34 67 30 Z" fill="#FB7185"/>
      <path d="M 73 30 C 78 26 78 34 73 30 Z" fill="#FB7185"/>
    </svg>`
  },

  // 9. Mahkota Princess
  {
    id: 'princess_crown',
    name: 'Mahkota Princess Emas',
    cat: 'accessories',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Crown Base -->
      <path d="M 16 68 L 22 35 L 38 52 L 50 25 L 62 52 L 78 35 L 84 68 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Bottom band -->
      <rect x="16" y="68" width="68" height="10" rx="3" fill="#EAB308" stroke="#CA8A04" stroke-width="2"/>
      <!-- Jewels on tips -->
      <circle cx="22" cy="33" r="4.5" fill="#EC4899" stroke="#BE123C" stroke-width="1.5"/>
      <circle cx="50" cy="23" r="5.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1.5"/>
      <circle cx="78" cy="33" r="4.5" fill="#EC4899" stroke="#BE123C" stroke-width="1.5"/>
      <!-- Band Jewels -->
      <circle cx="32" cy="73" r="2.5" fill="#FFFFFF"/>
      <circle cx="50" cy="73" r="3.5" fill="#EC4899"/>
      <circle cx="68" cy="73" r="2.5" fill="#FFFFFF"/>
    </svg>`
  },

  // 10. Awan Tersenyum
  {
    id: 'happy_cloud',
    name: 'Awan Senyum Cute',
    cat: 'characters',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Cloud body -->
      <path d="M 28 68 C 18 68 12 58 16 48 C 16 38 28 32 36 36 C 42 24 58 24 64 36 C 72 32 84 38 84 48 C 88 58 82 68 72 68 Z" fill="#F0F9FF" stroke="#38BDF8" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Rosy Cheeks -->
      <circle cx="34" cy="54" r="4" fill="#FDA4AF"/>
      <circle cx="66" cy="54" r="4" fill="#FDA4AF"/>
      <!-- Closed Happy Eyes -->
      <path d="M 38 48 Q 42 44 46 48" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 54 48 Q 58 44 62 48" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Cute Smile -->
      <path d="M 48 54 Q 50 58 52 54" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // 11. Bunga Daisy Estetik
  {
    id: 'daisy_flower',
    name: 'Bunga Daisy Putih',
    cat: 'flowers',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- 8 Petals -->
      <ellipse cx="50" cy="22" rx="9" ry="17" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <ellipse cx="50" cy="78" rx="9" ry="17" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <ellipse cx="22" cy="50" rx="17" ry="9" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <ellipse cx="78" cy="50" rx="17" ry="9" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <ellipse cx="30" cy="30" rx="9" ry="17" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" transform="rotate(-45, 30, 30)"/>
      <ellipse cx="70" cy="70" rx="9" ry="17" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" transform="rotate(-45, 70, 70)"/>
      <ellipse cx="70" cy="30" rx="9" ry="17" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" transform="rotate(45, 70, 30)"/>
      <ellipse cx="30" cy="70" rx="9" ry="17" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" transform="rotate(45, 30, 70)"/>
      <!-- Flower Center -->
      <circle cx="50" cy="50" r="14" fill="#FACC15" stroke="#EAB308" stroke-width="2"/>
      <circle cx="47" cy="47" r="3.5" fill="#FEF08A"/>
    </svg>`
  },

  // 12. Bunga Sakura Blossom
  {
    id: 'sakura_flower',
    name: 'Bunga Sakura Pink',
    cat: 'flowers',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- 5 Petals -->
      <path d="M 50 50 Q 38 20 45 12 C 50 14 50 14 55 12 Q 62 20 50 50 Z" fill="#FBCFE8" stroke="#F472B6" stroke-width="1.5"/>
      <path d="M 50 50 Q 80 38 88 45 C 86 50 86 50 88 55 Q 80 62 50 50 Z" fill="#FBCFE8" stroke="#F472B6" stroke-width="1.5"/>
      <path d="M 50 50 Q 68 80 62 88 C 57 86 57 86 52 88 Q 42 78 50 50 Z" fill="#FBCFE8" stroke="#F472B6" stroke-width="1.5"/>
      <path d="M 50 50 Q 25 78 18 72 C 20 67 20 67 18 62 Q 28 50 50 50 Z" fill="#FBCFE8" stroke="#F472B6" stroke-width="1.5"/>
      <path d="M 50 50 Q 18 35 14 26 C 20 25 20 25 24 22 Q 38 35 50 50 Z" fill="#FBCFE8" stroke="#F472B6" stroke-width="1.5"/>
      <!-- Center pistil -->
      <circle cx="50" cy="50" r="7" fill="#F43F5E"/>
      <circle cx="50" cy="50" r="3" fill="#FACC15"/>
    </svg>`
  },

  // 13. Duo Buah Ceri Manis
  {
    id: 'cherry_duo',
    name: 'Duo Ceri Manis',
    cat: 'flowers',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Green Stems -->
      <path d="M 36 62 C 38 35 52 24 62 18" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round"/>
      <path d="M 68 66 C 66 40 58 26 62 18" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round"/>
      <!-- Leaf -->
      <path d="M 62 18 C 76 14 84 24 82 32 C 72 34 64 26 62 18 Z" fill="#22C55E" stroke="#15803D" stroke-width="1.5"/>
      <!-- Left Cherry -->
      <circle cx="34" cy="68" r="16" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <ellipse cx="29" cy="62" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.8" transform="rotate(-30, 29, 62)"/>
      <!-- Right Cherry -->
      <circle cx="70" cy="72" r="16" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <ellipse cx="65" cy="66" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.8" transform="rotate(-30, 65, 66)"/>
    </svg>`
  },

  // 14. Hati Bersayap Estetik
  {
    id: 'winged_heart',
    name: 'Hati Bersayap Cinta',
    cat: 'flowers',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Left Wing -->
      <path d="M 38 48 C 24 32 8 36 4 48 C 12 52 18 58 26 60 C 18 64 24 72 36 64 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <!-- Right Wing -->
      <path d="M 62 48 C 76 32 92 36 96 48 C 88 52 82 58 74 60 C 82 64 76 72 64 64 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <!-- Center Pink Heart -->
      <path d="M 50 36 C 42 26 30 30 30 42 C 30 56 50 72 50 72 C 50 72 70 56 70 42 C 70 30 58 26 50 36 Z" fill="#F43F5E" stroke="#BE123C" stroke-width="2.5"/>
      <ellipse cx="42" cy="40" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.8" transform="rotate(-20, 42, 40)"/>
    </svg>`
  },

  // 15. Speech Bubble 'LOVE!'
  {
    id: 'bubble_love',
    name: 'Bubble LOVE!',
    cat: 'stamps',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 12 25 C 12 18 20 14 30 14 L 70 14 C 80 14 88 20 88 28 L 88 56 C 88 64 80 70 70 70 L 42 70 L 26 84 L 30 70 L 22 70 C 14 70 12 62 12 56 Z" fill="#FFF1F2" stroke="#F43F5E" stroke-width="3" stroke-linejoin="round"/>
      <text x="48" y="49" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="20" fill="#E11D48" text-anchor="middle">LOVE!</text>
      <circle cx="74" cy="30" r="3" fill="#FB7185"/>
    </svg>`
  },

  // 16. Speech Bubble 'CUTE!'
  {
    id: 'bubble_cute',
    name: 'Bubble CUTE! ♡',
    cat: 'stamps',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 14 26 C 14 18 22 14 32 14 L 68 14 C 78 14 86 20 86 28 L 86 54 C 86 62 78 68 68 68 L 54 68 L 44 82 L 44 68 L 28 68 C 18 68 14 62 14 54 Z" fill="#F5F3FF" stroke="#8B5CF6" stroke-width="3" stroke-linejoin="round"/>
      <text x="50" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="17" fill="#6D28D9" text-anchor="middle">CUTE! ♡</text>
    </svg>`
  },

  // 17. Speech Bubble 'XOXO'
  {
    id: 'bubble_xoxo',
    name: 'Bubble xoxo',
    cat: 'stamps',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 16 26 C 16 18 24 14 34 14 L 66 14 C 76 14 84 20 84 28 L 84 54 C 84 62 76 68 66 68 L 38 68 L 24 80 L 26 68 L 22 68 C 16 68 16 62 16 54 Z" fill="#FEFCE8" stroke="#CA8A04" stroke-width="3" stroke-linejoin="round"/>
      <text x="49" y="48" font-family="'Caveat', cursive" font-weight="700" font-size="24" fill="#B45309" text-anchor="middle">xoxo</text>
    </svg>`
  },

  // 18. Stempel Tanggal Estetik
  {
    id: 'stamp_aesthetic',
    name: 'Stempel Studio Estetik',
    cat: 'stamps',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-dasharray="4,2"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#DC2626" stroke-width="1.5"/>
      <text x="50" y="38" font-family="sans-serif" font-weight="bold" font-size="7.5" fill="#DC2626" text-anchor="middle" letter-spacing="1">SHYPIX STUDIO</text>
      <line x1="22" y1="44" x2="78" y2="44" stroke="#DC2626" stroke-width="1.5"/>
      <text x="50" y="55" font-family="'Space Grotesk', sans-serif" font-weight="bold" font-size="10" fill="#DC2626" text-anchor="middle">★ PASSED ★</text>
      <line x1="22" y1="60" x2="78" y2="60" stroke="#DC2626" stroke-width="1.5"/>
      <text x="50" y="70" font-family="sans-serif" font-weight="bold" font-size="6.5" fill="#DC2626" text-anchor="middle">VERIFIED AESTHETIC</text>
    </svg>`
  },

  // 19. Love Wax Seal
  {
    id: 'stamp_love_seal',
    name: 'Stempel Lilin Love Seal',
    cat: 'stamps',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Wax Blob Outer -->
      <path d="M 50 10 C 66 8 82 20 86 36 C 92 50 86 68 76 80 C 62 92 42 90 28 84 C 14 74 8 56 12 38 C 16 22 34 12 50 10 Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="2"/>
      <!-- Inner Ring -->
      <circle cx="49" cy="49" r="28" fill="#B91C1C" stroke="#7F1D1D" stroke-width="2"/>
      <!-- Embossed Heart -->
      <path d="M 49 38 C 43 32 35 35 35 44 C 35 54 49 64 49 64 C 49 64 63 54 63 44 C 63 35 55 32 49 38 Z" fill="#DC2626" stroke="#FEF08A" stroke-width="1.5"/>
    </svg>`
  },

  // 20. Stempel '100% CUTE'
  {
    id: 'stamp_100_cute',
    name: 'Badge 100% CUTE',
    cat: 'stamps',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Starburst Badge -->
      <circle cx="50" cy="50" r="40" fill="#F43F5E" stroke="#BE123C" stroke-width="2"/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3,2"/>
      <text x="50" y="44" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">100%</text>
      <text x="50" y="62" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="14" fill="#FEF08A" text-anchor="middle">CUTE!</text>
    </svg>`
  },

  // 21. Topi Santa Natal
  {
    id: 'santa_hat',
    name: 'Topi Santa Natal',
    cat: 'theme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Red Cone drooping right -->
      <path d="M 22 66 Q 36 24 74 36 C 84 40 86 52 86 52 Q 55 40 45 66 Z" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <!-- White Pom-Pom -->
      <circle cx="86" cy="52" r="9" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <!-- White Fur Brim -->
      <rect x="14" y="64" width="62" height="15" rx="7.5" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    </svg>`
  },

  // 22. Daun Holly & Beri Natal
  {
    id: 'holly_berry',
    name: 'Daun Holly Natal',
    cat: 'theme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Left Holly Leaf -->
      <path d="M 46 48 C 34 32 18 36 12 48 C 18 52 22 58 30 60 C 22 66 28 76 46 62 Z" fill="#15803D" stroke="#14532D" stroke-width="2"/>
      <!-- Right Holly Leaf -->
      <path d="M 54 48 C 66 32 82 36 88 48 C 82 52 78 58 70 60 C 78 66 72 76 54 62 Z" fill="#15803D" stroke="#14532D" stroke-width="2"/>
      <!-- Three Red Berries -->
      <circle cx="50" cy="46" r="8" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
      <circle cx="43" cy="56" r="7.5" fill="#EF4444" stroke="#991B1B" stroke-width="2"/>
      <circle cx="57" cy="56" r="7.5" fill="#B91C1C" stroke="#991B1B" stroke-width="2"/>
      <circle cx="48" cy="44" r="2" fill="#FFFFFF"/>
    </svg>`
  },

  // 23. Bendera Balap F1 Checkered
  {
    id: 'f1_flag',
    name: 'Bendera Balap F1',
    cat: 'theme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Flag Pole -->
      <line x1="22" y1="88" x2="62" y2="16" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="63" cy="15" r="3.5" fill="#FACC15"/>
      <!-- Checkered Wavy Flag -->
      <path d="M 58 22 Q 74 18 90 24 L 84 56 Q 68 50 50 56 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
      <!-- Checker Patches -->
      <rect x="54" y="24" width="8" height="8" fill="#0F172A"/>
      <rect x="70" y="23" width="8" height="8" fill="#0F172A"/>
      <rect x="62" y="32" width="8" height="8" fill="#0F172A"/>
      <rect x="78" y="33" width="8" height="8" fill="#0F172A"/>
      <rect x="54" y="41" width="8" height="8" fill="#0F172A"/>
      <rect x="70" y="42" width="8" height="8" fill="#0F172A"/>
    </svg>`
  },

  // 24. Piala Juara Gold Trophy
  {
    id: 'gold_trophy',
    name: 'Piala Juara P1',
    cat: 'theme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Handles -->
      <path d="M 30 30 C 14 30 14 50 30 54" fill="none" stroke="#CA8A04" stroke-width="4" stroke-linecap="round"/>
      <path d="M 70 30 C 86 30 86 50 70 54" fill="none" stroke="#CA8A04" stroke-width="4" stroke-linecap="round"/>
      <!-- Cup Body -->
      <path d="M 28 22 L 72 22 L 68 52 C 68 62 58 68 50 68 C 42 68 32 62 32 52 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="2.5"/>
      <!-- Star on Cup -->
      <polygon points="50,34 52,39 57,39 53,42 55,47 50,44 45,47 47,42 43,39 48,39" fill="#CA8A04"/>
      <!-- Stem -->
      <rect x="46" y="68" width="8" height="12" fill="#EAB308"/>
      <!-- Base -->
      <rect x="34" y="80" width="32" height="10" rx="2" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
    </svg>`
  }
];

// Preload SVG Sticker Images into Canvas Cache
function preloadStickerImages() {
  STICKER_CATALOG.forEach(item => {
    if (!stickerImgCache[item.id]) {
      const img = new Image();
      const blob = new Blob([item.svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.src = url;
      stickerImgCache[item.id] = img;
    }
  });
}

// ==========================================
// 3. 28 DETAILED FRAME TEMPLATES
// ==========================================
const FRAME_TEMPLATES = [
  // ========================================
  // KATEGORI 1: POLKADOT & RETRO (6 VARIAN)
  // ========================================
  {
    id: 'retro_strawberry_milk',
    category: 'retro',
    name: 'Strawberry Milk Dots',
    badge: 'Popular',
    bgColor: '#FFF0F3',
    textColor: '#BE123C',
    accentColor: '#FB7185',
    font: 'sans',
    subtitle: 'STRAWBERRY MILK • SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FFF0F3';
      ctx.fillRect(0, 0, w, h);

      // Cute multi-size strawberry polka dots & sugar dots
      const spacing = 40;
      for (let y = 18; y < h; y += spacing) {
        for (let x = 18; x < w; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#FB7185';
          ctx.fill();

          // Tiny sugar dot
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
      }
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      // Scalloped strawberry wave borders around photos
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 8;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 16);
      });
      ctx.strokeStyle = '#FDA4AF';
      ctx.lineWidth = 2;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 7, r.y - 7, r.w + 14, r.h + 14, 18);
      });
      // Header badge
      ctx.fillStyle = '#F43F5E';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍓 SWEET STRAWBERRY MOMENTS 🍓', w / 2, 48);
    }
  },
  {
    id: 'retro_monochrome_dots',
    category: 'retro',
    name: 'Retro Monochrome Big Dots',
    badge: 'Mod 60s',
    bgColor: '#F8F9FA',
    textColor: '#18181B',
    accentColor: '#000000',
    font: 'sporty',
    subtitle: 'RETRO POP 60s • PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(0, 0, w, h);

      // Oversized 60s Pop Art black dots
      const spacing = 58;
      for (let y = 25; y < h; y += spacing) {
        for (let x = 25; x < w; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fillStyle = '#18181B';
          ctx.fill();
        }
      }
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      // Bold mod double black border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 10;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 5, r.y - 5, r.w + 10, r.h + 10);
      });
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 10, r.y - 10, r.w + 20, r.h + 20);
      });
      // Mod target icon
      ctx.beginPath();
      ctx.arc(w / 2, 45, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#18181B';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2, 45, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
  },
  {
    id: 'retro_rainbow_confetti',
    category: 'retro',
    name: 'Pastel Confetti Dots',
    badge: 'Confetti',
    bgColor: '#FFFDF5',
    textColor: '#7C3AED',
    accentColor: '#EC4899',
    font: 'sans',
    subtitle: 'CONFETTI DREAMS • SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FFFDF5';
      ctx.fillRect(0, 0, w, h);

      const confettiColors = ['#F472B6', '#38BDF8', '#4ADE80', '#FACC15', '#A78BFA'];
      const spacing = 34;
      let count = 0;
      for (let y = 15; y < h; y += spacing) {
        for (let x = 15; x < w; x += spacing) {
          ctx.beginPath();
          const r = count % 3 === 0 ? 6 : 4;
          ctx.arc(x + (count % 7), y + (count % 5), r, 0, Math.PI * 2);
          ctx.fillStyle = confettiColors[count % confettiColors.length];
          ctx.fill();
          count++;
        }
      }
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 8;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 18);
      });
      drawSparkleStar(ctx, 45, 45, 12, '#EC4899');
      drawSparkleStar(ctx, w - 45, 45, 12, '#38BDF8');
    }
  },
  {
    id: 'retro_mint_cream',
    category: 'retro',
    name: 'Mint & Cream Vintage Dots',
    badge: '50s Diner',
    bgColor: '#E6F4F1',
    textColor: '#2D4A43',
    accentColor: '#78350F',
    font: 'serif',
    subtitle: 'VINTAGE MINT DINER • BY SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#E6F4F1';
      ctx.fillRect(0, 0, w, h);

      const spacing = 42;
      for (let y = 20; y < h; y += spacing) {
        for (let x = 20; x < w; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#FFF9EB';
          ctx.fill();
        }
      }
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#C2E5DE';
      ctx.lineWidth = 5;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 14);
      });
      // 50s Diner badge at header
      ctx.fillStyle = '#2D4A43';
      ctx.font = 'bold 16px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ S W E E T  M I N T ★', w / 2, 48);
    }
  },
  {
    id: 'retro_y2k_checker',
    category: 'retro',
    name: 'Y2K Cyber Funk',
    badge: 'Y2K Vibe',
    bgColor: '#EDE9FE',
    textColor: '#4C1D95',
    accentColor: '#EC4899',
    font: 'sporty',
    subtitle: 'Y2K CYBER ARCHIVE • PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#EDE9FE';
      ctx.fillRect(0, 0, w, h);

      // Y2K Pink & Purple Checkerboard corner patches
      drawCheckerPatch(ctx, 0, 0, 75, 75, 15, '#C084FC', '#F472B6');
      drawCheckerPatch(ctx, w - 75, 0, 75, 75, 15, '#C084FC', '#F472B6');
      drawCheckerPatch(ctx, 0, h - 75, 75, 75, 15, '#C084FC', '#F472B6');
      drawCheckerPatch(ctx, w - 75, h - 75, 75, 75, 15, '#C084FC', '#F472B6');
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 14);
      });
      drawSparkleStar(ctx, w / 2, 42, 16, '#EC4899');
    }
  },
  {
    id: 'retro_groove_70s',
    category: 'retro',
    name: '70s Golden Sunset Groove',
    badge: 'Warm Retro',
    bgColor: '#FEF3C7',
    textColor: '#78350F',
    accentColor: '#D97706',
    font: 'serif',
    subtitle: 'GOLDEN HOUR GROOVE • SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(0, 0, w, h);
      drawGrooveRibbon(ctx, 0, 0, w, 36, '#F59E0B', '#EA580C', '#78350F');
      drawGrooveRibbon(ctx, 0, h - 36, w, 36, '#78350F', '#EA580C', '#F59E0B');
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 14);
      });
      drawRetroFlower(ctx, w / 2, 55, 14, '#EA580C', '#FEF3C7');
    }
  },

  // ========================================
  // KATEGORI 2: CHRISTMAS (5 VARIAN)
  // ========================================
  {
    id: 'christmas_red_gold_plaid',
    category: 'christmas',
    name: 'Cozy Red & Gold Plaid',
    badge: 'Tartan Plaid',
    bgColor: '#881337',
    textColor: '#FEF08A',
    accentColor: '#FACC15',
    font: 'serif',
    subtitle: '★ COZY CHRISTMAS • PHOTOBOOTH BY SHYPIX ★',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#881337';
      ctx.fillRect(0, 0, w, h);

      // Scottish Tartan Plaid Grid Lines
      const grid = 45;
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#700F2B';
      for (let x = 0; x < w; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Gold Fine Pin-stripes
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
      for (let x = grid / 2; x < w; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = grid / 2; y < h; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 5;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
      });
      drawSparkleStar(ctx, w / 2, 45, 16, '#FACC15');
    }
  },
  {
    id: 'christmas_midnight_blue',
    category: 'christmas',
    name: 'Snowy Midnight Blue',
    badge: 'Winter Night',
    bgColor: '#0F172A',
    textColor: '#93C5FD',
    accentColor: '#FACC15',
    font: 'serif',
    subtitle: 'SILENT NIGHT • WINTER WONDERLAND • SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0B132B');
      grad.addColorStop(0.5, '#1C2541');
      grad.addColorStop(1, '#0B132B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawSnowflakes(ctx, w, h, 65);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      // Frosted ice borders
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 12);
      });
      // Golden crescent moon at header
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(w / 2, 46, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0B132B';
      ctx.beginPath();
      ctx.arc(w / 2 + 5, 43, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  {
    id: 'christmas_candy_gingerbread',
    category: 'christmas',
    name: 'Gingerbread & Candy Cane',
    badge: 'Sweet Cane',
    bgColor: '#F5E6D3',
    textColor: '#854D0E',
    accentColor: '#DC2626',
    font: 'handwriting',
    subtitle: 'SWEET GINGERBREAD & CANDY CANE • BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#F5E6D3';
      ctx.fillRect(0, 0, w, h);

      // Diagonal Candy Cane striped outer border
      drawCandyBorder(ctx, w, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 14);
      });
      // Gingerbread icon
      ctx.fillStyle = '#854D0E';
      ctx.font = 'bold 15px "Caveat", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('🍬 SWEET HOLIDAY MEMORIES 🍪', w / 2, 46);
    }
  },
  {
    id: 'christmas_minimal_pine',
    category: 'christmas',
    name: 'Minimalist Pine & Berry',
    badge: 'Nordic Pine',
    bgColor: '#FAF8F5',
    textColor: '#14532D',
    accentColor: '#DC2626',
    font: 'sans',
    subtitle: 'WARM HOLIDAY WISHES • PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, w, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 10);
      });
      // Pine needles & berries
      drawHolly(ctx, 45, 42, 1);
      drawHolly(ctx, w - 45, 42, -1);
      ctx.fillStyle = '#14532D';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MERRY & BRIGHT', w / 2, 46);
    }
  },
  {
    id: 'christmas_festive_red',
    category: 'christmas',
    name: 'Holiday Crimson Garland',
    badge: 'Festive',
    bgColor: '#991B1B',
    textColor: '#FEF08A',
    accentColor: '#22C55E',
    font: 'serif',
    subtitle: 'MERRY CHRISTMAS & HAPPY NEW YEAR • SHYPIX',
    drawBackground: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#7F1D1D');
      grad.addColorStop(0.5, '#991B1B');
      grad.addColorStop(1, '#6F1515');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      drawSnowflakes(ctx, w, h, 50);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 10);
      });
      drawChristmasBauble(ctx, w * 0.25, 35, 14, '#EAB308');
      drawChristmasBauble(ctx, w * 0.5, 45, 18, '#DC2626');
      drawChristmasBauble(ctx, w * 0.75, 35, 14, '#EAB308');
    }
  },

  // ========================================
  // KATEGORI 3: FORMULA 1 (F1 RACING) (5 VARIAN)
  // ========================================
  {
    id: 'f1_scuderia_telemetry',
    category: 'f1',
    name: 'Scuderia Red Telemetry',
    badge: 'Telemetry',
    bgColor: '#DC2626',
    textColor: '#FFFFFF',
    accentColor: '#000000',
    font: 'sporty',
    subtitle: 'SCUDERIA SPEED TELEMETRY // BY SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(0, 0, w, h);
      drawCheckeredBand(ctx, 0, 0, w, 28, 14);
      drawCheckeredBand(ctx, 0, h - 28, w, 28, 14);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
      });
      // Telemetry Speed Header
      ctx.fillStyle = '#000000';
      ctx.fillRect(w / 2 - 140, 36, 280, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPEED 342 KM/H // PURPLE SECTORS 🟣', w / 2, 53);
    }
  },
  {
    id: 'f1_midnight_neon_grid',
    category: 'f1',
    name: 'Midnight Carbon & Neon Grid',
    badge: 'Neon Paddock',
    bgColor: '#0F1012',
    textColor: '#06B6D4',
    accentColor: '#EC4899',
    font: 'sporty',
    subtitle: 'NEON SPEED PADDOCK // PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#0F1012';
      ctx.fillRect(0, 0, w, h);

      // Neon cyan grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      // Neon cyan glow borders
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
      });
      // Lap record banner
      ctx.fillStyle = '#EC4899';
      ctx.font = 'bold 13px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ RECORD LAP // 01:12.488 ⚡', w / 2, 48);
    }
  },
  {
    id: 'f1_monaco_gold',
    category: 'f1',
    name: 'Monaco GP Gold & Black',
    badge: 'Monaco GP',
    bgColor: '#141416',
    textColor: '#FACC15',
    accentColor: '#EAB308',
    font: 'sporty',
    subtitle: 'GRAND PRIX DE MONACO • VICTORY LANE • SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#141416';
      ctx.fillRect(0, 0, w, h);

      // Gold racing stripes on edges
      ctx.fillStyle = '#CA8A04';
      ctx.fillRect(0, 0, 12, h);
      ctx.fillRect(w - 12, 0, 12, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
      });
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 GRAND PRIX DE MONACO 🏆', w / 2, 48);
    }
  },
  {
    id: 'f1_checkered_podium',
    category: 'f1',
    name: 'Classic Checkered Podium',
    badge: 'P1 Finish',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    accentColor: '#DC2626',
    font: 'sporty',
    subtitle: 'P1 PODIUM FINISH // PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      // Side checkered stripes
      drawCheckeredVerticalBand(ctx, 0, 0, 22, h, 11);
      drawCheckeredVerticalBand(ctx, w - 22, 0, 22, h, 11);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
      });
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 POLE POSITION #01 🏁', w / 2, 48);
    }
  },
  {
    id: 'f1_gulf_heritage',
    category: 'f1',
    name: 'Gulf Vintage Heritage',
    badge: 'Classic GP',
    bgColor: '#7DD3FC',
    textColor: '#0F172A',
    accentColor: '#EA580C',
    font: 'sporty',
    subtitle: 'VINTAGE GRAND PRIX CLUB • SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#7DD3FC';
      ctx.fillRect(0, 0, w, h);
      const stripeW = 90;
      ctx.fillStyle = '#EA580C';
      ctx.fillRect(w / 2 - stripeW / 2, 0, stripeW, h);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(w / 2 - stripeW / 2 - 8, 0, 8, h);
      ctx.fillRect(w / 2 + stripeW / 2, 0, 8, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
      });
    }
  },

  // ========================================
  // KATEGORI 4: BERITA KORAN (5 VARIAN)
  // ========================================
  {
    id: 'newspaper_breaking_news',
    category: 'newspaper',
    name: 'Breaking News Headline Edition',
    badge: 'Headline',
    bgColor: '#F5F1E6',
    textColor: '#1A1817',
    accentColor: '#DC2626',
    font: 'serif',
    subtitle: 'THE DAILY CHRONICLE • PRESS ARCHIVE • SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#F5F1E6';
      ctx.fillRect(0, 0, w, h);

      // Masthead Header
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1A1817';
      ctx.beginPath(); ctx.moveTo(35, 18); ctx.lineTo(w - 35, 18); ctx.stroke();

      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(35, 23); ctx.lineTo(w - 35, 23); ctx.stroke();

      ctx.fillStyle = '#1A1817';
      ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE DAILY CHRONICLE', w / 2, 60);

      const dateStr = getFormattedDate();
      ctx.font = 'italic 11px Georgia, serif';
      ctx.fillText(`SPECIAL ISSUE • ${dateStr.toUpperCase()} • VOL. CXXIV NO. 42 • PRICE $0.25`, w / 2, 78);

      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(35, 87); ctx.lineTo(w - 35, 87); ctx.stroke();

      ctx.font = 'bold 12px "Playfair Display", serif';
      ctx.fillText('★ BREAKING NEWS: UNSTOPPABLE CHARM & RADIANT SMILES! ★', w / 2, 104);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#1A1817';
      ctx.lineWidth = 2;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });

      drawNewspaperBarcode(ctx, w - 170, h - 75, 130, 40);

      ctx.fillStyle = '#4A4540';
      ctx.textAlign = 'left';
      ctx.font = '9px Georgia, serif';
      ctx.fillText('EXCLUSIVE REPORT // Local star stuns the studio today with an infectious smile.', 40, h - 60);
      ctx.fillText('Critics confirm highest aesthetic score recorded this season.', 40, h - 45);
    }
  },
  {
    id: 'newspaper_coffee_stained',
    category: 'newspaper',
    name: 'Vintage Coffee-Stained Gazette',
    badge: 'Antique',
    bgColor: '#EFE3CE',
    textColor: '#382A1D',
    accentColor: '#78350F',
    font: 'serif',
    subtitle: 'AUTHENTIC GAZETTE • ARCHIVED BY SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#EFE3CE';
      ctx.fillRect(0, 0, w, h);

      // Subtle Coffee Ring Stains
      ctx.save();
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.12)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(w - 70, 90, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(60, h - 110, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ornate Gazette Header
      ctx.fillStyle = '#382A1D';
      ctx.font = 'bold 28px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE VINTAGE GAZETTE', w / 2, 54);
      ctx.font = 'italic 11px Georgia, serif';
      ctx.fillText('EST. 1898 • SPECIAL HISTORIC REPRINT', w / 2, 74);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#382A1D';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
      drawNewspaperBarcode(ctx, 45, h - 75, 120, 36);
    }
  },
  {
    id: 'newspaper_fashion_editorial',
    category: 'newspaper',
    name: 'Fashion Magazine Editorial',
    badge: 'High Fashion',
    bgColor: '#FAFAFA',
    textColor: '#09090B',
    accentColor: '#18181B',
    font: 'serif',
    subtitle: 'STUDIO EDITORIAL • PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#09090B';
      ctx.font = 'bold 28px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText('S T U D I O   E D I T O R I A L', w / 2, 52);
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('AUTUMN / WINTER COLLECTION • ISSUE 08', w / 2, 72);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      // Minimalist razor-thin 1px photo borders
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 1.5;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
      drawNewspaperBarcode(ctx, w - 160, h - 70, 120, 35);
    }
  },
  {
    id: 'newspaper_sports_chronicle',
    category: 'newspaper',
    name: 'Retro Sports Chronicle',
    badge: 'Sports News',
    bgColor: '#F1ECE1',
    textColor: '#1C1917',
    accentColor: '#DC2626',
    font: 'sporty',
    subtitle: 'SPORTS CHRONICLE • EDITION BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#F1ECE1';
      ctx.fillRect(0, 0, w, h);

      // Heavy black sports headline bar
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(35, 18, w - 70, 42);
      ctx.fillStyle = '#F1ECE1';
      ctx.font = 'bold 24px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE SPORTS CHRONICLE', w / 2, 47);

      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('MATCH REPORT: 10/10 PERFECT POSE SCORE • MVP OF THE DAY', w / 2, 78);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
      drawNewspaperBarcode(ctx, 40, h - 75, 120, 36);
    }
  },
  {
    id: 'newspaper_weekend_tabloid',
    category: 'newspaper',
    name: 'The Weekend Tabloid',
    badge: 'Tabloid',
    bgColor: '#EDE6DB',
    textColor: '#27201C',
    accentColor: '#78350F',
    font: 'serif',
    subtitle: 'WEEKEND TABLOID • BY SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#EDE6DB';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#27201C';
      ctx.fillRect(35, 20, w - 70, 42);
      ctx.fillStyle = '#EDE6DB';
      ctx.font = 'bold 26px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE WEEKEND GAZETTE', w / 2, 50);

      ctx.fillStyle = '#27201C';
      ctx.font = 'bold 11px sans-serif';
      const dateStr = getFormattedDate();
      ctx.fillText(`HOT OFF THE PRESS // ${dateStr.toUpperCase()}`, w / 2, 80);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#27201C';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      });
      drawNewspaperBarcode(ctx, 45, h - 75, 120, 36);
    }
  },

  // ========================================
  // KATEGORI 5: MINIMALIST & PASTEL (6 VARIAN)
  // ========================================
  {
    id: 'minimalist_cream',
    category: 'minimalist',
    name: 'Milk Vanilla Cream',
    badge: 'Best Seller',
    bgColor: '#FAF7F2',
    textColor: '#332E2B',
    accentColor: '#D4AF37',
    font: 'serif',
    subtitle: 'PHOTOBOOTH BY SHYPIX.ID • STUDIO 01',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, w, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 3;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
      });
      ctx.fillStyle = '#B8860B';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦', w / 2, 50);
    }
  },
  {
    id: 'minimalist_sage',
    category: 'minimalist',
    name: 'Matcha Sage Green',
    badge: 'Aesthetic',
    bgColor: '#EAF2EC',
    textColor: '#224831',
    accentColor: '#4A7C59',
    font: 'sans',
    subtitle: 'TIMELESS MOMENTS • BY SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#EAF2EC';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#DDEBE0';
      ctx.beginPath();
      ctx.arc(w / 2, -100, 250, 0, Math.PI * 2);
      ctx.fill();
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#C9DFC2';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 12);
      });
    }
  },
  {
    id: 'minimalist_blush',
    category: 'minimalist',
    name: 'Blush Baby Pink',
    badge: 'Popular',
    bgColor: '#FDEEF1',
    textColor: '#831843',
    accentColor: '#F472B6',
    font: 'handwriting',
    subtitle: 'SWEET MEMORIES ♡ PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FDEEF1';
      ctx.fillRect(0, 0, w, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FBCFE8';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 16);
      });
      drawHeart(ctx, w / 2 - 80, h - 50, 14, '#F472B6');
      drawHeart(ctx, w / 2 + 80, h - 50, 14, '#F472B6');
    }
  },
  {
    id: 'minimalist_lilac',
    category: 'minimalist',
    name: 'Pastel Lilac Cloud',
    badge: 'Cute',
    bgColor: '#F3EEF9',
    textColor: '#581C87',
    accentColor: '#A855F7',
    font: 'sans',
    subtitle: 'DREAMY DAYS ✦ BY SHYPIX.ID',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#F3EEF9';
      ctx.fillRect(0, 0, w, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#E9D5FF';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 14);
      });
      ctx.fillStyle = '#A855F7';
      ctx.font = '22px sans-serif';
      ctx.fillText('★', 45, 55);
      ctx.fillText('★', w - 45, 55);
    }
  },
  {
    id: 'minimalist_butter_yellow',
    category: 'minimalist',
    name: 'Butter Soft Yellow',
    badge: 'Sunny',
    bgColor: '#FEF8E7',
    textColor: '#854D0E',
    accentColor: '#F59E0B',
    font: 'sans',
    subtitle: 'SUNNY STUDIO • PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#FEF8E7';
      ctx.fillRect(0, 0, w, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 4;
      photoRects.forEach(r => {
        drawRoundedRectStroke(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 12);
      });
      drawSparkleStar(ctx, w / 2, 45, 14, '#F59E0B');
    }
  },
  {
    id: 'minimalist_charcoal',
    category: 'minimalist',
    name: 'Editorial Chic Dark',
    badge: 'Chic',
    bgColor: '#18181B',
    textColor: '#F4F4F5',
    accentColor: '#E4E4E7',
    font: 'sporty',
    subtitle: 'EDITORIAL ARCHIVE // PHOTOBOOTH BY SHYPIX',
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, w, h);
    },
    drawDecorations: (ctx, w, h, photoRects) => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;
      photoRects.forEach(r => {
        ctx.strokeRect(r.x - 5, r.y - 5, r.w + 10, r.h + 10);
      });
    }
  }
];

// ==========================================
// 4. INITIALIZATION ON DOM READY
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  preloadStickerImages();
  initWebcam();
  renderFrameTemplates();
  renderStickersTray('all');
  updatePoseThumbnails();
  renderFrameCanvas();
  setupDraggableStickers();
});

// ==========================================
// 5. STEP WORKFLOW CONTROLLER
// ==========================================
function goToStep(step) {
  currentStep = step;

  [1, 2, 3, 4].forEach(s => {
    const tab = document.getElementById(`stepTab${s}`);
    const numBadge = tab.querySelector('span:first-child');
    if (s === step) {
      tab.className = "flex-1 min-w-[110px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all bg-brand-500 text-white shadow-sm shadow-brand-200";
      numBadge.className = "w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]";
    } else {
      tab.className = "flex-1 min-w-[110px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all text-slate-500 hover:bg-slate-50";
      numBadge.className = "w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600";
    }

    const view = document.getElementById(`stepView${s}`);
    if (view) {
      if (s === step) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    }
  });

  if (step === 2) {
    updateCameraLayoutBadge();
  } else if (step === 3) {
    updatePoseThumbnails();
    renderFrameCanvas();
  } else if (step === 4) {
    const canvas = document.getElementById('photoCanvas');
    const finalImg = document.getElementById('finalDownloadPreview');
    finalImg.src = canvas.toDataURL('image/png');
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
  }

  lucide.createIcons();
}

// ==========================================
// 6. CAMERA & WEBCAM MANAGEMENT
// ==========================================
async function initWebcam() {
  const video = document.getElementById('webcam');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 960 },
        facingMode: "user"
      },
      audio: false
    });
    video.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    console.warn("Kamera tidak dapat diakses langsung:", err);
  }
}

function applyCameraFilter(filterName) {
  currentFilter = filterName;
  const video = document.getElementById('webcam');
  const retakeVideo = document.getElementById('retakeWebcam');
  
  const filterCSS = getCSSFilterString(filterName);
  if (video) video.style.filter = filterCSS;
  if (retakeVideo) retakeVideo.style.filter = filterCSS;

  updateActiveFilterButton(filterName);

  if (capturedPhotos.length > 0) {
    renderFrameCanvas();
  }
}

function getCSSFilterString(filter) {
  switch (filter) {
    case 'beauty':
      return 'brightness(1.08) contrast(1.02) saturate(1.08)';
    case 'bw':
      return 'grayscale(1) contrast(1.25) brightness(0.96)';
    case 'sepia':
      return 'sepia(0.65) contrast(1.05) brightness(0.96) saturate(1.1)';
    case 'warm':
      return 'sepia(0.2) saturate(1.35) brightness(1.05) hue-rotate(-8deg)';
    case 'cool':
      return 'saturate(0.9) brightness(1.02) contrast(1.05) hue-rotate(185deg)';
    default:
      return 'none';
  }
}

// ==========================================
// 7. LAYOUT & FRAME SELECTION
// ==========================================
function setLayout(mode) {
  if (isCapturing) return;
  layoutMode = mode;

  const btn3 = document.getElementById('btnLayoutStrip3');
  const btn4 = document.getElementById('btnLayoutStrip4');
  const btnGrid = document.getElementById('btnLayoutGrid');

  const activeCls = "px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-brand-500 text-white shadow-sm shadow-brand-200";
  const idleCls = "px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 hover:bg-white";

  btn3.className = mode === 'strip3' ? activeCls : idleCls;
  btn4.className = mode === 'strip4' ? activeCls : idleCls;
  btnGrid.className = mode === 'grid2x2' ? activeCls : idleCls;

  updateCameraLayoutBadge();

  if (capturedPhotos.length > 0) {
    renderFrameCanvas();
    updatePoseThumbnails();
  }
}

function updateCameraLayoutBadge() {
  const badge = document.getElementById('cameraLayoutBadge');
  if (layoutMode === 'strip3') {
    badge.innerText = 'Strip 1x3 (3 Pose)';
  } else if (layoutMode === 'strip4') {
    badge.innerText = 'Strip 1x4 (4 Pose)';
  } else {
    badge.innerText = 'Grid 2x2 (4 Pose)';
  }
}

function filterFrameCategory(cat) {
  activeCategory = cat;
  
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    if (tab.id === `catTab-${cat}`) {
      tab.className = "cat-tab px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-brand-500 text-white shadow-sm";
    } else {
      tab.className = "cat-tab px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-slate-100 text-slate-600 hover:bg-slate-200";
    }
  });

  renderFrameTemplates();
}

function renderFrameTemplates() {
  const container = document.getElementById('frameTemplatesGrid');
  container.innerHTML = '';

  const filtered = activeCategory === 'all' 
    ? FRAME_TEMPLATES 
    : FRAME_TEMPLATES.filter(f => f.category === activeCategory);

  filtered.forEach(tmpl => {
    const isSelected = tmpl.id === activeFrameId;
    const card = document.createElement('div');
    card.className = `cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col gap-2 relative ${
      isSelected 
        ? 'border-brand-500 bg-brand-50/50 shadow-md ring-2 ring-brand-200' 
        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
    }`;
    card.onclick = () => selectFrameTemplate(tmpl.id);

    // Highly detailed mini frame preview chip
    card.innerHTML = `
      <div class="w-full h-24 rounded-xl relative overflow-hidden flex flex-col items-center justify-between p-2 shadow-inner border border-black/5" style="background: ${tmpl.bgColor};">
        <div class="w-full flex justify-between items-center text-[8px] font-bold" style="color: ${tmpl.textColor};">
          <span>●●●</span>
          <span class="px-1.5 py-0.5 rounded bg-black/10 backdrop-blur-sm">${tmpl.badge}</span>
        </div>
        <div class="flex gap-1 items-center justify-center w-full my-auto">
          <div class="w-6 h-8 rounded bg-black/10 border border-black/20 flex items-center justify-center text-[7px] text-black/30">1</div>
          <div class="w-6 h-8 rounded bg-black/10 border border-black/20 flex items-center justify-center text-[7px] text-black/30">2</div>
        </div>
        <div class="text-[7.5px] font-extrabold uppercase tracking-wider truncate w-full text-center" style="color: ${tmpl.textColor};">
          ${tmpl.name}
        </div>
      </div>
      <div>
        <div class="font-bold text-xs text-slate-800 truncate">${tmpl.name}</div>
        <div class="text-[10px] text-slate-400 capitalize">${tmpl.category}</div>
      </div>
      ${isSelected ? '<div class="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold shadow">✓</div>' : ''}
    `;

    container.appendChild(card);
  });
}

function selectFrameTemplate(templateId) {
  activeFrameId = templateId;
  customBgOverride = null;
  customTextOverride = null;
  
  const tmpl = FRAME_TEMPLATES.find(t => t.id === templateId);
  if (tmpl) {
    document.getElementById('customFrameBg').value = tmpl.bgColor;
    document.getElementById('customFrameText').value = tmpl.textColor;
  }

  renderFrameTemplates();
  renderFrameCanvas();
}

function onCustomColorChange() {
  customBgOverride = document.getElementById('customFrameBg').value;
  customTextOverride = document.getElementById('customFrameText').value;
  renderFrameCanvas();
}

// ==========================================
// 8. AUDIO & SOUND EFFECTS (WEB AUDIO API)
// ==========================================
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('btnSoundToggle');
  const icon = document.getElementById('iconSound');
  if (soundEnabled) {
    btn.className = "w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors";
    icon.setAttribute('data-lucide', 'volume-2');
    btn.title = "Suara Shutter (Aktif)";
  } else {
    btn.className = "w-9 h-9 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-500 flex items-center justify-center transition-colors";
    icon.setAttribute('data-lucide', 'volume-x');
    btn.title = "Suara Shutter (Mati)";
  }
  lucide.createIcons();
}

function playBeep(freq = 800) {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
}

function playShutterSound() {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

function triggerFlash(flashId = 'flash') {
  const flash = document.getElementById(flashId);
  if (!flash) return;
  flash.classList.add('flash-active');
  playShutterSound();
  setTimeout(() => flash.classList.remove('flash-active'), 200);
}

// ==========================================
// 9. PHOTO CAPTURE SEQUENCE
// ==========================================
function setTimer(seconds) {
  if (isCapturing) return;
  captureTimer = seconds;
  [3, 5, 10].forEach(s => {
    const btn = document.getElementById(`btnTimer${s}`);
    if (s === seconds) {
      btn.className = "px-3 py-1.5 text-xs rounded-xl font-bold bg-brand-500 text-white shadow-sm transition-all";
    } else {
      btn.className = "px-3 py-1.5 text-xs rounded-xl font-bold bg-white text-slate-600 hover:bg-slate-100 transition-all";
    }
  });
}

async function startPhotoSequence() {
  if (isCapturing) return;
  isCapturing = true;
  capturedPhotos = [];

  const captureBtn = document.getElementById('captureBtn');
  const badge = document.getElementById('photoCounterBadge');
  const counterText = document.getElementById('photoCounterText');
  captureBtn.disabled = true;
  captureBtn.classList.add('opacity-50');

  const totalPhotos = layoutMode === 'strip3' ? 3 : 4;
  badge.classList.remove('hidden');

  for (let i = 1; i <= totalPhotos; i++) {
    counterText.innerText = `Pose ${i} dari ${totalPhotos}`;
    await runCountdown(captureTimer, 'countdown', 'countdownNumber');
    triggerFlash('flash');
    captureSinglePhoto();
    await new Promise(r => setTimeout(r, 700));
  }

  badge.classList.add('hidden');
  isCapturing = false;
  captureBtn.disabled = false;
  captureBtn.classList.remove('opacity-50');

  const skipBtn = document.getElementById('btnSkipToEdit');
  skipBtn.classList.remove('opacity-50', 'cursor-not-allowed');

  confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });

  setTimeout(() => {
    goToStep(3);
  }, 400);
}

function runCountdown(seconds, overlayId, numId) {
  return new Promise((resolve) => {
    const overlay = document.getElementById(overlayId);
    const numEl = document.getElementById(numId);
    overlay.classList.remove('hidden');
    let count = seconds;
    numEl.innerText = count;
    playBeep(800);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        numEl.innerText = count;
        playBeep(800);
      } else {
        clearInterval(interval);
        overlay.classList.add('hidden');
        playBeep(1200);
        resolve();
      }
    }, 1000);
  });
}

function captureSinglePhoto() {
  const video = document.getElementById('webcam');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth || 1280;
  tempCanvas.height = video.videoHeight || 960;
  const ctx = tempCanvas.getContext('2d');

  if (video.videoWidth > 0 && video.readyState >= 2) {
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  } else {
    drawCuteAvatarDemo(ctx, tempCanvas.width, tempCanvas.height, capturedPhotos.length + 1);
  }

  const img = new Image();
  img.src = tempCanvas.toDataURL('image/png');
  capturedPhotos.push(img);
}

function drawCuteAvatarDemo(ctx, w, h, poseNum) {
  const pastelColors = ['#FBCFE8', '#BAE6FD', '#BBF7D0', '#FEF08A'];
  ctx.fillStyle = pastelColors[(poseNum - 1) % pastelColors.length];
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Pose ${poseNum} ✨`, w / 2, h / 2 - 30);

  ctx.font = '28px sans-serif';
  const emojis = ['(˶ᵔ ᵕ ᵔ˶)', '(づ｡◕‿‿◕｡)づ', '(✿◠‿◠)', '(｡♥‿♥｡)'];
  ctx.fillText(emojis[(poseNum - 1) % emojis.length], w / 2, h / 2 + 35);
}

// ==========================================
// 10. RETAKE PER-POSE LOGIC
// ==========================================
function updatePoseThumbnails() {
  const container = document.getElementById('poseThumbnailsList');
  if (!container) return;
  container.innerHTML = '';

  const total = layoutMode === 'strip3' ? 3 : 4;
  for (let i = 0; i < total; i++) {
    const imgObj = capturedPhotos[i];
    const card = document.createElement('div');
    card.className = "flex flex-col items-center bg-slate-50 p-2 rounded-2xl border border-slate-200 gap-1.5 relative group";

    if (imgObj) {
      card.innerHTML = `
        <div class="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 relative">
          <img src="${imgObj.src}" class="w-full h-full object-cover">
          <div class="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white font-bold">Pose ${i + 1}</div>
        </div>
        <button onclick="openRetakeModal(${i})" class="w-full py-1 bg-white hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-bold rounded-lg border border-slate-200 text-[10px] flex items-center justify-center gap-1 transition-colors">
          <i data-lucide="camera" class="w-3 h-3 text-brand-500"></i>
          <span>Foto Ulang</span>
        </button>
      `;
    } else {
      card.innerHTML = `
        <div class="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
          Pose ${i + 1}
        </div>
        <button onclick="openRetakeModal(${i})" class="w-full py-1 bg-brand-500 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1">
          <span>Ambil Foto</span>
        </button>
      `;
    }
    container.appendChild(card);
  }
  lucide.createIcons();
}

function openRetakeModal(index) {
  activeRetakeIndex = index;
  const modal = document.getElementById('retakeModal');
  const title = document.getElementById('retakeModalTitle');
  const retakeVideo = document.getElementById('retakeWebcam');
  
  title.innerText = `Foto Ulang Pose ${index + 1}`;
  modal.classList.remove('hidden');

  if (currentStream) {
    retakeVideo.srcObject = currentStream;
    retakeVideo.style.filter = getCSSFilterString(currentFilter);
  }
}

function closeRetakeModal() {
  document.getElementById('retakeModal').classList.add('hidden');
  activeRetakeIndex = null;
}

async function executeRetake() {
  if (isRetaking || activeRetakeIndex === null) return;
  isRetaking = true;
  const btn = document.getElementById('btnExecuteRetake');
  btn.disabled = true;

  await runCountdown(3, 'retakeCountdown', 'retakeCountdownNum');
  triggerFlash('retakeFlash');

  const retakeVideo = document.getElementById('retakeWebcam');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = retakeVideo.videoWidth || 1280;
  tempCanvas.height = retakeVideo.videoHeight || 960;
  const ctx = tempCanvas.getContext('2d');

  if (retakeVideo.videoWidth > 0 && retakeVideo.readyState >= 2) {
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(retakeVideo, 0, 0, tempCanvas.width, tempCanvas.height);
  } else {
    drawCuteAvatarDemo(ctx, tempCanvas.width, tempCanvas.height, activeRetakeIndex + 1);
  }

  const img = new Image();
  img.src = tempCanvas.toDataURL('image/png');
  img.onload = () => {
    capturedPhotos[activeRetakeIndex] = img;
    updatePoseThumbnails();
    renderFrameCanvas();
    isRetaking = false;
    btn.disabled = false;
    closeRetakeModal();
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.6 } });
  };
}

function retakeAllPhotos() {
  if (confirm("Ingin foto ulang semua pose dari awal?")) {
    capturedPhotos = [];
    goToStep(2);
  }
}

// ==========================================
// 11. FILTER SELECTION (STEP 3)
// ==========================================
function setFilterMode(filter) {
  currentFilter = filter;
  updateActiveFilterButton(filter);
  
  const selectLive = document.getElementById('liveCameraFilter');
  if (selectLive) selectLive.value = filter;
  const video = document.getElementById('webcam');
  if (video) video.style.filter = getCSSFilterString(filter);

  renderFrameCanvas();
}

function updateActiveFilterButton(filter) {
  const allBtns = document.querySelectorAll('.filter-opt-btn');
  allBtns.forEach(btn => {
    if (btn.id === `filterBtn-${filter}`) {
      btn.className = "filter-opt-btn p-2 rounded-xl text-center border-2 border-brand-500 bg-brand-50/50 text-xs font-bold text-slate-800 transition-all";
    } else {
      btn.className = "filter-opt-btn p-2 rounded-xl text-center border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all";
    }
  });
}

function applyCanvasFilter(ctx, filter) {
  switch (filter) {
    case 'beauty':
      ctx.filter = 'brightness(108%) contrast(102%) saturate(108%)';
      break;
    case 'bw':
      ctx.filter = 'grayscale(100%) contrast(125%) brightness(96%)';
      break;
    case 'sepia':
      ctx.filter = 'sepia(65%) contrast(105%) brightness(96%) saturate(110%)';
      break;
    case 'warm':
      ctx.filter = 'sepia(20%) saturate(135%) brightness(105%) hue-rotate(-8deg)';
      break;
    case 'cool':
      ctx.filter = 'saturate(90%) brightness(102%) contrast(105%) hue-rotate(185deg)';
      break;
    default:
      ctx.filter = 'none';
      break;
  }
}

// ==========================================
// 12. CUSTOM VECTOR SVG STICKER DRAWER & DRAG
// ==========================================
function filterStickers(cat) {
  const tabs = document.querySelectorAll('.stk-cat');
  tabs.forEach(t => {
    if (t.id === `stkTab-${cat}`) {
      t.className = "stk-cat px-2.5 py-1 rounded-lg font-bold bg-brand-500 text-white whitespace-nowrap";
    } else {
      t.className = "stk-cat px-2.5 py-1 rounded-lg font-medium bg-slate-100 text-slate-600 whitespace-nowrap";
    }
  });
  renderStickersTray(cat);
}

function renderStickersTray(category) {
  const tray = document.getElementById('stickersTray');
  tray.innerHTML = '';

  const list = category === 'all' 
    ? STICKER_CATALOG 
    : STICKER_CATALOG.filter(s => s.cat === category);

  list.forEach(item => {
    const btn = document.createElement('button');
    btn.className = "w-11 h-11 p-1 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm";
    btn.innerHTML = `<div class="w-full h-full pointer-events-none">${item.svg}</div>`;
    btn.title = item.name;
    btn.onclick = () => addVectorSticker(item.id);
    tray.appendChild(btn);
  });
}

function addVectorSticker(stickerId) {
  const newSticker = {
    uid: 'stk_' + Date.now() + Math.random(),
    stickerId: stickerId,
    x: 0.5,
    y: 0.5,
    size: 55,
    rotation: 0
  };
  stickers.push(newSticker);
  selectedStickerUid = newSticker.uid;
  updateStickerElements();
  renderFrameCanvas();
}

function deleteSticker(uid, event) {
  if (event) event.stopPropagation();
  stickers = stickers.filter(s => s.uid !== uid);
  selectedStickerUid = null;
  updateStickerElements();
  renderFrameCanvas();
}

function rotateSticker(uid, event) {
  if (event) event.stopPropagation();
  const s = stickers.find(item => item.uid === uid);
  if (s) {
    s.rotation = (s.rotation + 15) % 360;
    updateStickerElements();
    renderFrameCanvas();
  }
}

function scaleSelectedSticker(factor) {
  if (!selectedStickerUid) return;
  const s = stickers.find(item => item.uid === selectedStickerUid);
  if (s) {
    s.size = Math.max(25, Math.min(180, Math.round(s.size * factor)));
    updateStickerElements();
    renderFrameCanvas();
  }
}

function rotateSelectedSticker(deg) {
  if (!selectedStickerUid) return;
  const s = stickers.find(item => item.uid === selectedStickerUid);
  if (s) {
    s.rotation = (s.rotation + deg) % 360;
    updateStickerElements();
    renderFrameCanvas();
  }
}

function updateStickerElements() {
  const layer = document.getElementById('stickersLayer');
  layer.innerHTML = '';
  document.getElementById('stickerCountBadge').innerText = stickers.length;

  const wrapper = document.getElementById('previewInteractiveWrapper');
  const img = document.getElementById('resultImage');
  const imgRect = img.getBoundingClientRect();
  const wrapRect = wrapper.getBoundingClientRect();

  if (imgRect.width <= 0 || imgRect.height <= 0) return;

  const offsetX = imgRect.left - wrapRect.left;
  const offsetY = imgRect.top - wrapRect.top;
  const w = imgRect.width;
  const h = imgRect.height;

  stickers.forEach(s => {
    const stickerDef = STICKER_CATALOG.find(def => def.id === s.stickerId);
    if (!stickerDef) return;

    const el = document.createElement('div');
    const isSelected = s.uid === selectedStickerUid;
    el.className = `draggable-sticker ${isSelected ? 'selected' : ''}`;
    
    // Proportional preview size
    const previewSize = (s.size * w) / 450;
    el.style.width = `${previewSize}px`;
    el.style.height = `${previewSize}px`;
    el.style.left = `${offsetX + s.x * w - previewSize / 2}px`;
    el.style.top = `${offsetY + s.y * h - previewSize / 2}px`;
    el.style.transform = `rotate(${s.rotation}deg)`;

    el.innerHTML = `
      <div class="w-full h-full pointer-events-none">${stickerDef.svg}</div>
      ${isSelected ? `
        <button onclick="deleteSticker('${s.uid}', event)" class="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">✕</button>
        <button onclick="rotateSticker('${s.uid}', event)" class="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shadow-md" title="Putar">↻</button>
      ` : ''}
    `;

    el.onpointerdown = (e) => onStickerPointerDown(e, s);
    layer.appendChild(el);
  });
}

function onStickerPointerDown(e, sticker) {
  e.preventDefault();
  selectedStickerUid = sticker.uid;
  activeDrag = {
    sticker: sticker,
    startX: e.clientX,
    startY: e.clientY,
    origX: sticker.x,
    origY: sticker.y
  };
  updateStickerElements();

  window.addEventListener('pointermove', onStickerPointerMove);
  window.addEventListener('pointerup', onStickerPointerUp);
}

function onStickerPointerMove(e) {
  if (!activeDrag) return;
  const img = document.getElementById('resultImage');
  const imgRect = img.getBoundingClientRect();
  if (imgRect.width === 0 || imgRect.height === 0) return;

  const deltaX = (e.clientX - activeDrag.startX) / imgRect.width;
  const deltaY = (e.clientY - activeDrag.startY) / imgRect.height;

  activeDrag.sticker.x = Math.max(0.04, Math.min(0.96, activeDrag.origX + deltaX));
  activeDrag.sticker.y = Math.max(0.04, Math.min(0.96, activeDrag.origY + deltaY));

  updateStickerElements();
}

function onStickerPointerUp() {
  if (activeDrag) {
    activeDrag = null;
    window.removeEventListener('pointermove', onStickerPointerMove);
    window.removeEventListener('pointerup', onStickerPointerUp);
    renderFrameCanvas();
  }
}

function clearAllStickers() {
  stickers = [];
  selectedStickerUid = null;
  updateStickerElements();
  renderFrameCanvas();
}

function setupDraggableStickers() {
  window.addEventListener('resize', () => {
    updateStickerElements();
  });
}

function onCustomTextChange() {
  renderFrameCanvas();
}

// ==========================================
// 13. MASTER CANVAS FRAME RENDER ENGINE
// ==========================================
function renderFrameCanvas() {
  const canvas = document.getElementById('photoCanvas');
  const ctx = canvas.getContext('2d');

  const tmpl = FRAME_TEMPLATES.find(t => t.id === activeFrameId) || FRAME_TEMPLATES[0];
  const bgColor = customBgOverride || tmpl.bgColor;
  const textColor = customTextOverride || tmpl.textColor;

  const textInput = document.getElementById('frameTextInput');
  const footerText = textInput ? textInput.value : 'Photobooth by shypix.id';
  const fontFamilyChoice = document.getElementById('frameFontFamily')?.value || 'sans';
  const showDate = document.getElementById('toggleDateStamp')?.checked ?? true;

  // High-Resolution Base Dimensions
  let canvasW, canvasH;
  let photoSlots = [];
  const slotW = 680;
  const slotH = 510;
  const marginX = 60;
  const marginY = 32;
  const headerSpace = 75;
  const footerSpace = 130;

  if (layoutMode === 'strip3') {
    canvasW = slotW + marginX * 2;
    canvasH = headerSpace + (slotH * 3) + (marginY * 2) + footerSpace;
    for (let i = 0; i < 3; i++) {
      photoSlots.push({
        x: marginX,
        y: headerSpace + i * (slotH + marginY),
        w: slotW,
        h: slotH
      });
    }
  } else if (layoutMode === 'strip4') {
    canvasW = slotW + marginX * 2;
    canvasH = headerSpace + (slotH * 4) + (marginY * 3) + footerSpace;
    for (let i = 0; i < 4; i++) {
      photoSlots.push({
        x: marginX,
        y: headerSpace + i * (slotH + marginY),
        w: slotW,
        h: slotH
      });
    }
  } else { // 'grid2x2'
    canvasW = (slotW * 2) + (marginX * 2) + marginY;
    canvasH = headerSpace + (slotH * 2) + marginY + footerSpace;
    photoSlots = [
      { x: marginX, y: headerSpace, w: slotW, h: slotH },
      { x: marginX + slotW + marginY, y: headerSpace, w: slotW, h: slotH },
      { x: marginX, y: headerSpace + slotH + marginY, w: slotW, h: slotH },
      { x: marginX + slotW + marginY, y: headerSpace + slotH + marginY, w: slotW, h: slotH }
    ];
  }

  canvas.width = canvasW;
  canvas.height = canvasH;

  // 1. Draw Native Background
  ctx.save();
  if (customBgOverride) {
    ctx.fillStyle = customBgOverride;
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else {
    tmpl.drawBackground(ctx, canvasW, canvasH);
  }
  ctx.restore();

  // 2. Draw Photos into slots
  ctx.save();
  applyCanvasFilter(ctx, currentFilter);

  photoSlots.forEach((slot, idx) => {
    const img = capturedPhotos[idx];
    if (img) {
      drawCoverImage(ctx, img, slot.x, slot.y, slot.w, slot.h, 10);
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      drawRoundedRect(ctx, slot.x, slot.y, slot.w, slot.h, 10);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`[ Pose ${idx + 1} Kosong ]`, slot.x + slot.w / 2, slot.y + slot.h / 2);
      ctx.restore();
    }
  });
  ctx.restore();

  // 3. Draw Template Vector Decorations
  ctx.save();
  tmpl.drawDecorations(ctx, canvasW, canvasH, photoSlots);
  ctx.restore();

  // 4. Draw Footer Branding & Typography
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';

  let resolvedFont = 'bold 24px "Plus Jakarta Sans", sans-serif';
  if (fontFamilyChoice === 'serif' || tmpl.font === 'serif') {
    resolvedFont = 'bold 26px "Playfair Display", Georgia, serif';
  } else if (fontFamilyChoice === 'sporty' || tmpl.font === 'sporty') {
    resolvedFont = 'bold 22px "Space Grotesk", sans-serif';
  } else if (fontFamilyChoice === 'handwriting' || tmpl.font === 'handwriting') {
    resolvedFont = 'bold 28px "Caveat", cursive';
  }

  ctx.font = resolvedFont;
  ctx.fillText(footerText, canvasW / 2, canvasH - (showDate ? 55 : 45));

  if (showDate) {
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText(getFormattedDate(), canvasW / 2, canvasH - 30);
    ctx.globalAlpha = 1.0;
  }
  ctx.restore();

  // 5. Draw Placed Custom Vector SVG Stickers onto Canvas
  ctx.save();
  stickers.forEach(s => {
    const img = stickerImgCache[s.stickerId];
    if (!img) return;

    const posX = s.x * canvasW;
    const posY = s.y * canvasH;
    const scale = canvasW / 450;
    const scaledSize = Math.round(s.size * scale);

    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.drawImage(img, -scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize);
    ctx.restore();
  });
  ctx.restore();

  // 6. Update Preview Image
  const resultImg = document.getElementById('resultImage');
  if (resultImg) {
    resultImg.src = canvas.toDataURL('image/png');
    resultImg.onload = () => {
      updateStickerElements();
    };
  }
}

// ==========================================
// 14. CANVAS DRAWING HELPERS (100% NATIVE)
// ==========================================
function drawCoverImage(ctx, img, x, y, w, h, radius = 0) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let renderW = w;
  let renderH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    renderW = h * imgRatio;
    offsetX = (w - renderW) / 2;
  } else {
    renderH = w / imgRatio;
    offsetY = (h - renderH) / 2;
  }

  ctx.save();
  ctx.beginPath();
  if (radius > 0) {
    drawRoundedRect(ctx, x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  ctx.drawImage(img, x + offsetX, y + offsetY, renderW, renderH);
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRoundedRectStroke(ctx, x, y, w, h, r) {
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const d = size;
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x, y - d / 2, x - d, y - d / 2, x - d, y);
  ctx.bezierCurveTo(x - d, y + d / 2, x, y + d, x, y + d * 1.3);
  ctx.bezierCurveTo(x, y + d, x + d, y + d / 2, x + d, y);
  ctx.bezierCurveTo(x + d, y - d / 2, x, y - d / 2, x, y);
  ctx.fill();
  ctx.restore();
}

function drawCheckeredBand(ctx, x, y, w, h, squareSize) {
  ctx.save();
  const cols = Math.ceil(w / squareSize);
  const rows = Math.ceil(h / squareSize);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#000000' : '#FFFFFF';
      ctx.fillRect(x + c * squareSize, y + r * squareSize, squareSize, squareSize);
    }
  }
  ctx.restore();
}

function drawCheckeredVerticalBand(ctx, x, y, w, h, squareSize) {
  drawCheckeredBand(ctx, x, y, w, h, squareSize);
}

function drawCheckerPatch(ctx, x, y, w, h, squareSize, c1, c2) {
  ctx.save();
  const cols = Math.ceil(w / squareSize);
  const rows = Math.ceil(h / squareSize);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? c1 : c2;
      ctx.fillRect(x + c * squareSize, y + r * squareSize, squareSize, squareSize);
    }
  }
  ctx.restore();
}

function drawSnowflakes(ctx, w, h, count) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < count; i++) {
    const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
    const sy = (Math.cos(i * 678.9) * 0.5 + 0.5) * h;
    const radius = (i % 3) + 2;
    ctx.globalAlpha = 0.4 + (i % 5) * 0.12;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();

    if (i % 7 === 0) {
      drawSparkleStar(ctx, sx, sy, 8, '#FFFFFF');
    }
  }
  ctx.restore();
}

function drawHolly(ctx, x, y, dir = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.ellipse(-14, 0, 16, 8, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(14, 0, 16, 8, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(0, -2, 6, 0, Math.PI * 2);
  ctx.arc(-6, 4, 5, 0, Math.PI * 2);
  ctx.arc(6, 4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-1, -4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawChristmasBauble(ctx, x, y, r, color) {
  ctx.save();
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, y - r);
  ctx.stroke();

  ctx.fillStyle = '#CA8A04';
  ctx.fillRect(x - 3, y - r - 4, 6, 4);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCandyBorder(ctx, w, h) {
  ctx.save();
  const stripeW = 20;
  const count = Math.ceil((w + h) / stripeW);
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.2)';
  ctx.lineWidth = 9;
  for (let i = -count; i < count; i++) {
    ctx.beginPath();
    ctx.moveTo(i * stripeW * 2, 0);
    ctx.lineTo(i * stripeW * 2 + h, h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSparkleStar(ctx, cx, cy, spikes, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - spikes);
  ctx.quadraticCurveTo(cx, cy, cx + spikes, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + spikes);
  ctx.quadraticCurveTo(cx, cy, cx - spikes, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - spikes);
  ctx.fill();
  ctx.restore();
}

function drawRetroFlower(ctx, cx, cy, r, petalColor, centerColor) {
  ctx.save();
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const px = cx + Math.cos(angle) * (r * 0.8);
    const py = cy + Math.sin(angle) * (r * 0.8);
    ctx.beginPath();
    ctx.arc(px, py, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGrooveRibbon(ctx, x, y, w, h, c1, c2, c3) {
  ctx.save();
  const step = h / 3;
  ctx.fillStyle = c1;
  ctx.fillRect(x, y, w, step);
  ctx.fillStyle = c2;
  ctx.fillRect(x, y + step, w, step);
  ctx.fillStyle = c3;
  ctx.fillRect(x, y + step * 2, w, step);
  ctx.restore();
}

function drawNewspaperBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#1A1817';
  let curX = x;
  let i = 0;
  while (curX < x + w - 10) {
    const lineW = (i % 3 === 0) ? 3 : (i % 5 === 0) ? 4 : 1.5;
    ctx.fillRect(curX, y, lineW, h - 12);
    curX += lineW + ((i % 4) + 1.5);
    i++;
  }
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('0 12894 77652 4', x + w / 2, y + h);
  ctx.restore();
}

function getFormattedDate() {
  const d = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ==========================================
// 15. DOWNLOAD & QR CODE TRANSFER
// ==========================================
function downloadHighResPhoto() {
  const canvas = document.getElementById('photoCanvas');
  const link = document.createElement('a');
  link.download = `photobooth-by-shypix-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
}

function openQRCodeModal() {
  const modal = document.getElementById('qrModal');
  const qrContainer = document.getElementById('qrcodeDisplay');
  qrContainer.innerHTML = '';

  modal.classList.remove('hidden');

  try {
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: window.location.href,
        width: 180,
        height: 180,
        colorDark: "#18181B",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      qrContainer.innerHTML = `
        <div class="p-4 text-xs text-slate-500 flex flex-col items-center gap-2">
          <i data-lucide="download" class="w-8 h-8 text-brand-500"></i>
          <span>Gunakan tombol unduh di bawah untuk menyimpan langsung ke HP Anda.</span>
        </div>`;
      lucide.createIcons();
    }
  } catch (err) {
    qrContainer.innerText = "Gunakan tombol unduh di bawah untuk menyimpan gambar.";
  }
}

function closeQRCodeModal() {
  document.getElementById('qrModal').classList.add('hidden');
}

async function sharePhotoMobile() {
  const canvas = document.getElementById('photoCanvas');
  if (navigator.share && navigator.canShare) {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'photobooth-by-shypix.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Foto Photobooth by shypix.id',
            text: 'Lihat hasil fotoku di Photobooth by shypix.id!',
            files: [file]
          });
        } catch (err) {
          console.log('Share canceled/failed:', err);
        }
      } else {
        downloadHighResPhoto();
      }
    });
  } else {
    downloadHighResPhoto();
  }
}

function resetPhotobooth() {
  if (confirm("Mulai sesi baru? Semua foto saat ini akan direset.")) {
    capturedPhotos = [];
    stickers = [];
    goToStep(1);
  }
}

// ==========================================
// 16. WEBSITE THEME PICKER
// ==========================================
function setSiteTheme(theme) {
  if (siteThemes[theme]) {
    document.body.style.backgroundColor = siteThemes[theme];
  }
}
