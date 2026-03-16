"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export default function ListingDetails() {
  const { id } = useParams(); // Grabs the specific item ID from the URL
  const router = useRouter();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Message States
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("You must be logged in to send a message!");
      router.push('/login');
      return;
    }

    // NEW: Don't let them hit send if the box is just empty spaces!
    if (!messageContent.trim()) {
      alert("Please type a message before sending!");
      return;
    }

    setSending(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        receiverId: listing.seller._id,
        listingId: listing._id,
        content: messageContent.trim() // Force it to send the text properly
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessageSent(true);
      setMessageContent(''); // Clear the box after sending
    } catch (err) {
      console.error("Sending failed:", err.response?.data || err.message);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  if (!listing) return <div className="text-center py-20 text-red-500 font-bold text-xl">Item not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Big Image */}
        <div className="md:w-1/2 h-80 md:h-auto bg-gray-100 border-r border-gray-200">
          <img 
            src={listing.images[0] || 'https://via.placeholder.com/600'} 
            alt={listing.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Details & Message Box */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <span className="text-sm text-green-600 font-bold uppercase tracking-wider">{listing.category}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3">{listing.title}</h1>
            <p className="text-3xl text-gray-900 font-bold mb-6">N${listing.price}</p>
            
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">{listing.description}</p>
            
            <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xl mr-4">
                {listing.seller?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Listed by</p>
                <p className="font-bold text-gray-900 text-lg">{listing.seller?.name}</p>
              </div>
            </div>
          </div>

          {/* Message Box */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Interested? Contact the Seller</h3>
            
            {messageSent ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg font-medium text-center">
                Message sent successfully! They will reply soon.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                <textarea 
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={`Hi ${listing.seller?.name?.split(' ')[0]}, is this still available?`}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                  rows="3"
                ></textarea>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="flex items-center justify-center w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {sending ? 'Sending...' : <><Send className="w-5 h-5 mr-2" /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}