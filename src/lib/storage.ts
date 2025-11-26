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
      const { blobs } = await list({ token });
      const blob = blobs.find(b => b.pathname === BLOB_PATHNAME);
      
      if (!blob) {
        return [];
      }

      const response = await fetch(blob.downloadUrl);
      
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
      });
    } catch (error) {
      console.error("Error saving to Vercel Blob:", error);
      throw error;
    }
  } else {
    try {
      await fs.writeFile(LOCAL_FILE_PATH, data);
    } catch (error) {
      console.error("Error saving to local file:", error);
      throw new Error("Failed to save data.");
    }
  }
}
}
