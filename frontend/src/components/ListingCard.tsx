import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Listing } from '../types/interfaces';

interface ListingCardProps {
  listing: Listing;
  onNotesUpdate?: (id: string, notes: string) => void;
  activeId?: string | null;
}

export default function ListingCard({ listing, onNotesUpdate, activeId }: ListingCardProps) {
  const [notes, setNotes] = useState(listing.notes || '');
  const [showNotes, setShowNotes] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: listing._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'yad2':
        return 'bg-orange-500 text-white';
      case 'ihomes':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotes(!showNotes);
  };

  const handleSaveNotes = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNotesUpdate) {
      onNotesUpdate(listing._id!, notes);
    }
    setShowNotes(false);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setShowTooltip(true);
    }, 800); // דחיה של 800ms
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowTooltip(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ 
        ...style, 
        position: 'relative',
        zIndex: isDragging ? 5000 : 'auto',
        isolation: 'isolate'
      }}
      {...attributes}
      {...listeners}
      className={`
        w-full cursor-grab select-none mb-4 relative
        ${isDragging ? 'opacity-60 scale-95' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip עם הערות באמצע הכרטיס */}
      {showTooltip && notes && !showNotes && (
        <div 
          className="absolute inset-0 flex items-center justify-center p-6 z-20"
          style={{ zIndex: 10000 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl p-4 max-w-full max-h-full overflow-auto shadow-2xl border animate-in zoom-in-95 fade-in duration-300">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800 text-sm">הערות</h4>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-500 hover:text-gray-700 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              {notes}
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href={listing.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                🔗 פתח מודעה
              </a>
              <button
                onClick={handleNotesClick}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                ✏️ ערוך
              </button>
            </div>
          </div>
        </div>
      )}

      {/* הכרטיס עצמו */}
      {showNotes ? (
        // מצב הערות
        <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 h-72 flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-bold text-slate-800">הערות אישיות</h4>
            <button
              onClick={handleNotesClick}
              className="text-slate-500 hover:text-slate-700 text-xl hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ←
            </button>
          </div>
          
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="כתוב כאן הערות על הדירה הזו..."
            className="flex-1 w-full p-4 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleSaveNotes}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            >
              💾 שמור
            </button>
            <button
              onClick={handleNotesClick}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors hover:border-slate-400"
            >
              ביטול
            </button>
          </div>
        </div>
      ) : (
        // מצב רגיל
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-72 flex flex-col group relative ${showTooltip ? 'overflow-hidden' : ''}`}>
          
          {/* מסכת Overlay כשיש tooltip */}
          {showTooltip && (
            <div className="absolute inset-0 bg-zinc-950 opacity-95 rounded-2xl z-10" />
          )}

          {/* תוכן הכרטיס */}
          <div className={`p-5 flex-1 flex flex-col relative transition-opacity duration-300 ${showTooltip ? 'opacity-20' : 'opacity-100'}`}>
            {/* Header */}
            <div className="flex justify-between items-center text-xs mb-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getSourceBadgeColor(listing.source)}`}>
                {listing.source.toUpperCase()}
              </span>
              <span className="text-gray-500 font-mono">{formatDate(listing.datePosted)}</span>
            </div>

            {/* כותרת */}
            <h3 className="font-bold text-gray-900 text-base mb-4 line-clamp-2 flex-grow leading-tight">
              {listing.title}
            </h3>

            {/* מחיר וחדרים */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-emerald-600 font-bold text-xl">
                {formatPrice(listing.price)}
              </span>
              <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                {listing.rooms} חדרים
              </span>
            </div>

            {/* כתובת */}
            {listing.address && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-1 flex items-center gap-1.5">
                <span>📍</span> {listing.address}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className={`px-5 pb-4 flex items-center justify-between border-t border-gray-100 pt-3 relative transition-opacity duration-300 ${showTooltip ? 'opacity-20' : 'opacity-100'}`}>
            <a
              href={listing.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold underline underline-offset-2 transition-colors group-hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              צפייה במודעה →
            </a>
            <div className="flex items-center gap-3">
              {listing.images && listing.images.length > 0 && (
                <span className="text-sm text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                  📷 {listing.images.length}
                </span>
              )}
              <button
                onClick={handleNotesClick}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:bg-blue-50 px-2 py-1 rounded-lg"
              >
                📝 הערות
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}