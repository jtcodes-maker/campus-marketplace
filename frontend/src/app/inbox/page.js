"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Added Trash2 to our icons!
import { MessageSquare, ArrowRight, Send, Trash2 } from 'lucide-react';

export default function Inbox() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [replyTexts, setReplyTexts] = useState({}); 
  const [isReplying, setIsReplying] = useState(null);

  useEffect(() => {
    fetchInbox();
  }, [router]);

  const fetchInbox = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUserId(user.id || user._id); 

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

  const handleSendReply = async (originalMessageId, originalMessage) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const textToSend = replyTexts[originalMessageId];

    if (!textToSend || !textToSend.trim()) {
      alert("Please type a message before sending!");
      return;
    }

    const isSender = originalMessage.sender._id === currentUserId;
    const otherPersonId = isSender ? originalMessage.receiver._id : originalMessage.sender._id;

    try {
      setIsReplying(originalMessageId);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        receiverId: otherPersonId,
        listingId: originalMessage.listing?._id, // Notice the optional chaining '?' just in case the item is deleted
        content: textToSend.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReplyTexts(prev => ({ ...prev, [originalMessageId]: '' }));
      setIsReplying(null);
      fetchInbox(); 

    } catch (err) {
      console.error("Failed to send reply:", err.response?.data || err.message);
      alert("Failed to send reply. Please try again.");
      setIsReplying(null);
    }
  };

  // --- NEW: Delete Function ---
  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Instantly remove it from the screen without reloading
      setMessages(messages.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete message. Please try again.");
    }
  };

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
              const isSender = msg.sender?._id === currentUserId;
              const otherPerson = isSender ? msg.receiver : msg.sender;
              
              return (
                <li key={msg._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-3 border border-green-200">
                        {otherPerson?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {isSender ? `You sent a message to ${otherPerson?.name || 'Unknown'}` : `Message from ${otherPerson?.name || 'Unknown'}`}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Regarding: {msg.listing?.title || 'Deleted Item'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Timestamp & Delete Button Group */}
                    <div className="flex items-center mt-3 sm:mt-0">
                      <span className="text-xs text-gray-400 font-medium mr-4">
                        {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <button 
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Delete Message"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="ml-0 sm:ml-13 bg-gray-100 p-4 rounded-lg rounded-tl-none border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{msg.content || 'Message unavailable'}</p>
                  </div>
                  
                  {msg.listing && (
                    <div className="mt-4 flex justify-between items-center ml-0 sm:ml-13">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isSender ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {isSender ? 'You Sent' : 'You Received'}
                      </span>
                      <Link 
                        href={`/listings/${msg.listing._id}`}
                        className="flex items-center text-sm text-green-600 font-semibold hover:text-green-700 transition-colors"
                      >
                        View Item Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}

                  <div className="mt-5 border-t border-gray-200 pt-5 ml-0 sm:ml-13">
                    <textarea
                      value={replyTexts[msg._id] || ''}
                      onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg._id]: e.target.value }))}
                      placeholder={`Reply to ${otherPerson?.name || 'them'}...`}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none bg-white shadow-inner"
                      rows="2"
                    ></textarea>
                    <div className="flex justify-end mt-3">
                      <button 
                        onClick={() => handleSendReply(msg._id, msg)}
                        disabled={isReplying === msg._id}
                        className={`flex items-center bg-green-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors ${isReplying === msg._id ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isReplying === msg._id ? 'Sending...' : <><Send className="w-4 h-4 mr-2" /> Send Reply</>}
                      </button>
                    </div>
                  </div>

                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}