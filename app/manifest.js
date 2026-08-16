export default function manifest() {
  return {
    name: 'Happiness Jar - กระปุกพลังบวก',
    short_name: 'Happiness Jar',
    description: 'พื้นที่แบ่งปันรอยยิ้มและคำฮีลใจที่ไม่ระบุตัวตน',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF9',
    theme_color: '#F97316',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any maskable'
      }
    ]
  };
}
