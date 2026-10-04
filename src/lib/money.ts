const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export const formatNaira = (kobo: number) => ngn.format(kobo / 100);
export const nairaToKobo = (naira: number) => Math.round(naira * 100);
export const koboToNaira = (kobo: number) => kobo / 100;
