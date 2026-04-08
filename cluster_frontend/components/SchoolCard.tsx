import type { SchoolSummary } from '@/lib/types';

interface SchoolCardProps {
  school: SchoolSummary;
  onClick: () => void;
}

export default function SchoolCard({ school, onClick }: SchoolCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <h3 className="font-bold text-lg text-gray-900 mb-2">{school.school_name}</h3>
      <div className="space-y-1 text-sm text-gray-700">
        <p><span className="font-medium">SEMIS:</span> {school.semis_code}</p>
        <p><span className="font-medium">Location:</span> {school.taluka}, {school.district}</p>
        <div className="flex gap-4 mt-3 pt-3 border-t border-orange-200">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-600">Boys</p>
            <p className="text-lg font-bold text-cyan-600">{school.boys}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-600">Girls</p>
            <p className="text-lg font-bold text-pink-600">{school.girls}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-bold text-orange-600">{school.total_students}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
