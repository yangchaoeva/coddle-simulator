import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "哄她模拟器 MVP",
  description: "不是教你骗她原谅，而是教你真正听懂她。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
