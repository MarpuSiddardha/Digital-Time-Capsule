import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUnlockedCapsules, getLockedCapsules, deleteCapsule, updateCapsule } from '../services/capsuleService';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [unlockedCapsules, setUnlockedCapsules] = useState([]);
  const [lockedCapsules, setLockedCapsules] = useState([]);
  const [activeTab, setActiveTab] = useState('unlocked');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capsuleToDelete, setCapsuleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCapsule, setEditingCapsule] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    message: '',
    unlockDateTime: ''
  });

  const fetchCapsules = useCallback(async () => {
    try {
      setIsLoading(true);
      const [unlocked, locked] = await Promise.all([
        getUnlockedCapsules(),
        getLockedCapsules()
      ]);
      setUnlockedCapsules(unlocked);
      setLockedCapsules(locked);
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to load capsules. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('created') === 'true') {
      setSuccessMessage('Capsule created successfully!');
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    fetchCapsules();
  }, [fetchCapsules]);

  const handleDeleteCapsule = async () => {
    if (!capsuleToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCapsule(capsuleToDelete);
      await fetchCapsules();
      setSuccessMessage('Capsule deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting capsule:', error);
      setError(error.message || 'Failed to delete capsule');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDeleting(false);
      setCapsuleToDelete(null);
    }
  };

 const handleEditCapsule = (capsule) => {
   setEditingCapsule(capsule);

   // Create a date object from the ISO string
   const date = new Date(capsule.unlockDateTime);

   // Format the date in local time for the datetime-local input
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');

   // Format: YYYY-MM-DDThh:mm
   const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

   setEditFormData({
     title: capsule.title,
     message: capsule.message || '',
     unlockDateTime: formattedDateTime
   });
 };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateCapsule = async (e) => {
    e.preventDefault();
    if (!editingCapsule) return;

    try {
      // Create a date object from the form input (which is in local time)
      const localDate = new Date(editFormData.unlockDateTime);

      // Convert to ISO string without timezone adjustment
      const isoString = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();

      const dataToSend = {
        ...editFormData,
        unlockDateTime: isoString
      };

      const updatedCapsule = await updateCapsule(editingCapsule.id, dataToSend);

      // Update the local state with the response from the server
      setLockedCapsules(lockedCapsules.map(cap =>
        cap.id === updatedCapsule.id ? {
          ...updatedCapsule,
          // Ensure the date is displayed correctly in the UI
          unlockDateTime: updatedCapsule.unlockDateTime
        } : cap
      ));

      setSuccessMessage('Capsule updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingCapsule(null);
    } catch (error) {
      console.error('Error updating capsule:', error);
      setError(error.message || 'Failed to update capsule');
      setTimeout(() => setError(''), 5000);
    }
  };

  const renderCapsules = (capsules) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (capsules.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No {activeTab} capsules found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {capsules.map((capsule) => (
          <div
            key={capsule.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
          >
            <div className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <h3
                  className="text-lg font-medium text-gray-900 flex-1 pr-2 truncate"
                  title={capsule.title}
                >
                  {capsule.title}
                </h3>
                <div className="flex space-x-1">
                  {activeTab === 'locked' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCapsule(capsule);
                      }}
                      className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCapsuleToDelete(capsule.id);
                    }}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                    title="Delete"
                    disabled={isDeleting}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === 'locked'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {activeTab === 'locked' ? '🔒 Locked' : '🔓 Unlocked'}
                </span>
               <span className="text-xs text-gray-500">
                 {new Date(capsule.unlockDateTime).toLocaleString('en-US', {
                   month: 'short',
                   day: 'numeric',
                   year: 'numeric',
                   hour: '2-digit',
                   minute: '2-digit',
                   hour12: true
                 })}
               </span>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-100">
               <Link
                 to={`/capsules/${capsule.id}`}
                 className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
               >
                 View Details
               </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Time Capsules</h1>
          <p className="mt-2 text-sm text-gray-700">
            {activeTab === 'unlocked'
              ? 'View and manage your unlocked time capsules.'
              : 'View and manage your locked time capsules'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Capsule
          </Link>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`${
              activeTab === 'unlocked'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Unlocked Capsules
            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unlockedCapsules.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`${
              activeTab === 'locked'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Locked Capsules
            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {lockedCapsules.length}
            </span>
          </button>
        </nav>
      </div>

      {activeTab === 'unlocked' ? renderCapsules(unlockedCapsules) : renderCapsules(lockedCapsules)}

      {editingCapsule && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setEditingCapsule(null)}
              ></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleUpdateCapsule}>
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Capsule</h3>
                    <div className="mt-4 text-left">
                      <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={editFormData.title}
                          onChange={handleEditFormChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <textarea
                          name="message"
                          id="message"
                          rows="3"
                          value={editFormData.message}
                          onChange={handleEditFormChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        ></textarea>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="unlockDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Unlock Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          name="unlockDateTime"
                          id="unlockDateTime"
                          value={editFormData.unlockDateTime}
                          onChange={handleEditFormChange}
                          min={new Date().toISOString().slice(0, 16)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCapsule(null)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {capsuleToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Capsule</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Are you sure you want to delete this capsule? This action cannot be undone.</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleDeleteCapsule}
                  disabled={isDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setCapsuleToDelete(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;