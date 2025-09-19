import AdminDashboardClient from "@/auth/AdminDashboardClient";
import ProtectedRoute from "@/features/auth/ProtectedRoute";

export const metadata = {
  title: "Admin Dashboard - Jawal Games",
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
    title: "Admin Dashboard",
    robots: "noindex, nofollow",
  },

  twitter: {
    title: "Admin Dashboard",
  },
  other: {
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  },
};

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardClient />
    </ProtectedRoute>
  );
}
