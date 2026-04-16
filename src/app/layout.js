import "../styles/globals.css";

export const metadata = {
  title: "test",
  description: "test",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="">
        {/* navbar */}
        {children}
      </body>
    </html>
  );
}