import ClientHomePage from "@/features/home/ClientHomePage";

// Server-side metadata
export const metadata = {
  title: "Jawal Games - Play Now!",
  description:
    "Jawal Games, your go-to platform for free online games. Enjoy top puzzle, brain, and casual hits from the App Store right in your browser. Play now!",
  canonical: "https://jawalgames.net",

  // Open Graph
  openGraph: {
    title: "Jawal Games - Play Now!",
    description:
      "Jawal Games, your go-to platform for free online games. Enjoy top puzzle, brain, and casual hits from the App Store right in your browser. Play now!",
    url: "https://jawalgames.net",
    siteName: "Jawal Games",
    images: [
      {
        url: "https://jawalgames.net/web-icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Jawal Games Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Jawal Games - Play Now!",
    description:
      "Jawal Games, your go-to platform for free online games. Enjoy top puzzle, brain, and casual hits from the App Store right in your browser. Play now!",
    images: ["https://jawalgames.net/web-icons/icon-512.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function HomePage() {
  return <ClientHomePage />;
}
