import type { Metadata } from "next";
import "./globals.css";

import AuthLayout from "@/components/AuthLayout";

export const metadata: Metadata = {
  title: "Stock Exchange Engine",
  description: "Realtime stock trading simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full overflow-x-hidden bg-[#F7FAF7] text-gray-900 antialiased">
        <AuthLayout>
          <main className="w-full min-w-0">{children}</main>
        </AuthLayout>
      </body>
    </html>
  );
}