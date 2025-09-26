import { useState, useEffect } from 'react';
import type { Event } from '../types';
import { useAuth } from '../hooks/useAuth';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // TEMPORARY: Use mock data instead of database calls
      console.log('Using mock events data...');
      const mockEvents = [
        {
          id: '1',
          name: "Veterans Race of Remembrance 2024",
          date: '2024-11-11',
          location: 'Daytona International Speedway',
          description: 'Annual flagship event honoring our veterans with high-speed racing experiences.',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Spring Training Event',
          date: '2024-04-15',
          location: 'Road Atlanta',
          description: 'Pre-season training and preparation event for new veteran participants.',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        },
        {
          id: '3',
          name: 'Memorial Day Track Experience',
          date: '2024-05-27',
          location: 'Charlotte Motor Speedway',
          description: 'Special Memorial Day event featuring parade laps and ceremonies.',
          created_at: '2024-01-03',
          updated_at: '2024-01-03'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        {isAdmin && (
          <button className="btn-primary">
            Add Event
          </button>
        )}
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events scheduled yet.
          </div>
        ) : (
          events.map((event) => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate > new Date();

            return (
              <div key={event.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-gray-900 mr-2">
                        {event.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isUpcoming
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)}
                      </div>

                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-600 mt-3">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}