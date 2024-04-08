const { ceil, floor, random } = Math;

const NUMERICS = "0123456789";
const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SMALL_ALPHABETS = "abcdefghijklmnopqrstuvwxyz";
export const CHARSETS = {
  NUMERICS,
  ALPHABETS,
  SMALL_ALPHABETS
}

export function randomInteger(min, max) {
  min = ceil(min); max = floor(max);
  return floor(random() * (max - min + 1)) + min;
}

export function randomString(length, charset = NUMERICS + ALPHABETS + SMALL_ALPHABETS) {
  return Array.from({ length }, () => charset.charAt(randomInteger(0, charset.length-1))).join('');
}
