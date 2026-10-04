// Single source of truth for business details shown across the site.
export const site = {
  name: "ABIEST Foodmart Ventures",
  brand: "ABI&EST Crispy Confectioneries",
  phone: "0706 169 2921",
  phoneHref: "tel:+2347061692921",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "2347061692921",
  email: "abiestfood@gmail.com",
  nafdac: "A8-123091L",
  regNo: "7255675",
  locations: [
    {
      label: "Processing centre, Ile-Ife",
      lines: ["Unit 4, Technology Incubation Centre", "Ita-Osa, Ondo Road", "Ile-Ife, Osun State"],
    },
    {
      label: "Osogbo office",
      lines: ["No 2, Timehin Avenue, Block 5, Plot 25A", "Ayekale Area", "Osogbo, Osun State"],
    },
  ],
} as const;

export const whatsappLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/** WhatsApp link to a customer's Nigerian number (0803… → 234803…). */
export const whatsappTo = (phone: string, text: string) => {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "234");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};
