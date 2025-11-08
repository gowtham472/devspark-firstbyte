import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ByteHub - Share Knowledge, Learn Together",
  description:
    "A GitHub-inspired platform for students to share study materials, tutorials, and educational resources. Built for learning communities.",
  keywords: [
    "education",
    "learning",
    "study materials",
    "students",
    "knowledge sharing",
  ],
  authors: [{ name: "ByteHub Team" }],
  openGraph: {
    title: "ByteHub - Share Knowledge, Learn Together",
    description: "Empowering students to share knowledge — one Byte at a time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
