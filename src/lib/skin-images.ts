// Skin image lookup table
// This module fetches and caches skin images from a public CS2 API

const CSGO_API_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json";

interface SkinData {
  id: string;
  name: string;
  image: string;
  weapon: {
    id: string;
    name: string;
  };
  pattern: {
    id: string;
    name: string;
  };
  wears: Array<{
    id: string;
    name: string;
  }>;
}

// In-memory cache for skin images
let skinImageCache: Map<string, string> | null = null;
let cachePromise: Promise<Map<string, string>> | null = null;

// Normalize a market hash name for lookup
// e.g., "AK-47 | Redline (Field-Tested)" -> "ak-47 | redline"
function normalizeForLookup(marketHashName: string): string {
  return marketHashName
    .toLowerCase()
    .replace(/\s*\((factory new|minimal wear|field-tested|well-worn|battle-scarred)\)\s*/gi, '')
    .trim();
}

// Build the skin image cache from the API
async function buildSkinImageCache(): Promise<Map<string, string>> {
  console.log("Building skin image cache...");
  
  const cache = new Map<string, string>();
  
  try {
    const response = await fetch(CSGO_API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch skin data: ${response.status}`);
      return cache;
    }
    
    const skins: SkinData[] = await response.json();
    
    for (const skin of skins) {
      if (skin.image && skin.name) {
        // Store with normalized name (without wear condition)
        const baseName = normalizeForLookup(skin.name);
        cache.set(baseName, skin.image);
        
        // Also store the full name with each wear condition
        if (skin.wears) {
          for (const wear of skin.wears) {
            const fullName = `${skin.name.replace(/★\s*/, '')} (${wear.name})`.toLowerCase();
            cache.set(fullName, skin.image);
            
            // Handle StatTrak versions
            const statTrakName = `stattrak™ ${fullName}`;
            cache.set(statTrakName, skin.image);
          }
        }
      }
    }
    
    console.log(`Skin image cache built with ${cache.size} entries`);
  } catch (error) {
    console.error("Error building skin image cache:", error);
  }
  
  return cache;
}

// Get the skin image cache, building it if necessary
async function getSkinImageCache(): Promise<Map<string, string>> {
  if (skinImageCache) {
    return skinImageCache;
  }
  
  // If we're already building the cache, wait for it
  if (cachePromise) {
    return cachePromise;
  }
  
  // Build the cache
  cachePromise = buildSkinImageCache();
  skinImageCache = await cachePromise;
  cachePromise = null;
  
  return skinImageCache;
}

// Look up a skin image by market hash name
export async function getSkinImage(marketHashName: string): Promise<string | null> {
  const cache = await getSkinImageCache();
  
  // Try exact match first (lowercase)
  const lowerName = marketHashName.toLowerCase();
  if (cache.has(lowerName)) {
    return cache.get(lowerName) || null;
  }
  
  // Try without wear condition
  const normalized = normalizeForLookup(marketHashName);
  if (cache.has(normalized)) {
    return cache.get(normalized) || null;
  }
  
  // Try removing ★ prefix
  const withoutStar = normalized.replace(/^★\s*/, '');
  if (cache.has(withoutStar)) {
    return cache.get(withoutStar) || null;
  }
  
  // Try partial matching - find skins that contain the weapon and pattern
  const parts = normalized.split('|').map(p => p.trim());
  if (parts.length === 2) {
    const weapon = parts[0];
    const pattern = parts[1];
    
    for (const [key, value] of cache.entries()) {
      if (key.includes(weapon) && key.includes(pattern)) {
        return value;
      }
    }
  }
  
  console.log(`No image found for: ${marketHashName} (normalized: ${normalized})`);
  return null;
}

// Force refresh the cache
export async function refreshSkinImageCache(): Promise<void> {
  skinImageCache = null;
  cachePromise = null;
  await getSkinImageCache();
}
