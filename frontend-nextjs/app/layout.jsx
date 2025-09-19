import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "../styles/App.css";
import QueryProvider from "@/providers/QueryProvider";
import { apiEndPoints } from "@/routes";
import ClientLayout from "@/common/ClientLayout";

async function getNavLinks() {
  try {
    const response = await fetch(
      `${apiEndPoints.viewNav}?pageNo=1&pageSize=50`,
      {
        next: {
          revalidate: 2 * 86400, // Revalidate once per 2-day (48 hours)
          tags: ["navigation"],
        },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data?.status === 200 ? data.data.data : [];
  } catch (error) {
    console.error("Failed to fetch nav links:", error);
    return [];
  }
}

async function getFooterLinks() {
  try {
    const response = await fetch(
      `${apiEndPoints.viewFooter}?pageNo=1&pageSize=50`,
      {
        next: {
          revalidate: 10 * 86400, // Revalidate once per 10-day
          tags: ["footer"], // For manual revalidation
        },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data?.status === 200 ? data.data.data : [];
  } catch (error) {
    console.error("Failed to fetch footer links:", error);
    return [];
  }
}
export const metadata = {
  // Global metadata

  // Icons (applies to all pages)
  icons: {
    icon: [
      { url: "/web-icons/favicon.ico", sizes: "any" },
      { url: "/web-icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/web-icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: {
      url: "/web-icons/apple-touch-icon.png",
      sizes: "180x180",
    },
  },

  manifest: "/site.webmanifest",

  viewport: "width=device-width, initial-scale=1",

  // verification: {
  //   google: "your-google-verification-code", //TODO
  //   yandex: "your-yandex-verification-code", //TODO
  // },
};
export default async function RootLayout({ children }) {
  const [navLinks, footerLinks] = await Promise.all([
    getNavLinks(),
    getFooterLinks(),
  ]);

  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6178922300827357"
          crossorigin="anonymous"
        ></script>

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-HPVDD3B6EK"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HPVDD3B6EK');
            `,
          }}
        />
      </head>
      <body>
        <QueryProvider>
            <ClientLayout navLinks={navLinks} footerLinks={footerLinks}>
              {children}
            </ClientLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
