import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, ProductModel } from "../src/lib/db";

// NOTE: prices are placeholders. Set real prices in the dashboard.
const naira = (n: number) => n * 100;

async function main() {
  await connectDB();
  await ProductModel.syncIndexes(); // creates the unique indexes (slug, order reference)
  const products = [
    {
      name: "Crispy plantain chips",
      slug: "crispy-plantain-chips",
      category: "CHIPS" as const,
      tagline: "Ripe (dodo) or unripe, fried crisp and sealed in a gold pouch.",
      description:
        "Thin-sliced plantain fried until it snaps. Pick the ripe dodo chips for a sweet, spiced crunch, or unripe for a firmer, savoury bite. Comes in a resealable pouch so the last handful is as crisp as the first.",
      ingredients: "Plantain, onions, table salt, chilli pepper, vegetable oil.",
      usage: "Eat as snacks, straight from the pouch.\nStore in a cool, dry place and reseal after opening.",
      highlights: ["100% natural", "No additives", "Resealable pouch"],
      images: ["/products/chips-ripe.webp", "/products/chips-unripe.webp"],
      featured: true,
      sortOrder: 1,
      variants: [
        { label: "Ripe (dodo), spiced", priceKobo: naira(1500), stock: 60, image: "/products/chips-ripe.webp", sortOrder: 0 },
        { label: "Unripe", priceKobo: naira(1500), stock: 60, image: "/products/chips-unripe.webp", sortOrder: 1 },
      ],
    },
    {
      name: "Unripe plantain flour",
      slug: "unripe-plantain-flour",
      category: "FLOUR" as const,
      tagline: "Smooth plantain swallow from just one ingredient.",
      description:
        "Unripe plantain, dried and milled into a fine flour for a smooth, filling swallow. Nothing is added to it: no additives and no preservatives.",
      ingredients: "Unripe plantain. Nothing else.",
      usage:
        "Boil water in a pot and set a little of the boiled water aside.\nStir the flour into the boiling water, stirring well to break up lumps until you get the texture you want.\nAdd more water if needed, cover the pot and cook slowly for a few minutes, then stir again.\nServe with any soup of your choice.",
      highlights: ["100% organic", "No additives", "No preservative"],
      images: ["/products/plantain-flour-2kg.webp", "/products/plantain-flour-1kg.webp"],
      featured: true,
      sortOrder: 2,
      variants: [
        { label: "1kg", priceKobo: naira(3000), stock: 40, image: "/products/plantain-flour-1kg.webp", sortOrder: 0 },
        { label: "2kg", priceKobo: naira(5500), stock: 40, image: "/products/plantain-flour-2kg.webp", sortOrder: 1 },
      ],
    },
    {
      name: "Honey beans",
      slug: "honey-beans",
      category: "BEANS" as const,
      tagline: "Sweet oloyin beans, stone free and ready for the pot.",
      description:
        "Naturally sweet honey beans, cleaned and packed so there are no stones or dirt to pick out. Good for porridge, moi moi and akara.",
      ingredients: "Honey beans. Stone free and dirt free.",
      usage: "Rinse, soak if you like, and cook as usual.\nStore in a cool, dry place.",
      highlights: ["Stone free", "Dirt free", "Neatly packed", "100% organic"],
      images: ["/products/honey-beans.webp"],
      featured: true,
      sortOrder: 3,
      variants: [{ label: "2kg", priceKobo: naira(6000), stock: 40, image: null, sortOrder: 0 }],
    },
  ];

  for (const { variants, ...p } of products) {
    // Only inserts missing products; existing ones (and their dashboard edits) are left alone.
    await ProductModel.updateOne({ slug: p.slug }, { $setOnInsert: { ...p, variants } }, { upsert: true });
  }
  console.log(`Seeded ${products.length} products.`);
}

main().finally(() => mongoose.disconnect());
