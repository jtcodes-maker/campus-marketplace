import Link from 'next/link';
import { Star } from 'lucide-react';

export default function GigCard({ listing }) {
  // If the listing doesn't have an image, we use a default placeholder
  const imageUrl = listing.images?.length > 0 
    ? listing.images[0] 
    : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';

  return (
    <Link href={`/listings/${listing._id}`} className="block h-full">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full">
        
        {/* 1. Gig Image */}
        <div className="h-48 w-full overflow-hidden bg-gray-100">
          <img 
            src={imageUrl} 
            alt={listing.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2. Gig Details */}
        <div className="p-4 flex flex-col flex-grow">
          
          {/* Seller Info */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
              {listing.seller?.name?.charAt(0) || 'S'}
            </div>
            <p className="text-sm font-medium text-gray-700 hover:underline">
              {listing.seller?.name || 'Unknown Student'}
            </p>
          </div>

          {/* Title */}
          <h3 className="text-gray-900 font-semibold line-clamp-2 hover:text-green-600 mb-2">
            {listing.title}
          </h3>

          {/* Rating Placeholder (Fiverr style) */}
          <div className="flex items-center text-yellow-500 text-sm mb-4 mt-auto">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 font-bold">5.0</span>
            <span className="text-gray-400 ml-1">(12)</span>
          </div>

          {/* Price Footer */}
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-auto">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {listing.category}
            </span>
            <div className="text-gray-900 font-bold text-lg">
              N${listing.price}
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
}