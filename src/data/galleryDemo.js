export const galleryDemoPhotos = [
  { id: 'demo-1', filename: 'Golden hour portrait', src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=88', width: 2, height: 3, set: 'Highlights' },
  { id: 'demo-2', filename: 'Quiet reception', src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=88', width: 3, height: 2, set: 'Highlights' },
  { id: 'demo-3', filename: 'Window light', src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1600&q=88', width: 2, height: 3, set: 'Portraits' },
  { id: 'demo-4', filename: 'Table details', src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1600&q=88', width: 3, height: 2, set: 'Details' },
  { id: 'demo-5', filename: 'The celebration', src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=88', width: 3, height: 2, set: 'Highlights' },
  { id: 'demo-6', filename: 'Soft bloom', src: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1600&q=88', width: 2, height: 3, set: 'Details' },
  { id: 'demo-7', filename: 'Evening walk', src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=88', width: 3, height: 2, set: 'Portraits' },
  { id: 'demo-8', filename: 'Last dance', src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=88', width: 2, height: 3, set: 'Highlights' },
]

export const galleryDemo = {
  id: 'demo', title: 'Avery & Milan', slug: 'demo', status: 'draft',
  eventDate: '2026-09-14', description: 'A day of quiet moments, warm light, and everything worth remembering.',
  coverMediaId: 'demo-2', coverFocusX: 50, coverFocusY: 50,
  hasPassword: false, downloadsEnabled: false, favoritesEnabled: true,
  media: galleryDemoPhotos.map((photo, order) => ({ ...photo, thumbUrl: photo.src, fullUrl: photo.src, order })),
}
