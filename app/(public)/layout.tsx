import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="pt-32">
      {children}
      <Footer />
    </main>
  );
}
