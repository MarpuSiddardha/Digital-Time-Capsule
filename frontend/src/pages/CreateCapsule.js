import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCapsule, createCapsuleWithFile } from '../services/capsuleService';

const CreateCapsule = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    unlockDate: '',
    unlockTime: '',
    isPublic: false,
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Get minimum date (today) in YYYY-MM-DD format
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get minimum time (current time + 1 minute) in HH:MM format
  const getMinTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Add 1 minute to current time
    return now.toTimeString().substring(0, 5); // Returns "HH:MM" format
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear any previous error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // Clear any previous file error
    if (validationErrors.file) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().substring(0, 5);

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    // Date validation
    if (!formData.unlockDate) {
      errors.unlockDate = 'Unlock date is required';
    } else if (formData.unlockDate < today) {
      errors.unlockDate = 'Please select a future date';
    }

    // Time validation (only if date is today)
    if (formData.unlockDate === today) {
      if (!formData.unlockTime) {
        errors.unlockTime = 'Unlock time is required';
      } else if (formData.unlockTime <= currentTime) {
        errors.unlockTime = 'Please select a future time';
      }
    } else if (!formData.unlockTime) {
      errors.unlockTime = 'Unlock time is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const unlockDateTime = `${formData.unlockDate}T${formData.unlockTime}:00`;
      const formattedData = {
        ...formData,
        unlockDateTime
      };

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', formattedData.title);
        formData.append('message', formattedData.message);
        formData.append('unlockDateTime', unlockDateTime);
        formData.append('isPublic', formattedData.isPublic);

        await createCapsuleWithFile(formData);
      } else {
        await createCapsule(formattedData);
      }

      navigate('/?created=true');
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create time capsule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create New Time Capsule
          </h2>
        </div>
      </div>

      <div className="mt-8">
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      validationErrors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="unlockDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Unlock Date
                    </label>
                    <input
                      type="date"
                      name="unlockDate"
                      id="unlockDate"
                      min={getMinDate()}
                      required
                      value={formData.unlockDate}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md ${
                        validationErrors.unlockDate ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                    />
                    {validationErrors.unlockDate && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.unlockDate}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="unlockTime"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Unlock Time
                    </label>
                    <input
                      type="time"
                      name="unlockTime"
                      id="unlockTime"
                      min={formData.unlockDate === getMinDate() ? getMinTime() : undefined}
                      required
                      value={formData.unlockTime}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md ${
                        validationErrors.unlockTime ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                    />
                    {validationErrors.unlockTime && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.unlockTime}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isPublic"
                      name="isPublic"
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="isPublic"
                      className="font-medium text-gray-700"
                    >
                      Make this capsule public
                    </label>
                    <p className="text-gray-500">
                      Public capsules can be viewed by anyone with the link.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Attachment (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {file
                          ? `Selected: ${file.name}`
                          : 'PNG, JPG, GIF, PDF up to 10MB'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                  className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isSubmitting || Object.keys(validationErrors).length > 0
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Capsule'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCapsule;