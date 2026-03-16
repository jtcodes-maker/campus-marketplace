"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

export default function Inbox() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // We need to know who is logged in so we can label messages as "Sent" or "Received"
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchInbox = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        router.push('/login');
        return;
      }

      // Parse the user data from localStorage
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id || user._id); // Handle different ID formats just in case

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Inbox fetch error:", err);
        setError("Failed to load your messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center mb-8">
        <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">My Inbox</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 font-medium">
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h2>
          <p className="text-gray-500">When you contact a seller or someone asks about your gigs, the messages will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {messages.map((msg) => {
              // Figure out if the logged-in user sent this, or received it
              const isSender = msg.sender._id === currentUserId;
              const otherPerson = isSender ? msg.receiver : msg.sender;
              
              return (
                <li key={msg._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    
                    {/* Header: Who is it from/to? */}
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-3">
                        {otherPerson?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {isSender ? `You sent a message to ${otherPerson?.name}` : `Message from ${otherPerson?.name}`}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Regarding: {msg.listing?.title || 'Deleted Item'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <span className="text-xs text-gray-400 mt-2 sm:mt-0 whitespace-nowrap font-medium">
                      {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  {/* The Actual Message Content */}
                  <div className="ml-0 sm:ml-13 bg-gray-100 p-4 rounded-lg rounded-tl-none border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {/* Link back to the item */}
                  {msg.listing && (
                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`/listings/${msg.listing._id}`}
                        className="flex items-center text-sm text-green-600 font-semibold hover:text-green-700 transition-colors"
                      >
                        View Item <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}