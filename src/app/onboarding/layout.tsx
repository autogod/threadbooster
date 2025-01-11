export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // setting layout
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
