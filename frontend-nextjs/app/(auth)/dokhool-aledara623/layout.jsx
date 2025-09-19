import { AuthProvider } from "@/providers/AuthProvider";

export default function Layout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
