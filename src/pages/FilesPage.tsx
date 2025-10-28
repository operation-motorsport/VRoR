import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { FileAttachment } from '../types';
import { useAuth } from '../hooks/useAuth';

export function FilesPage() {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showAlertPrompt, setShowAlertPrompt] = useState(false);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<FileAttachment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  // Auto-clear success/error messages after 5 seconds
  useEffect(() => {
    if (uploadSuccess || uploadError) {
      const timer = setTimeout(() => {
        setUploadSuccess(null);
        setUploadError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess, uploadError]);

  const fetchFiles = async () => {
    try {
      console.log('Fetching files from database...');
      const { data, error } = await supabase
        .from('file_attachments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Files loaded:', data?.length || 0);
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !user) return;

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      console.log('Uploading file to Supabase Storage...');

      // Create unique file path
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, uploadFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded to storage, creating database record...');
      console.log('User ID:', user.id);
      console.log('File details:', {
        filename: uploadFile.name,
        file_path: filePath,
        file_size: uploadFile.size,
        file_type: uploadFile.type
      });

      // Create file record in database
      const insertData = {
        filename: uploadFile.name,
        file_path: filePath,
        file_size: uploadFile.size,
        file_type: uploadFile.type,
        related_type: 'note',
        related_id: null,
        uploaded_by: user.id
      };

      console.log('Attempting to insert:', insertData);

      const { data: fileData, error: dbError } = await supabase
        .from('file_attachments')
        .insert([insertData])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database insert error:', dbError);
        console.error('Error code:', dbError.code);
        console.error('Error message:', dbError.message);
        console.error('Error details:', dbError.details);
        console.error('Error hint:', dbError.hint);
        throw dbError;
      }

      console.log('File record created:', fileData);

      setUploadSuccess(`${uploadFile.name} uploaded successfully!`);
      setFiles(prev => [fileData, ...prev]);

      // Show alert prompt
      setPendingFileId(fileData.id);
      setShowAlertPrompt(true);
      setShowUploadForm(false);

      // Reset form
      setUploadFile(null);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAlertUsers = async (shouldAlert: boolean) => {
    setShowAlertPrompt(false);

    if (shouldAlert && pendingFileId) {
      try {
        console.log('Creating notification for all users...');

        const file = files.find(f => f.id === pendingFileId);
        if (!file) return;

        // Create notification
        const { data: notification, error: notifError } = await supabase
          .from('notifications')
          .insert([{
            title: 'New File Uploaded',
            message: `A new file "${file.filename}" has been uploaded and is available for viewing.`,
            file_id: pendingFileId,
            created_by: user?.id
          }])
          .select()
          .single();

        if (notifError) throw notifError;

        // Get all users
        const { data: allUsers, error: usersError } = await supabase
          .from('users')
          .select('id');

        if (usersError) throw usersError;

        // Create user_notifications for all users
        const userNotifications = allUsers.map(u => ({
          notification_id: notification.id,
          user_id: u.id,
          is_read: false
        }));

        const { error: userNotifError } = await supabase
          .from('user_notifications')
          .insert(userNotifications);

        if (userNotifError) throw userNotifError;

        setUploadSuccess('File uploaded and all users have been notified!');
      } catch (error: any) {
        console.error('Error creating notification:', error);
        setUploadError('File uploaded but failed to notify users');
      }
    }

    setPendingFileId(null);
  };

  const handleDeleteFile = async () => {
    if (!deletingFile) return;

    setDeleteLoading(true);

    try {
      console.log('Deleting file from storage...');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([deletingFile.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_attachments')
        .delete()
        .eq('id', deletingFile.id);

      if (dbError) throw dbError;

      setUploadSuccess(`${deletingFile.filename} deleted successfully!`);
      setDeletingFile(null);
      fetchFiles();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      setUploadError(error.message || 'Failed to delete file');
      setDeletingFile(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadFile = async (file: FileAttachment) => {
    try {
      console.log('Downloading file:', file.filename);

      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      setUploadError('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (fileType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900">
        {isAdmin ? 'Manage Files' : 'Files'}
      </h1>

      {/* Success/Error Messages */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {uploadSuccess}
        </div>
      )}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {uploadError}
        </div>
      )}

      {isAdmin && (
        <div className="flex justify-center">
          <button
            className="btn-primary"
            onClick={() => {
              setShowUploadForm(true);
              setUploadError(null);
              setUploadSuccess(null);
            }}
          >
            + Upload File
          </button>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-3">
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No files uploaded yet.
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="card">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getFileIcon(file.file_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {file.filename}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Download"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setDeletingFile(file)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload File Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upload File</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File *
                </label>
                <input
                  type="file"
                  required
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !uploadFile}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert All Users Prompt */}
      {showAlertPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notify Users?</h2>
            <p className="text-gray-700 mb-6">
              Would you like to send a notification to all users about this file?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleAlertUsers(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={() => handleAlertUsers(true)}
                className="flex-1 btn-primary"
              >
                Yes, Notify All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete File</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{deletingFile.filename}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeletingFile(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
