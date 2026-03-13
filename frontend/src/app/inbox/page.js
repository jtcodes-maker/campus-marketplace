"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Send, User as UserIcon } from 'lucide-react';

export default function Inbox() {
  const router = useRouter();
  
  // State for the left sidebar (List of chats)
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the right side (Active chat)
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // We need to know who "we" are so we can color our chat bubbles differently!
  const [myUserId, setMyUserId] = useState(null);

  // 1. Fetch conversations when the page loads
  useEffect(() => {
    const fetchInbox = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        router.push('/login');
        return;
      }
      
      setMyUserId(user.id);

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/inbox`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
      } catch (err) {
        console.error("Error loading inbox");
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [router]);

  // 2. Fetch messages when you click on a specific conversation
  const loadMessages = async (conversation) => {
    setActiveChat(conversation);
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/${conversation._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error loading messages");
    }
  };

  // 3. Send a new message from inside the inbox
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    
    // Figure out who the "other person" is in this chat
    const receiver = activeChat.participants.find(p => p._id !== myUserId);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        receiverId: receiver._id,
        listingId: activeChat.listing._id,
        text: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add the new message to our screen instantly
      setMessages([...messages, { ...res.data, sender: { _id: myUserId, name: "Me" } }]);
      setNewMessage('');
      
      // Update the "last message" preview on the left sidebar
      setConversations(conversations.map(c => 
        c._id === activeChat._id ? { ...c, lastMessage: newMessage } : c
      ));

    } catch (err) {
      console.error("Error sending message");
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-green-600">Loading Inbox...</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[75vh] flex mt-4">
      
      {/* LEFT SIDE: Conversation List */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {conversations.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-sm">No messages yet.</p>
          ) : (
            conversations.map((conv) => {
              // Find the other person's details
              const otherPerson = conv.participants.find(p => p._id !== myUserId);
              const isActive = activeChat?._id === conv._id;
              
              return (
                <div 
                  key={conv._id}
                  onClick={() => loadMessages(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${isActive ? 'bg-green-50 border-l-4 border-l-green-600' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{otherPerson?.name}</h4>
                    <span className="text-xs text-gray-400 border bg-white px-1 rounded">{conv.listing?.title.substring(0, 15)}...</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Active Chat Area */}
      <div className="w-2/3 flex flex-col bg-white">
        {!activeChat ? (
          <div className="flex-grow flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mr-3">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {activeChat.participants.find(p => p._id !== myUserId)?.name}
                </h3>
                <p className="text-xs text-green-600 font-semibold">Regarding: {activeChat.listing.title}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-6 bg-gray-50 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender._id === myUserId;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="submit" className="bg-green-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-green-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}