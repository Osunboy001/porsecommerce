/**
 * Sample catalog for the shop page.
 * As you list your real products one by one, replace these objects
 * (or later point the page at the Node API instead of this file).
 */
export const products = [
  {
    id: 'p1',
    slug: 'aurora-table-lamp',
    name: 'Aurora Table Lamp',
    category: 'Lighting',
    description: 'Soft ambient light, hand-finished ceramic base.',
    price: 89,
    image: '/products/aurora-lamp.svg',
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 128,
    details: [
      'Hand-finished ceramic base with a natural linen shade.',
      'Warm, dimmable LED light — easy on the eyes in the evening.',
      'Inline dimmer switch and a 2 m braided fabric cable.',
      'Designed to sit happily on a bedside table or desk.',
    ],
    specs: [
      { label: 'Material', value: 'Ceramic, linen' },
      { label: 'Bulb', value: 'E27 LED, dimmable' },
      { label: 'Dimensions', value: '28 × 28 × 46 cm' },
      { label: 'Cable', value: '2 m braided fabric' },
    ],
  },
  {
    id: 'p2',
    slug: 'terra-ceramic-vase',
    name: 'Terra Ceramic Vase',
    category: 'Home Decoration',
    description: 'Wheel-thrown stoneware with a matte clay glaze.',
    price: 48,
    image: '/products/terra-vase.svg',
    badge: 'New',
    rating: 4.8,
    reviewCount: 64,
    details: [
      'Wheel-thrown by hand from durable stoneware.',
      'Matte clay glaze with subtle natural variation.',
      'Watertight interior — equally good with fresh or dried stems.',
      'Felt pads included to protect your surfaces.',
    ],
    specs: [
      { label: 'Material', value: 'Stoneware' },
      { label: 'Finish', value: 'Matte clay glaze' },
      { label: 'Dimensions', value: '18 × 18 × 26 cm' },
      { label: 'Care', value: 'Wipe clean with a damp cloth' },
    ],
  },
  {
    id: 'p3',
    slug: 'driftwood-wall-clock',
    name: 'Driftwood Wall Clock',
    category: 'Home Decoration',
    description: 'Silent-sweep movement in reclaimed driftwood.',
    price: 120,
    image: '/products/driftwood-clock.svg',
    rating: 4.7,
    reviewCount: 41,
    details: [
      'Made from reclaimed driftwood — no two are alike.',
      'Silent-sweep movement, so there is no ticking.',
      'Easy to hang with the included wall bracket.',
      'A quiet natural focal point for living rooms and hallways.',
    ],
    specs: [
      { label: 'Material', value: 'Reclaimed driftwood' },
      { label: 'Movement', value: 'Silent sweep quartz' },
      { label: 'Diameter', value: '40 cm' },
      { label: 'Power', value: '1 × AA battery (included)' },
    ],
  },
  {
    id: 'p4',
    slug: 'linen-throw-blanket',
    name: 'Linen Throw Blanket',
    category: 'Home Decoration',
    description: 'Stonewashed European linen, softer with every wash.',
    price: 64,
    image: '/products/linen-throw.svg',
    badge: 'New',
    rating: 4.9,
    reviewCount: 203,
    details: [
      'Woven from 100% European flax linen.',
      'Stonewashed for a soft, lived-in feel from day one.',
      'Generously sized for the couch or the end of a bed.',
      'Machine washable — it only gets better with time.',
    ],
    specs: [
      { label: 'Material', value: '100% European linen' },
      { label: 'Dimensions', value: '130 × 180 cm' },
      { label: 'Weight', value: '620 g' },
      { label: 'Care', value: 'Machine wash cold, tumble dry low' },
    ],
  },
  {
    id: 'p5',
    slug: 'basalt-coffee-set',
    name: 'Basalt Coffee Set',
    category: 'Cookware',
    description: 'Matte stoneware pour-over set for two.',
    price: 76,
    image: '/products/basalt-coffee.svg',
    rating: 4.8,
    reviewCount: 87,
    details: [
      'Everything you need for a slow morning pour-over.',
      'Matte black stoneware that resists stains and odours.',
      'Carafe, dripper, and two cups in one set.',
      'Dishwasher safe for easy clean-up.',
    ],
    specs: [
      { label: 'Material', value: 'Stoneware' },
      { label: 'Includes', value: 'Dripper, carafe, 2 cups' },
      { label: 'Capacity', value: '600 ml carafe' },
      { label: 'Care', value: 'Dishwasher safe' },
    ],
  },
  {
    id: 'p6',
    slug: 'solstice-scented-candle',
    name: 'Solstice Scented Candle',
    category: 'Perfumes',
    description: 'Cedar, fig, and smoke in a reusable ceramic vessel.',
    price: 32,
    image: '/products/solstice-candle.svg',
    badge: 'Limited',
    rating: 4.6,
    reviewCount: 156,
    details: [
      'Notes of cedar, fig, and a whisper of smoke.',
      'Hand-poured soy wax with a cotton wick.',
      'Housed in a ceramic vessel made to be kept.',
      'Approximately 45 hours of burn time.',
    ],
    specs: [
      { label: 'Wax', value: 'Soy blend' },
      { label: 'Scent', value: 'Cedar, fig, smoke' },
      { label: 'Burn time', value: '45 hours' },
      { label: 'Weight', value: '220 g' },
    ],
  },
]

export function findProduct(slug) {
  return products.find((product) => product.slug === slug)
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}
