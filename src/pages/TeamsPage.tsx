import { useState, useEffect } from 'react';
import type { RaceTeam } from '../types';
import { useAuth } from '../hooks/useAuth';

export function TeamsPage() {
  const [teams, setTeams] = useState<RaceTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // TEMPORARY: Use mock data instead of database calls
      console.log('Using mock teams data...');
      const mockTeams = [
        {
          id: '1',
          name: 'Thunder Racing',
          contact_name: 'Mike Thompson',
          contact_email: 'mike@thunderracing.com',
          contact_phone: '555-0301',
          vehicle_info: 'NASCAR Cup Series #42',
          notes: 'Experienced with veteran drivers',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Victory Lane Motorsports',
          contact_name: 'Sarah Davis',
          contact_email: 'sarah@victorylane.com',
          contact_phone: '555-0302',
          vehicle_info: 'IndyCar Dallara DW12',
          notes: 'Veteran-owned team',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];
      setTeams(mockTeams);
    } catch (error) {
      console.error('Error fetching race teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Race Teams</h1>
        {isAdmin && (
          <button className="btn-primary">
            Add Team
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="space-y-3">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No teams found matching your search.' : 'No race teams registered yet.'}
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div key={team.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Contact: {team.contact_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {team.contact_email} • {team.contact_phone}
                  </p>
                  {team.vehicle_info && (
                    <p className="text-sm text-blue-600 mt-1 font-medium">
                      {team.vehicle_info}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}