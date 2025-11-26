import { NextResponse } from "next/server";
import { getSkins, saveSkins } from "@/lib/storage";
import { fetchSkinPrice } from "@/lib/steam-api";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const skins = await getSkins();

    if (id) {
      // Refresh a specific skin
      const skinIndex = skins.findIndex((s) => s.id === id);
      if (skinIndex === -1) {
        return NextResponse.json(
          { error: "Skin not found" },
          { status: 404 }
        );
      }

      const skin = skins[skinIndex];
      const priceData = await fetchSkinPrice(skin.market_hash_name);

      if (priceData) {
        skins[skinIndex] = {
          ...skin,
          current_price: priceData.price,
          average_price_7d: priceData.average,
          last_updated: Date.now(),
        };
      }

      await saveSkins(skins);
      return NextResponse.json({ skin: skins[skinIndex] });
    } else {
      // Refresh all skins
      const updatedSkins = await Promise.all(
        skins.map(async (skin) => {
          const priceData = await fetchSkinPrice(skin.market_hash_name);
          if (priceData) {
            return {
              ...skin,
              current_price: priceData.price,
              average_price_7d: priceData.average,
              last_updated: Date.now(),
            };
          }
          return skin;
        })
      );

      await saveSkins(updatedSkins);
      return NextResponse.json({ skins: updatedSkins });
    }
  } catch (error) {
    console.error("Error refreshing skins:", error);
    return NextResponse.json(
      { error: "Failed to refresh prices" },
      { status: 500 }
    );
  }
}
