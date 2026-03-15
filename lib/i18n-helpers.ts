/**
 * Get the localized name for a category (or any entity with name + name_es).
 * Falls back to the default `name` if no translation exists for the locale.
 */
export function getLocalizedName(
  item: { name: string; name_es?: string | null },
  locale: string
): string {
  if (locale === 'es' && item.name_es) {
    return item.name_es
  }
  return item.name
}

/**
 * Get the localized description for a category (or any entity with description + description_es).
 * Falls back to the default `description` if no translation exists.
 */
export function getLocalizedDescription(
  item: { description?: string | null; description_es?: string | null },
  locale: string
): string | null {
  if (locale === 'es' && item.description_es) {
    return item.description_es
  }
  return item.description ?? null
}
