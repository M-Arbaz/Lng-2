export default function manifest() {
  return {
    name: 'Lamp & Glow',
    short_name: 'Lamp & Glow',
    description: 'Handcrafted lighting and decor.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#5A2D0C',
    icons: [{ src: '/logo.png', sizes: 'any', type: 'image/png' }],
  }
}
