const VENMO_REGEX = /^@[\w.-]{1,50}$/;

export function isValidVenmoHandle(handle: string): boolean {
  return VENMO_REGEX.test(handle);
}

export function isValidPrice(price: number): boolean {
  return typeof price === "number" && isFinite(price) && price >= 0;
}

export function isValidFraction(fraction: number): boolean {
  return typeof fraction === "number" && isFinite(fraction) && fraction >= 0 && fraction <= 1;
}

export function isValidImageType(type: string): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(type);
}

export function isValidImageSize(bytes: number): boolean {
  return bytes > 0 && bytes <= 10 * 1024 * 1024; // 10MB max
}
