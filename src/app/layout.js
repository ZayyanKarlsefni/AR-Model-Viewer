import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata = {
  title: "CADimago — 3D & AR Viewer",
  description: "Professional 3D & Augmented Reality Web Viewer for CAD models",
  metadataBase: new URL("https://cadimago.vercel.app"),
  openGraph: {
    title: "CADimago — 3D & AR Viewer",
    description: "Interactive 3D & Augmented Reality visualization for CAD models.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#fbfbfd",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
