interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'cyan' | 'pink' | 'orange';
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    purple: 'from-purple-50 to-purple-100 border-purple-200 bg-purple-500',
    blue: 'from-blue-50 to-blue-100 border-blue-200 bg-blue-500',
    cyan: 'from-cyan-50 to-cyan-100 border-cyan-200 bg-cyan-500',
    pink: 'from-pink-50 to-pink-100 border-pink-200 bg-pink-500',
    orange: 'from-orange-50 to-orange-100 border-orange-200 bg-orange-500',
  };

  const [gradientClass, borderClass, bgClass] = colorClasses[color].split(' ');

  return (
    <div className={`bg-gradient-to-br ${gradientClass} p-6 rounded-xl shadow-md border ${borderClass}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgClass} text-white`}>
          {icon}
        </div>
        <div className="ms-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
