export default function ClusterLayout({
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
