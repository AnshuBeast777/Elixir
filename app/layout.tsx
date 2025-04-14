import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/app/context/CartContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Elixir",
  description: "Your favorite place for hair styling and grooming.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head />
      <body className="font-sans antialiased">
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <Toaster position="top-right" />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </CartProvider>

        {/* Voiceflow Chatbot Script */}
        <Script id="voiceflow-chatbot" strategy="afterInteractive">
          {`
            (function(d, t) {
              var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
              v.onload = function() {
                window.voiceflow.chat.load({
                  verify: { projectID: '67a3c8a9ad8e912715778d3b' },
                  url: 'https://general-runtime.voiceflow.com',
                  versionID: 'production'
                });
              };
              v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
              v.type = "text/javascript";
              s.parentNode.insertBefore(v, s);
            })(document, 'script');
          `}
        </Script>
      </body>
    </html>
  );
}
