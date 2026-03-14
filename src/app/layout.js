import "./globals.css";

export const metadata = {
  title: "Mission Control",
  description: "Autonomous Company Command Center",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-midnight text-slate-200">
        {children}
      </body>
    </html>
  );
}
