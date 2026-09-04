export const gallerySortOptions = [
  'Default',
  'Featured',
  'Popularity, more to less',
  'Date, new to old',
] as const
export type GallerySortOption = (typeof gallerySortOptions)[number]
