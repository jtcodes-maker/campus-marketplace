"use client";

import React, { useState, useEffect } from 'react';

const ProfileSettings = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null); 
  const [previewImage, setPreviewImage] = useState(null); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setName(data.name || '');
          setBio(data.bio || '');
          setPreviewImage(data.profileImage || 'https://via.placeholder.com/150');
        }
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    };
    fetchUserData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (profileImage) {
      formData.append('profileImage', profileImage); 
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          localStorage.setItem('user', JSON.stringify({ 
            ...storedUser, 
            name: data.name, 
            profileImage: data.profileImage 
          }));
        }
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('A server error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Changed to a white background with a subtle border and shadow
    <div className="max-w-md mx-auto mt-10 p-8 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900">
      <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900">Edit Profile</h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      {message && <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded mb-4 text-sm">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={previewImage || 'https://via.placeholder.com/150'} 
              alt="Profile Preview" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            <label className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-3 font-medium">Click the pencil icon to change photo</p>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            required
          />
        </div>

        {/* Bio Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">About Me (Bio)</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)}
            maxLength="250"
            rows="3"
            placeholder="E.g., 3rd Year Comp Sci student. Fast replies!"
            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/250</p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md shadow-sm transition flex justify-center items-center"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;