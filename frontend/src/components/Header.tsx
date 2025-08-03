import { useState, useEffect } from 'react';
import { getStats } from '../services/api';

interface HeaderProps {
  onScrape: () => void;
  scraping: boolean;
  listingsCount: number;
  onRefresh: () => void;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  recent24h: number;
}

export default function Header({ onScrape, scraping, listingsCount, onRefresh }: HeaderProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🏠 Apartment Scanner
            </h1>
            <p className="text-sm text-gray-600">
              Ganei Tikva & Kiryat Ono | Last update: {formatTime(lastUpdate)}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {stats && (
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <span>Total: <strong>{stats.total}</strong></span>
                <span>New: <strong className="text-yellow-600">{stats.byStatus.new || 0}</strong></span>
                <span>Called: <strong className="text-blue-600">{stats.byStatus.called || 0}</strong></span>
                <span>Visited: <strong className="text-green-600">{stats.byStatus.visited || 0}</strong></span>
                <span>Last 24h: <strong className="text-purple-600">{stats.recent24h}</strong></span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🔄 Refresh
              </button>
              
              <button
                onClick={onScrape}
                disabled={scraping}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${scraping 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {scraping ? (
                  <>
                    <span className="animate-spin inline-block mr-1">⏳</span>
                    Scraping...
                  </>
                ) : (
                  '🔍 Scrape Now'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile stats */}
        {stats && (
          <div className="md:hidden mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              Total: <strong>{stats.total}</strong>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              New: <strong>{stats.byStatus.new || 0}</strong>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              Called: <strong>{stats.byStatus.called || 0}</strong>
            </div>
            <div className="bg-green-50 p-2 rounded">
              Visited: <strong>{stats.byStatus.visited || 0}</strong>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
