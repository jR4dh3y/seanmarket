import { NextResponse } from "next/server";
import { getSkins, saveSkins } from "@/lib/storage";
import { fetchSkinPrice } from "@/lib/steam-api";
import { extractMarketHashName } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const skins = await getSkins();
    return NextResponse.json({ skins });
  } catch (error) {
    console.error("Error fetching skins:", error);
    return NextResponse.json(
      { error: "Failed to fetch skins" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    const marketHashName = extractMarketHashName(input);
    
    // Check if skin already exists
    const existingSkins = await getSkins();
    const existing = existingSkins.find(
      (s) => s.market_hash_name.toLowerCase() === marketHashName.toLowerCase()
    );
    
    if (existing) {
      return NextResponse.json(
        { error: "This skin is already being tracked" },
        { status: 400 }
      );
    }

    // Fetch price from Steam
    const priceData = await fetchSkinPrice(marketHashName);
    
    if (!priceData) {
      return NextResponse.json(
        { error: "Could not fetch price for this skin. Please check the name." },
        { status: 400 }
      );
    }

    const newSkin = {
      id: uuidv4(),
      market_hash_name: marketHashName,
      image: `https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEm1Rd6dd2j6fE8YXwjFK-_RY-Yjv0I4KVJFM5NQ7S-wK9yOa6hJ_p7pnJyCV9-n51KFYkzQ`,
      current_price: priceData.price,
      average_price_7d: priceData.average,
      last_updated: Date.now(),
      currency_symbol: priceData.currency,
    };

    const updatedSkins = [...existingSkins, newSkin];
    await saveSkins(updatedSkins);

    return NextResponse.json({ skin: newSkin });
  } catch (error) {
    console.error("Error adding skin:", error);
    return NextResponse.json(
      { error: "Failed to add skin" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Skin ID is required" },
        { status: 400 }
      );
    }

    const skins = await getSkins();
    const updatedSkins = skins.filter((s) => s.id !== id);

    if (skins.length === updatedSkins.length) {
      return NextResponse.json(
        { error: "Skin not found" },
        { status: 404 }
      );
    }

    await saveSkins(updatedSkins);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skin:", error);
    return NextResponse.json(
      { error: "Failed to delete skin" },
      { status: 500 }
    );
  }
}
