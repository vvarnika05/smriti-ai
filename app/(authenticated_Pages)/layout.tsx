import AuthGate from "@/components/AuthGate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <main className="pt-24">{children}</main>
    </AuthGate>
  );
}
