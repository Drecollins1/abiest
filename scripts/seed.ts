import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, ProductModel } from "../src/lib/db";

// NOTE: prices are placeholders. Set real prices in the dashboard.
const naira = (n: number) => n * 100;

// Each chips type comes as a jar (600g and 650g share one photo) and a 180g pouch.
const chips = (kind: "Ripe" | "Unripe", sortOrder: number, tagline: string, intro: string) => {
  const k = kind.toLowerCase();
  const common = {
    category: "CHIPS" as const,
    ingredients: `${kind} plantain, onions, table salt, chilli pepper, vegetable oil.`,
    featured: true,
  };
  return [
    {
      ...common,
      name: `${kind} plantain chips jar`,
      slug: `${k}-plantain-chips-jar`,
      tagline: `${tagline} in a tamper-proof jar.`,
      description: `${intro} Packed in a tamper-proof jar that keeps the chips crisp and is easy to share.`,
      usage: "Eat as snacks.\nStore in a cool, dry place and close the lid after opening.",
      highlights: ["100% natural", "No additives", "Tamper-proof jar"],
      images: [`/products/chips-${k}-jar.webp`],
      sortOrder,
      variants: [
        { label: "600g", priceKobo: naira(5000), stock: 0, image: null, sortOrder: 0 },
        { label: "650g", priceKobo: naira(5500), stock: 0, image: null, sortOrder: 1 },
      ],
    },
    {
      ...common,
      name: `${kind} plantain chips pouch`,
      slug: `${k}-plantain-chips-pouch`,
      tagline: `${tagline} in a resealable gold pouch.`,
      description: `${intro} Comes in a resealable pouch so the last handful is as crisp as the first.`,
      usage: "Eat as snacks, straight from the pouch.\nStore in a cool, dry place and reseal after opening.",
      highlights: ["100% natural", "No additives", "Resealable pouch"],
      images: [`/products/chips-${k}-pouch.webp`],
      sortOrder: sortOrder + 1,
      variants: [{ label: "180g", priceKobo: naira(1500), stock: 60, image: null, sortOrder: 0 }],
    },
  ];
};

async function main() {
  await connectDB();
  await ProductModel.syncIndexes(); // creates the unique indexes (slug, order reference)
  const products = [
    ...chips("Ripe", 1, "Sweet, spiced dodo chips", "Ripe plantain (dodo), thin-sliced, spiced and fried until it snaps."),
    ...chips("Unripe", 3, "Firm, savoury unripe plantain chips", "Unripe plantain, thin-sliced, lightly spiced and fried for a firm, savoury crunch."),
    {
      name: "Unripe plantain flour",
      slug: "unripe-plantain-flour",
      active: false, // hidden until it has a photo
      category: "FLOUR" as const,
      tagline: "Smooth plantain swallow from just one ingredient.",
      description:
        "Unripe plantain, dried and milled into a fine flour for a smooth, filling swallow. Nothing is added to it: no additives and no preservatives.",
      ingredients: "Unripe plantain. Nothing else.",
      usage:
        "Boil water in a pot and set a little of the boiled water aside.\nStir the flour into the boiling water, stirring well to break up lumps until you get the texture you want.\nAdd more water if needed, cover the pot and cook slowly for a few minutes, then stir again.\nServe with any soup of your choice.",
      highlights: ["100% organic", "No additives", "No preservative"],
      images: [], // no photo yet
      featured: true,
      sortOrder: 5,
      variants: [
        { label: "1kg", priceKobo: naira(3000), stock: 40, image: null, sortOrder: 0 },
        { label: "2kg", priceKobo: naira(5500), stock: 40, image: null, sortOrder: 1 },
      ],
    },
    {
      name: "Honey beans",
      slug: "honey-beans",
      active: false, // hidden until it has a photo
      category: "BEANS" as const,
      tagline: "Sweet oloyin beans, stone free and ready for the pot.",
      description:
        "Naturally sweet honey beans, cleaned and packed so there are no stones or dirt to pick out. Good for porridge, moi moi and akara.",
      ingredients: "Honey beans. Stone free and dirt free.",
      usage: "Rinse, soak if you like, and cook as usual.\nStore in a cool, dry place.",
      highlights: ["Stone free", "Dirt free", "Neatly packed", "100% organic"],
      images: [], // no photo yet
      featured: true,
      sortOrder: 6,
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
