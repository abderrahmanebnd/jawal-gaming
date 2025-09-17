import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "../styles/App.css";
import QueryProvider from "@/providers/QueryProvider";
import { apiEndPoints } from "@/routes";
import ClientLayout from "@/common/ClientLayout";

async function getNavLinks() {
  try {
    const response = await fetch(
      `${
        apiEndPoints.viewNav
      }?pageNo=1&pageSize=50`,
      {
        next: {
          revalidate: 0, // Revalidate once per day (24 hours)
          tags: ["navigation"], // For manual revalidation
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
      `${
        apiEndPoints.viewFooter
      }?pageNo=1&pageSize=50`,
      {
        next: {
          revalidate: 0, // Revalidate once per day
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
export default async function RootLayout({ children }) {
  const [navLinks, footerLinks] = await Promise.all([
    getNavLinks(),
    getFooterLinks(),
  ]);

  return (
    <html lang="en">
      <body
      >
        <QueryProvider>
          <ClientLayout navLinks={navLinks} footerLinks={footerLinks}>
            {children}
          </ClientLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
