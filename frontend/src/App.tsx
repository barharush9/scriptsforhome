import { useState, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Listing } from './types/interfaces';
import ListingCard from './components/ListingCard';
import KanbanColumn from './components/KanbanColumn';
import Header from './components/Header';
import { fetchListings, updateListingStatus, triggerScrape } from './services/api';
import './App.css';


// סטטוסים עיקריים
const STATUSES = [
  { key: 'new', title: 'חדשות', color: 'bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-blue-200' },
  { key: 'called', title: 'יצרתי קשר', color: 'bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-200' },
  { key: 'visited', title: 'ביקרתי', color: 'bg-gradient-to-b from-emerald-50 to-emerald-100 border-2 border-emerald-200' },
  { key: 'saved', title: 'שמורות', color: 'bg-gradient-to-b from-purple-50 to-purple-100 border-2 border-purple-200' },
] as const;
const REJECTED_STATUS = [{ key: 'rejected', title: 'לא רלוונטי', color: 'bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300' }] as const;
type Status = typeof STATUSES[number]['key'];

function App() {
  const [listings, setListings] = useState<Listing[]>([]);

  // דראג-אנד-דרופ
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  // סינון
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [search, setSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

// פונקציה לעדכון הערות
const handleNotesUpdate = async (id: string, notes: string) => {
  try {
    console.log('עדכון הערות:', { id, notes });
    
    // עדכון מקומי מיד
    setListings(prev => prev.map(l => 
      l._id === id ? { ...l, notes } : l
    ));

    // שליחה לשרת (תוסיף את הקריאה הזו לapi.ts)
    const response = await fetch(`/api/listings/${id}/notes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update notes');
    }

    const result = await response.json();
    console.log('הערות נשמרו בהצלחה:', result);
    
  } catch (err) {
    console.error('שגיאה בשמירת הערות:', err);
    setError('Failed to save notes');
    
    // החזרת השינוי אם השמירה נכשלה
    loadListings();
  }
};

// פונקציה לדיבוג - הצגת כל הנתונים
const debugListings = () => {
  console.log('=== דיבוג דירות ===');
  console.log('סה"כ דירות:', listings.length);
  
  listings.forEach((listing, index) => {
    console.log(`דירה ${index + 1}:`, {
      id: listing._id,
      title: listing.title,
      status: listing.status,
      notes: listing.notes,
      price: listing.price,
      rooms: listing.rooms,
      address: listing.address,
      datePosted: listing.datePosted,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt
    });
  });

  // סטטיסטיקות
  const stats = {
    total: listings.length,
    withNotes: listings.filter(l => l.notes && l.notes.trim() !== '').length,
    byStatus: listings.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  console.log('סטטיסטיקות:', stats);
};

// הוסף כפתור דיבוג לHeader או לכל מקום אחר:
const DebugButton = () => (
  <button
    onClick={debugListings}
    className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
    title="הצג נתונים בקונסול"
  >
    🔍 Debug
  </button>
);


  // טען דירות מהשרת
  const loadListings = async () => {
    try {
      setError(null);
      const response = await fetchListings();
      setListings(response.data);
    } catch (err) {
      setError('Failed to load listings');
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListings(); }, []);


  // דראג-אנד-דרופ: עדכון סטטוס דירה
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }
    const activeId = active.id as string;
    const overId = over.id as string;
    // בדוק לאיזו עמודה נגרר
    const allStatuses = [...STATUSES, ...REJECTED_STATUS];
    const newStatus = allStatuses.find(s => s.key === overId)?.key;
    if (!newStatus) { setActiveId(null); return; }
    const listing = listings.find(l => l._id === activeId);
    if (!listing || listing.status === newStatus) { setActiveId(null); return; }
    try {
      setListings(prev => prev.map(l =>
        l._id === activeId ? { ...l, status: newStatus as Listing['status'] } : l
      ));
      await updateListingStatus(activeId, newStatus as Listing['status']);
    } catch (err) {
      setError('Failed to update listing status');
      console.error('Error updating status:', err);
    }
    setActiveId(null);
  };


  // סריקה מחדש
  const handleScrape = async () => {
    try {
      setScraping(true);
      await triggerScrape();
      setTimeout(() => { loadListings(); }, 2000);
    } catch (err) {
      setError('Failed to trigger scraping');
      console.error('Error triggering scrape:', err);
    } finally {
      setScraping(false);
    }
  };

  // סינון ומיון דירות לפי סטטוס וסינון
  const getListingsByStatus = (status: Status | string): Listing[] => {
    let arr = listings.filter(listing => listing.status === status);
    // סינון מחיר
    arr = arr.filter(l => {
      const min = minPrice ? parseInt(minPrice) : -Infinity;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      return l.price >= min && l.price <= max;
    });
    // סינון חדרים
    arr = rooms ? arr.filter(l => l.rooms === parseFloat(rooms)) : arr;
    // חיפוש חופשי
    arr = search ? arr.filter(l =>
      l.title.includes(search) ||
      (l.address && l.address.includes(search)) ||
      (l.description && l.description.includes(search))
    ) : arr;
    // מיון תאריך
    arr = arr.slice().sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
        case 'date-asc': return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
        default: return 0;
      }
    });
    return arr;
  };

  const activeListing = activeId ? listings.find(l => l._id === activeId) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ overflow: 'visible' }}>
      <Header 
        onScrape={handleScrape} 
        scraping={scraping}
        listingsCount={listings.length}
        onRefresh={loadListings}
      />

      {/* הודעת שגיאה */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* סרגל סינון */}
      <div className="w-full bg-[#2C2C3E] shadow-md flex flex-wrap items-center justify-between px-4 py-3 rounded-xl mb-4 gap-2" style={{ minHeight: 60 }}>
        <div className="flex items-center gap-1">
          <label className="text-[#E0E0E0] text-xs font-semibold">תאריך פרסום:</label>
          <select
            className="bg-transparent border-b-2 border-[#3C3C50] focus:border-[#00BFA6] text-[#E0E0E0] px-2 py-1 text-xs outline-none transition"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="date-desc">הכי חדש</option>
            <option value="date-asc">הכי ישן</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[#E0E0E0] text-xs font-semibold">מחיר:</label>
          <input
            type="number"
            className="bg-transparent border-b-2 border-[#3C3C50] focus:border-[#00BFA6] text-[#E0E0E0] w-16 px-1 text-xs outline-none transition placeholder-[#B0B0C0]"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="מינ'"
            min={0}
          />
          <span className="text-[#E0E0E0] text-xs">-</span>
          <input
            type="number"
            className="bg-transparent border-b-2 border-[#3C3C50] focus:border-[#00BFA6] text-[#E0E0E0] w-16 px-1 text-xs outline-none transition placeholder-[#B0B0C0]"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="מקס'"
            min={0}
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[#E0E0E0] text-xs font-semibold">חדרים:</label>
          <select
            className="bg-transparent border-b-2 border-[#3C3C50] focus:border-[#00BFA6] text-[#E0E0E0] px-2 py-1 text-xs outline-none transition"
            value={rooms}
            onChange={e => setRooms(e.target.value)}
          >
            <option value="">הכל</option>
            <option value="2">2</option>
            <option value="2.5">2.5</option>
            <option value="3">3</option>
            <option value="3.5">3.5</option>
            <option value="4">4</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            className="bg-transparent border-b-2 border-[#3C3C50] focus:border-[#00BFA6] text-[#E0E0E0] px-2 py-1 text-xs outline-none transition placeholder-[#B0B0C0] w-32"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש לפי מילה, אזור..."
          />
        </div>
      </div>

      <main className="container mx-auto px-1 py-6 bg-zinc-950" style={{ overflow: 'visible' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="w-full flex flex-row gap-4 items-start" style={{ overflow: 'visible' }}>
            {STATUSES.map((status) => {
              const statusListings = getListingsByStatus(status.key);
              return (
                <div className="flex-1 min-w-[220px] max-w-[350px] flex flex-col" key={status.key} style={{ overflow: 'visible' }}>
                  <div className="sticky top-0 z-[100] bg-zinc-950 pb-2 pt-1">
                    <div className="text-lg font-bold text-gray-100 mb-1 text-center tracking-tight">{status.title}</div>
                  </div>
                  <KanbanColumn
                    key={status.key}
                    id={status.key}
                    title={status.title}
                    color={status.color}
                    count={statusListings.length}
                    minHeightClass="min-h-[350px] md:min-h-[500px]"
                  >
                    <SortableContext
                      items={statusListings.map(l => l._id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4" style={{ overflow: 'visible' }}>
                        {statusListings.map((listing, index) => (
                          <div 
                            key={listing._id || `${status.key}-noid-${Math.random()}`}
                            className="listing-card-wrapper"
                            style={{ 
                              position: 'relative',
                              zIndex: Math.max(1, statusListings.length - index),
                              isolation: 'isolate',
                              overflow: 'visible'
                            }}
                          >
                            <ListingCard
                              listing={listing}
                              activeId={activeId}
                              onNotesUpdate={handleNotesUpdate}
                            />
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </KanbanColumn>
                </div>
              );
            })}
            
            {/* עמודת לא רלוונטי */}
            {REJECTED_STATUS.map((status) => {
              const statusListings = getListingsByStatus(status.key);
              return (
                <div className="flex-1 min-w-[220px] max-w-[350px] flex flex-col" key={status.key} style={{ overflow: 'visible' }}>
                  <div className="sticky top-0 z-[100] bg-zinc-950 pb-2 pt-1">
                    <div className="text-lg font-bold text-gray-100 mb-1 text-center tracking-tight">{status.title}</div>
                  </div>
                  <KanbanColumn
                    key={status.key}
                    id={status.key}
                    title={status.title}
                    color={status.color}
                    count={statusListings.length}
                    minHeightClass="min-h-[120px] md:min-h-[180px]"
                  >
                    <SortableContext
                      items={statusListings.map(l => l._id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4" style={{ overflow: 'visible' }}>
                        {statusListings.map((listing, index) => (
                          <div 
                            key={listing._id || `rejected-noid-${Math.random()}`}
                            className="listing-card-wrapper"
                            style={{ 
                              position: 'relative',
                              zIndex: Math.max(1, statusListings.length - index),
                              isolation: 'isolate',
                              overflow: 'visible'
                            }}
                          >
                            <ListingCard
                              listing={listing}
                              activeId={activeId}
                            />
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </KanbanColumn>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeListing ? (
              <div className="drag-overlay" style={{ zIndex: 9999, position: 'relative' }}>
                <ListingCard listing={activeListing} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">לא נמצאו דירות</p>
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {scraping ? 'סורק...' : 'התחל סריקה'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
  
}

export default App;