import AdminLoginClient from "@/features/auth/AdminLoginClient";

export const metadata = {
  title: "Login - Jawal Games",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    "max-video-preview": 0,
    "max-image-preview": "none",
    "max-snippet": 0,
  },

  openGraph: {
    title: "Login",
    robots: "noindex, nofollow",
  },

  twitter: {
    title: "Login",
  },
  other: {
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  },
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
