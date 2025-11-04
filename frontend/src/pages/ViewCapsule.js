import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCapsuleById } from '../services/capsuleService';

const ViewCapsule = () => {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const data = await getCapsuleById(id);
        setCapsule(data);
      } catch (err) {
        setError('Failed to load capsule. It may not exist or you may not have permission to view it.');
        console.error('Error fetching capsule:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapsule();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Error
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {error}
          </p>
          <div className="mt-4">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-900"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Capsule not found
          </h3>
          <div className="mt-4">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-900"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {capsule.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {new Date(capsule.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  new Date(capsule.unlockDate) <= new Date()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {new Date(capsule.unlockDate) <= new Date()
                  ? 'Unlocked'
                  : `Locked until ${new Date(capsule.unlockDate).toLocaleDateString()}`}
              </span>
            </dd>
          </div>
          {capsule.fileUrl && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Attachment</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a
                  href={capsule.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View Attachment
                </a>
              </dd>
            </div>
          )}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Message</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
              {capsule.message || 'No message provided.'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ViewCapsule;