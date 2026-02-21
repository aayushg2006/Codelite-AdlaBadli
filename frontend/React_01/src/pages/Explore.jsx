import React from 'react';
import BottomNav from '../components/layout/BottomNav';

const Explore = () => {
  const categories = ['Electronics', 'Furniture', 'Books', 'Clothing', 'Appliances', 'Sports'];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Nearby</h2>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <input 
          type="text" 
          placeholder="Search for items..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7A936C]"
        />
        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
      </div>

      {/* Categories */}
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Browse by Category</h3>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center font-medium text-gray-600 hover:border-[#7A936C] hover:text-[#7A936C] cursor-pointer transition-colors">
            {cat}
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default Explore;