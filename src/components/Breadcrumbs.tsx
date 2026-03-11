import { Area } from '../types';

interface BreadcrumbsProps {
  areas: Area[];
  onNavigate: (areaId: string | null) => void;
}

export const Breadcrumbs = ({ areas, onNavigate }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </button>

      {areas.map((area, index) => (
        <span key={area.id} className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {index === areas.length - 1 ? (
            <span className="text-white font-medium flex items-center gap-1">
              {area.icon && <span>{area.icon}</span>}
              {area.name}
            </span>
          ) : (
            <button
              onClick={() => onNavigate(area.id)}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {area.icon && <span>{area.icon}</span>}
              {area.name}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
};
