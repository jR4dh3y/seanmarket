import { get } from '@vercel/edge-config';
import { Skin } from './types';
import fs from 'fs/promises';
import path from 'path';

const LOCAL_FILE_PATH = path.join(process.cwd(), 'skins.json');
const EDGE_CONFIG_KEY = 'skins';

export async function getSkins(): Promise<Skin[]> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelApiToken = process.env.VERCEL_API_TOKEN;

  if (edgeConfigId && vercelApiToken) {
    try {
      // Use the Edge Config SDK for reading (optimized, fast)
      const skins = await get<Skin[]>(EDGE_CONFIG_KEY);
      return skins || [];
    } catch (error) {
      console.error("Error fetching from Edge Config:", error);
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
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelApiToken = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (edgeConfigId && vercelApiToken) {
    try {
      // Use Vercel REST API for writing
      const url = teamId 
        ? `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?teamId=${teamId}`
        : `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${vercelApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: EDGE_CONFIG_KEY,
              value: skins,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Edge Config API error:", errorData);
        throw new Error(`Failed to save to Edge Config: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving to Edge Config:", error);
      throw error;
    }
  } else {
    try {
      await fs.writeFile(LOCAL_FILE_PATH, JSON.stringify(skins, null, 2));
    } catch (error) {
      console.error("Error saving to local file:", error);
      throw new Error("Failed to save data.");
    }
  }
}
