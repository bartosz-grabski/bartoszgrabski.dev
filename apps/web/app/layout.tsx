import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bartosz Grabski",
  description: "Personal portfolio — Bartosz Grabski",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
