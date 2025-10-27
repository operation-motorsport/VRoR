import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RaceTeam } from '../types';
import { useAuth } from '../hooks/useAuth';

export function TeamsPage() {
  const [teams, setTeams] = useState<RaceTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<RaceTeam | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    vehicle_info: '',
    notes: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<RaceTeam | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    vehicle_info: '',
    notes: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<RaceTeam | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      console.log('Fetching race teams from database...');
      const { data, error } = await supabase
        .from('race_teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Race teams loaded:', data?.length || 0);
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching race teams:', error);
      // Fallback to mock data if database fails
      console.log('Falling back to mock data...');
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      console.log('Adding race team to database...');

      const { data, error } = await supabase
        .from('race_teams')
        .insert([{
          name: addFormData.name,
          contact_name: addFormData.contact_name,
          contact_email: addFormData.contact_email || null,
          contact_phone: addFormData.contact_phone || null,
          vehicle_info: addFormData.vehicle_info || null,
          notes: addFormData.notes || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Race team added to database:', data);

      setTeams(prev => [data, ...prev]);
      setSubmitSuccess(`${addFormData.name} added successfully!`);

      // Reset form
      setAddFormData({
        name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        vehicle_info: '',
        notes: ''
      });

      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error adding race team:', error);
      setSubmitError(error.message || 'Failed to add race team');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setAddFormData({
      name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      vehicle_info: '',
      notes: ''
    });
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleEditTeam = (team: RaceTeam) => {
    setEditingTeam(team);
    setEditFormData({
      name: team.name,
      contact_name: team.contact_name,
      contact_email: team.contact_email || '',
      contact_phone: team.contact_phone || '',
      vehicle_info: team.vehicle_info || '',
      notes: team.notes || ''
    });
    setEditError(null);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const { error } = await supabase
        .from('race_teams')
        .update({
          name: editFormData.name,
          contact_name: editFormData.contact_name,
          contact_email: editFormData.contact_email || null,
          contact_phone: editFormData.contact_phone || null,
          vehicle_info: editFormData.vehicle_info || null,
          notes: editFormData.notes || null
        })
        .eq('id', editingTeam.id);

      if (error) throw error;

      setSubmitSuccess(`${editFormData.name} updated successfully!`);
      setEditingTeam(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error updating race team:', error);
      setEditError(error.message || 'Failed to update race team');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;

    setDeleteLoading(true);

    try {
      const { error } = await supabase
        .from('race_teams')
        .delete()
        .eq('id', deletingTeam.id);

      if (error) throw error;

      setSubmitSuccess(`${deletingTeam.name} deleted successfully!`);
      setDeletingTeam(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting race team:', error);
      setSubmitError(error.message || 'Failed to delete race team');
      setDeletingTeam(null);
    } finally {
      setDeleteLoading(false);
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
    <div className="p-4 space-y-4 pb-8">
      <h1 className="text-2xl font-bold text-gray-900">Race Teams</h1>

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
            + Add Race Team
          </button>
        </div>
      )}

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
            <div
              key={team.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
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
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTeam(team);
                        }}
                        className="p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Edit team"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingTeam(team);
                        }}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete team"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                  <div className="text-right">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Team Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Race Team</h2>
              <button
                onClick={resetAddForm}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTeam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addFormData.contact_name}
                    onChange={(e) => setAddFormData({ ...addFormData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={addFormData.contact_email}
                    onChange={(e) => setAddFormData({ ...addFormData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addFormData.contact_phone}
                    onChange={(e) => setAddFormData({ ...addFormData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Info
                  </label>
                  <input
                    type="text"
                    value={addFormData.vehicle_info}
                    onChange={(e) => setAddFormData({ ...addFormData, vehicle_info: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., NASCAR Cup Series #42"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={addFormData.notes}
                    onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any additional information..."
                  />
                </div>
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
                  disabled={submitLoading || !addFormData.name || !addFormData.contact_name || !addFormData.contact_email || !addFormData.contact_phone}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? 'Adding...' : 'Add Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Race Team</h2>
              <button
                onClick={() => setEditingTeam(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.contact_name}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.contact_email}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.contact_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Info
                  </label>
                  <input
                    type="text"
                    value={editFormData.vehicle_info}
                    onChange={(e) => setEditFormData({ ...editFormData, vehicle_info: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., NASCAR Cup Series #42"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || !editFormData.name || !editFormData.contact_name || !editFormData.contact_email || !editFormData.contact_phone}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? 'Updating...' : 'Update Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Team Confirmation Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Race Team</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{deletingTeam.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedTeam.name}
              </h2>
              <button
                onClick={() => setSelectedTeam(null)}
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
                    <span className="font-medium">Name:</span> {selectedTeam.contact_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {selectedTeam.contact_email || 'Not provided'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {selectedTeam.contact_phone || 'Not provided'}
                  </p>
                </div>
              </div>

              {selectedTeam.vehicle_info && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Vehicle Information</h3>
                  <p className="text-sm text-gray-600">{selectedTeam.vehicle_info}</p>
                </div>
              )}

              {selectedTeam.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedTeam.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedTeam(null)}
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