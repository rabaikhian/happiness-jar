import "./globals.css";

export const metadata = {
  title: "กระปุกพลังบวก (Happiness Jar) - ปลอบโยนและแบ่งปันพลังใจ",
  description: "ทิ้งความเหนื่อยล้า แล้วมาร่วมแบ่งปันความรู้สึกดีๆ ขอบคุณเรื่องราวรอบตัว หรือให้กำลังใจคนแปลกหน้าผ่านกระปุกพลังบวกดิจิทัล ปลอดภัย ไร้คอมเมนต์ท็อกซิก",
  keywords: ["กระปุกพลังบวก", "ส่งกำลังใจ", "สมุดขอบคุณ", "สุขภาพจิต", "ความสุขรายวัน", "Happiness Jar", "Gratitude Wall"]
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🍯%3C/text%3E%3C/svg%3E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#F97316" />
      </head>
      <body className="min-h-full flex flex-col cozy-grain">
        {children}
      </body>
    </html>
  );
}
