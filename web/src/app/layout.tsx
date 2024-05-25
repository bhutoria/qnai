import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import RecoilProvider from "@/context/RecoilProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Q&ai",
  description: "An AI powered Q&A service for meetings, classes and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} overflow-hidden`}>
        <RecoilProvider>
          <AuthProvider>{children}</AuthProvider>
        </RecoilProvider>
        <Toaster></Toaster>
      </body>
    </html>
  );
}
