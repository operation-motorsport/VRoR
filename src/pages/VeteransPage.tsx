import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Veteran } from '../types';
import { useAuth } from '../hooks/useAuth';

export function VeteransPage() {
  const [veterans, setVeterans] = useState<Veteran[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVeteran, setSelectedVeteran] = useState<Veteran | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    military_branch: '',
    service_years: '',
    medical_notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    race_team_name: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchVeterans();
  }, []);

  const fetchVeterans = async () => {
    try {
      console.log('Fetching veterans from database...');
      const { data, error } = await supabase
        .from('veterans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Veterans loaded:', data?.length || 0);
      setVeterans(data || []);
    } catch (error) {
      console.error('Error fetching veterans:', error);
      // Fallback to mock data if database fails
      console.log('Falling back to mock data...');
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
    } finally {
      setLoading(false);
    }
  };

  const filteredVeterans = veterans.filter(veteran =>
    `${veteran.first_name} ${veteran.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veteran.military_branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      console.log('Adding beneficiary to database...');

      // Insert into Supabase database
      const { data, error } = await supabase
        .from('veterans')
        .insert([{
          first_name: addFormData.first_name,
          last_name: addFormData.last_name,
          email: addFormData.email || null,
          phone: addFormData.phone || null,
          military_branch: addFormData.military_branch,
          service_years: addFormData.service_years || null,
          medical_notes: addFormData.medical_notes || null,
          emergency_contact_name: addFormData.emergency_contact_name || null,
          emergency_contact_phone: addFormData.emergency_contact_phone || null,
          race_team_name: addFormData.race_team_name || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Beneficiary added to database:', data);

      // Add to local state for immediate UI update
      setVeterans(prev => [data, ...prev]);
      setSubmitSuccess(`${addFormData.first_name} ${addFormData.last_name} added successfully!`);

      // Reset form
      setAddFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        military_branch: '',
        service_years: '',
        medical_notes: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        race_team_name: ''
      });

      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error adding beneficiary:', error);
      setSubmitError(error.message || 'Failed to add beneficiary');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setAddFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      military_branch: '',
      service_years: '',
      medical_notes: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      race_team_name: ''
    });
    setSubmitError(null);
    setSubmitSuccess(null);
  };

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
      <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {submitSuccess}
        </div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {submitError}
        </div>
      )}

      {isAdmin && (
        <div className="flex justify-center">
          <button
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            + Add Beneficiary
          </button>
        </div>
      )}

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
            <div
              key={veteran.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedVeteran(veteran)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {veteran.first_name} {veteran.last_name}
                  </h3>
                  <div className="mt-1 space-y-1">
                    {veteran.phone && (
                      <p className="text-sm text-gray-600">
                        📞 {veteran.phone}
                      </p>
                    )}
                    {veteran.email && (
                      <p className="text-sm text-gray-600">
                        📧 {veteran.email}
                      </p>
                    )}
                    {veteran.race_team_name && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening veteran details
                          // TODO: Show race team info modal
                          alert(`Race Team: ${veteran.race_team_name}\n\nRace team details will be shown here.`);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 block"
                      >
                        🏎️ {veteran.race_team_name}
                      </button>
                    )}
                  </div>
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

      {/* Add Beneficiary Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Beneficiary</h2>
              <button
                onClick={resetAddForm}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddBeneficiary} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addFormData.first_name}
                    onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addFormData.last_name}
                    onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Military Branch *
                  </label>
                  <select
                    required
                    value={addFormData.military_branch}
                    onChange={(e) => setAddFormData({ ...addFormData, military_branch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Branch</option>
                    <option value="US Army">US Army</option>
                    <option value="US Navy">US Navy</option>
                    <option value="US Air Force">US Air Force</option>
                    <option value="US Marine Corps">US Marine Corps</option>
                    <option value="US Coast Guard">US Coast Guard</option>
                    <option value="US Space Force">US Space Force</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Years
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2010-2018"
                    value={addFormData.service_years}
                    onChange={(e) => setAddFormData({ ...addFormData, service_years: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Notes
                </label>
                <textarea
                  rows={3}
                  value={addFormData.medical_notes}
                  onChange={(e) => setAddFormData({ ...addFormData, medical_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any medical conditions, medications, or special needs..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={addFormData.emergency_contact_name}
                    onChange={(e) => setAddFormData({ ...addFormData, emergency_contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={addFormData.emergency_contact_phone}
                    onChange={(e) => setAddFormData({ ...addFormData, emergency_contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Race Team
                </label>
                <input
                  type="text"
                  value={addFormData.race_team_name}
                  onChange={(e) => setAddFormData({ ...addFormData, race_team_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Thunder Racing Team"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetAddForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !addFormData.first_name || !addFormData.last_name || !addFormData.military_branch}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? 'Adding...' : 'Add Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Veteran Details Modal */}
      {selectedVeteran && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedVeteran.first_name} {selectedVeteran.last_name}
              </h2>
              <button
                onClick={() => setSelectedVeteran(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {selectedVeteran.email || 'Not provided'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {selectedVeteran.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Military Service</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Branch:</span> {selectedVeteran.military_branch}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Service Years:</span> {selectedVeteran.service_years || 'Not provided'}
                  </p>
                </div>
              </div>

              {selectedVeteran.medical_notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Medical Notes</h3>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                    {selectedVeteran.medical_notes}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Emergency Contact</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {selectedVeteran.emergency_contact_name || 'Not provided'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {selectedVeteran.emergency_contact_phone || 'Not provided'}
                  </p>
                </div>
              </div>

              {selectedVeteran.race_team_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Race Team</h3>
                  <button
                    onClick={() => {
                      // TODO: Show race team contact info modal
                      alert(`Race Team: ${selectedVeteran.race_team_name}\n\nRace team contact details will be shown here.`);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    🏎️ {selectedVeteran.race_team_name}
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedVeteran(null)}
                  className="w-full btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}