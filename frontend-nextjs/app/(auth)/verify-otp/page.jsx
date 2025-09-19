import GuestRoute from "@/features/auth/GuestRoute";
import VerifyOtpClient from "@/features/auth/VerifyOtpClient";

export const metadata = {
  title: "Verify OTP - Jawal Games",
  description: "Verify your OTP code",
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
    title: "Verify OTP",
    description: "User verification only",
    robots: "noindex, nofollow",
  },

  twitter: {
    title: "Verify OTP",
    description: "User verification only",
  },
  other: {
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  },
};

export default function VerifyOtpPage() {
  return (
    <GuestRoute>
      <VerifyOtpClient />
    </GuestRoute>
  );
}
