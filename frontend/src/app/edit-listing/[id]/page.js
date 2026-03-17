"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Tutoring', 'Textbooks', 'Electronics', 'Clothing', 'Other'];

export default function EditListing() {
  const router = useRouter();
  const { id } = useParams(); // Grab the listing ID from the URL

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Other',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch the existing data when the page loads
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
        // Pre-fill the form state with the database data!
        setFormData({
          title: res.data.title,
          description: res.data.description,
          price: res.data.price,
          category: res.data.category,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not load the listing details.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Send the updated data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Listing updated successfully!');
      router.push('/dashboard'); // Send them back to their dashboard
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || 'Failed to update listing.');
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-green-600 mb-6 font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Listing</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input 
              type="text" name="title" required
              value={formData.title} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (N$)</label>
              <input 
                type="number" name="price" required min="0"
                value={formData.price} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
              <select 
                name="category" value={formData.category} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" required rows="5"
              value={formData.description} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" disabled={saving}
            className="w-full flex justify-center items-center bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {saving ? 'Saving Changes...' : <><Save className="w-5 h-5 mr-2"/> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}