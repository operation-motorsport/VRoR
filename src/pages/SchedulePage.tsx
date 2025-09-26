import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ScheduleItem {
  id: string;
  type: 'activity' | 'pairing';
  title: string;
  time: string;
  details: string;
  veteranName?: string;
  teamName?: string;
}

export function SchedulePage() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDate]);

  const fetchScheduleData = async () => {
    try {
      // TEMPORARY: Use mock data instead of database calls
      console.log('Using mock schedule data for:', selectedDate);

      // Create mock activities for today's date
      const mockItems: ScheduleItem[] = [
        {
          id: '1',
          type: 'activity',
          title: 'Practice Session',
          time: '9:00 AM',
          details: 'Morning practice session on main track',
          veteranName: 'John Smith'
        },
        {
          id: '2',
          type: 'activity',
          title: 'Safety Briefing',
          time: '10:30 AM',
          details: 'Mandatory safety briefing for all participants',
          veteranName: 'Mike Johnson'
        },
        {
          id: '3',
          type: 'activity',
          title: 'Race Event',
          time: '2:00 PM',
          details: 'Main racing event - 20 laps',
          veteranName: 'John Smith'
        },
        {
          id: '4',
          type: 'activity',
          title: 'Awards Ceremony',
          time: '4:30 PM',
          details: 'Awards and closing ceremony',
          veteranName: undefined
        }
      ];

      setScheduleItems(mockItems);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        {isAdmin && (
          <button className="btn-primary text-sm">
            Add Activity
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h2 className="font-medium text-blue-900">
          {formatDateForDisplay(selectedDate)}
        </h2>
      </div>

      <div className="space-y-3">
        {scheduleItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activities scheduled for this date.
          </div>
        ) : (
          scheduleItems.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      item.type === 'activity' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <span className="ml-2 text-sm font-medium text-primary-600">
                      {item.time}
                    </span>
                  </div>

                  {item.veteranName && (
                    <p className="text-sm text-gray-600 ml-6">
                      Veteran: {item.veteranName}
                    </p>
                  )}

                  {item.teamName && (
                    <p className="text-sm text-gray-600 ml-6">
                      Team: {item.teamName}
                    </p>
                  )}

                  {item.details && (
                    <p className="text-sm text-gray-500 ml-6 mt-1">
                      {item.details}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}