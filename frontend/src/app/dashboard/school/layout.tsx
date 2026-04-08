export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="sd" className="font-sindhi">
      {children}
    </div>
  );
}
