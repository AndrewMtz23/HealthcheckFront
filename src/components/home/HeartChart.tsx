import { FiActivity, FiHeart } from 'react-icons/fi';

export default function HeartChart() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FiHeart aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-gray-900">El pulso de la información</p>
        </div>
        <FiActivity aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-300" />
      </div>
      <div
        className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/40"
        style={{
          backgroundImage: 'linear-gradient(to right, #dbeafe 1px, transparent 1px), linear-gradient(to bottom, #dbeafe 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <svg viewBox="0 0 600 180" className="h-28 w-full sm:h-36" role="img" aria-label="Ilustración de una onda de ritmo cardíaco">
          <path
            d="M0 96 H50 Q60 96 67 85 Q76 71 85 96 H115 L132 110 L151 28 L174 151 L194 84 L208 96 H262 Q277 96 285 81 Q297 63 308 96 H352 L369 110 L389 28 L412 151 L432 84 L446 96 H502 Q518 96 529 83 Q542 70 555 96 H600"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="text-blue-600"
          />
        </svg>
      </div>
    </div>
  );
}
