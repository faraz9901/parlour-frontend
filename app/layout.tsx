import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Parlour",
  description: "Parlour Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4">
        <div className="max-w-[1200px] mx-auto">
          {children}
          <Toaster position="top-center" richColors />
        </div>
      </body>
    </html>
  );
}
