import React, { useState, useEffect } from 'react';

const ProfileSettings = () => {
  // --- STATE ---
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null); // The actual file to upload
  const [previewImage, setPreviewImage] = useState(null); // The temporary URL for the preview
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // Success message
  const [error, setError] = useState('');     // Error message

  // --- FETCH CURRENT USER DATA ON LOAD ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch the user's current data so the input isn't blank
        // (Assuming you have a route like /api/users/me, or you grab it from your global state/context)
        const response = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setName(data.name);
          setPreviewImage(data.profileImage || 'https://via.placeholder.com/150'); // Default avatar if none exists
        }
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    };
    fetchUserData();
  }, []);

  // --- HANDLE IMAGE SELECTION ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file); // Save the file to send to the backend
      setPreviewImage(URL.createObjectURL(file)); // Create a temporary local URL to show the user
    }
  };

  // --- SUBMIT THE FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Because we have a file, we MUST use FormData instead of JSON!
    const formData = new FormData();
    formData.append('name', name);
    if (profileImage) {
      formData.append('profileImage', profileImage); 
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
          // IMPORTANT: Do NOT set 'Content-Type': 'application/json' here. 
          // The browser automatically sets the correct multipart/form-data headers for us!
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        // Update local storage if you store the user object there
        const storedUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...storedUser, name: data.name, profileImage: data.profileImage }));
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

      {/* Feedback Alerts */}
      {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded mb-4">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={previewImage || 'https://via.placeholder.com/150'} 
              alt="Profile Preview" 
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
            />
            {/* Hidden file input triggered by the label */}
            <label className="absolute bottom-0 right-0 bg-[#00b14f] hover:bg-green-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
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
          <p className="text-sm text-gray-400 mt-2">Click the pencil icon to change photo</p>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-[#00b14f]"
            required
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[#00b14f] hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition flex justify-center items-center"
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