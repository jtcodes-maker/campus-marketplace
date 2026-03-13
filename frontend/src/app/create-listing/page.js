"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react'; // Adding an icon for the upload button

export default function CreateListing() {
  const router = useRouter();

  // 1. Form State (Now includes 'images')
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Tutoring');
  const [images, setImages] = useState(null); // New state to hold our selected files
  
  // 2. Status State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. Security Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // 4. Handle Form Submission with FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 🚨 CRUCIAL CHANGE: We must use FormData to send files, not JSON!
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', Number(price));
      formData.append('category', category);

      // If the user selected files, attach them to the 'images' field
      if (images) {
        // We use Array.from because 'images' is a FileList object, not a standard array
        Array.from(images).forEach((file) => {
          formData.append('images', file);
        });
      }

      // Send the FormData to our backend
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/listings`,
        formData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Tells the backend to expect files!
          },
        }
      );

      // Success! Send them to the homepage
      router.push('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
        Post a New Gig or Item
      </h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gig Title</label>
          <input
            type="text" required maxLength={80} value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. I will design your campus club poster"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 outline-none bg-white"
          >
            <option value="Tutoring">Tutoring</option>
            <option value="Textbooks">Textbooks</option>
            <option value="Electronics">Electronics</option>
            <option value="Dorm Essentials">Dorm Essentials</option>
            <option value="Services">Services (e.g., Laundry, Cleaning)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Price (N$)</label>
          <input
            type="number" required min="0" value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="50"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            required rows="5" value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what you are selling..."
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 outline-none"
          ></textarea>
        </div>

        {/* --- NEW IMAGE UPLOAD SECTION --- */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <ImagePlus className="w-4 h-4 mr-2" /> Upload Photos
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple // Allows selecting multiple photos!
              onChange={(e) => setImages(e.target.files)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {images && (
              <p className="mt-2 text-xs text-green-600 font-bold">
                {images.length} file(s) selected
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">First image will be the cover. Max 5 images.</p>
        </div>
        {/* -------------------------------- */}

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit" disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {loading ? 'Uploading & Publishing...' : 'Publish Gig'}
          </button>
        </div>

      </form>
    </div>
  );
}