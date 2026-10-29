export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const RESERVED_SLUGS = ["login"];

export function generateUniqueSlug(
  name: string,
  existingSlugs: string[],
): string {
  const base = slugify(name);
  const taken = (slug: string) =>
    existingSlugs.includes(slug) || RESERVED_SLUGS.includes(slug);

  if (!taken(base)) return base;

  let n = 2;
  while (taken(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}
