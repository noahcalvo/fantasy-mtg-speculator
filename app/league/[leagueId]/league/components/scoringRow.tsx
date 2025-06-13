import { ScoringOption } from '@/app/lib/definitions';
import { faClone } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function ScoringRow({
  option,
  index,
  selectedForDeletion,
  setSelectedForDeletion,
  onDelete,
}: {
  option: ScoringOption;
  index: number;
  selectedForDeletion: number | null;
  setSelectedForDeletion: (index: number | null) => void;
  onDelete: (option: ScoringOption) => void;
}) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div key={index}>
      <div
        className={`relative p-4 ${selectedForDeletion === index ? 'shadow-lg' : ''}`}
        onClick={(e) => {
          if (isMobile) {
            setSelectedForDeletion(index);
            e.stopPropagation();
          }
        }}
      >
        <div className="grid grid-cols-3 items-center gap-x-2 py-2 text-sm md:grid-cols-4">
          <div>{option.format}</div>
          <div>{option.tournament_type}</div>
          <div>
            {option.points}
            {option.is_per_copy && (
              <FontAwesomeIcon icon={faClone} className="w-8" />
            )}
          </div>
          <button
            className="hidden bg-red-900 px-2 py-1 text-gray-50 md:block"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(option);
            }}
          >
            Delete
          </button>
        </div>
        {selectedForDeletion === index && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 bg-opacity-70">
            <button
              className="bg-red-900 px-4 py-2 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(option);
                setSelectedForDeletion(null);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {index !== -1 && (
        <div className="w-full border-t border-solid border-gray-100" />
      )}
    </div>
  );
}
