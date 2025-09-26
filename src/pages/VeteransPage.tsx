import { useState, useEffect } from 'react';
import type { Veteran } from '../types';
import { useAuth } from '../hooks/useAuth';

export function VeteransPage() {
  const [veterans, setVeterans] = useState<Veteran[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchVeterans();
  }, []);

  const fetchVeterans = async () => {
    try {
      // TEMPORARY: Use mock data instead of database calls
      console.log('Using mock veterans data...');
      const mockVeterans = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@email.com',
          phone: '555-0101',
          military_branch: 'US Army',
          service_years: '2010-2018',
          medical_notes: 'TBI, PTSD',
          emergency_contact_name: 'Jane Smith',
          emergency_contact_phone: '555-0102',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          first_name: 'Mike',
          last_name: 'Johnson',
          email: 'mike.johnson@email.com',
          phone: '555-0201',
          military_branch: 'US Marine Corps',
          service_years: '2012-2020',
          medical_notes: 'Amputee - Right leg',
          emergency_contact_name: 'Sarah Johnson',
          emergency_contact_phone: '555-0202',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];
      setVeterans(mockVeterans);
    } catch (error) {
      console.error('Error fetching veterans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVeterans = veterans.filter(veteran =>
    `${veteran.first_name} ${veteran.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veteran.military_branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
        {isAdmin && (
          <button className="btn-primary text-xl px-3 py-2">
            +
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search veterans..."
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
        {filteredVeterans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No veterans found matching your search.' : 'No veterans registered yet.'}
          </div>
        ) : (
          filteredVeterans.map((veteran) => (
            <div key={veteran.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {veteran.first_name} {veteran.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {veteran.military_branch}
                    {veteran.service_years && ` • ${veteran.service_years}`}
                  </p>
                  {veteran.email && (
                    <p className="text-sm text-gray-500 mt-1">{veteran.email}</p>
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