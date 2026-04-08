export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" lang="en" className="font-sans">
      {children}
    </div>
  );
}
