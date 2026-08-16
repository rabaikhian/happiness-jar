export default function manifest() {
  return {
    name: 'Panpan Jar - กระปุกปันปัน',
    short_name: 'Panpan Jar',
    description: 'พื้นที่แบ่งปันรอยยิ้มและคำฮีลใจที่ไม่ระบุตัวตน',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF9',
    theme_color: '#F97316',
    icons: [
      {
        src: '/app_icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
}
