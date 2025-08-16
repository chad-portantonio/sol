import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova - Professional Tutoring Management",
  description: "Streamline your tutoring business with student management, session tracking, and parent communication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="nova-ui-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
