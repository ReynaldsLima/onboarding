export const ALLOWED_ADMIN_EMAIL = "riguettilima.tech@gmail.com";

export function isAllowedAdmin(email: string | undefined | null): boolean {
  return email === ALLOWED_ADMIN_EMAIL;
}
