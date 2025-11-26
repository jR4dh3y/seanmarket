import { put, list } from '@vercel/blob';
import { Skin } from './types';
import fs from 'fs/promises';
import path from 'path';

const LOCAL_FILE_PATH = path.join(process.cwd(), 'skins.json');
const BLOB_PATHNAME = 'skins.json';

export async function getSkins(): Promise<Skin[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    try {
      // List blobs with the specific prefix to find our file
      const { blobs } = await list({ 
        token,
        prefix: BLOB_PATHNAME,
      });
      
      // Find exact match
      const blob = blobs.find(b => b.pathname === BLOB_PATHNAME);
      
      if (!blob) {
        return [];
      }

      // Fetch with cache busting - append random query to bypass CDN cache
      const noCacheUrl = `${blob.url}${blob.url.includes('?') ? '&' : '?'}_=${Date.now()}-${Math.random()}`;
      const response = await fetch(noCacheUrl, {
        cache: 'no-store',
        next: { revalidate: 0 },
      } as RequestInit);
      
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching from Vercel Blob:", error);
      return [];
    }
  } else {
    // Fallback to local file
    try {
      const data = await fs.readFile(LOCAL_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
}

export async function saveSkins(skins: Skin[]): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const data = JSON.stringify(skins, null, 2);

  if (token) {
    try {
      await put(BLOB_PATHNAME, data, { 
        access: 'public', 
        token, 
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0, // Disable caching
      });
    } catch (error) {
      console.error("Error saving to Vercel Blob:", error);
      throw error;
    }
  } else {
    // Fallback to local file
    try {
      await fs.writeFile(LOCAL_FILE_PATH, data);
    } catch (error) {
      console.error("Error saving to local file:", error);
      throw new Error("Failed to save data. If running on Vercel, ensure BLOB_READ_WRITE_TOKEN is set.");
    }
  }
}
