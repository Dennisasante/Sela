import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sela Admin",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sela Admin",
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
