export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(
  name: string,
  existingSlugs: string[],
): string {
  const base = slugify(name);
  if (!existingSlugs.includes(base)) return base;

  let n = 2;
  while (existingSlugs.includes(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}
