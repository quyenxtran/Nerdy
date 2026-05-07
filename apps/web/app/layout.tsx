import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaperGraph AI",
  description: "A social research knowledge graph for papers, questions, and thesis validation."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
