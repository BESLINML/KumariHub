import React, { useState } from 'react';
import { Search, Tag, Store, MoveRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBox = ({navbar}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const createSlug = (text) => {
    return text ? text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : '';
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/businesses/search/list?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleItemClick = (path) => {
    navigate(path);
    setSearchTerm('');
    setSearchResults([]);
  };


  const matchingCategories = Array.from(
    new Set(
      searchResults
        .filter(item => item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(item => item.category)
    )
  );

  return (
    <div className="w-full h-full mx-auto relative text-black">
      {/* Search Input Box */}
      <div className={`flex items-center border shadow-sm shadow-[#DBA55C]/20 h-full rounded-full px-3 gap-2 ${navbar ? "border-[#664a26]/10 bg-white" : "border-[#664a26]"}`}>
        <div className="md:ps-2 flex items-center justify-center w-full gap-3">
          <Search className={`w-4 md:w-5 shrink-0 ${navbar?"text-black/60":" text-white/70"}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search for businesses, categories, or locations..."
            className={`w-full text-[10px] md:text-sm lg:text-ba placeholder:font-semibold outline-none bg-transparent ${navbar?"text-black":" text-white"}`} />
        </div>

        <div className={`hidden md:flex justify-center items-center bg-[#DBA55C] rounded-full shrink-0 cursor-pointer hover:bg-[#c48e46] transition-colors ${navbar ? "w-13 h-7" : "w-10 md:w-17 h-10 "}`}>
          <MoveRightIcon onClick={handleSearch} className={`text-black ${navbar ? "" : "w-4 md:w-5 "}`} />
        </div>
      </div>

      {/* Results Dropdown Container */}
      {searchTerm && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto scrollbar-none z-50 p-4">
          <p className="text-sm text-gray-500 mb-3">
            {loading ? "Searching..." : `Found ${searchResults.length} results for "${searchTerm}"`}
          </p>

          {matchingCategories.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Categories</p>
              <div className="flex flex-wrap gap-2">
                {matchingCategories.map((cat, index) => (
                  <div
                    key={index}
                    onClick={() => handleItemClick(`/${createSlug(cat)}`)}
                    className="border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 rounded-lg py-2 px-3 cursor-pointer transition flex items-center gap-2"
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-700" />
                    <div>
                      <p className="font-bold text-xs text-amber-900">{cat}</p>
                      <p className="text-[10px] text-amber-700">Category</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Businesses</p>
            <div className="grid grid-cols-1 gap-2">
              {searchResults.map((item) => {
                const catSlug = createSlug(item.category);
                const locSlug = createSlug(item.location);
                const nameSlug = createSlug(item.businessName);

                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(`/${catSlug}/${locSlug}/${nameSlug}`)}
                    className="border border-gray-100 hover:border-gray-200 flex items-center gap-4 rounded-xl p-2 cursor-pointer transition hover:bg-gray-50"
                  >
                    <img
                      src={item.img || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=100"}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                      alt={item.businessName}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{item.businessName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-500 truncate">{item.location} • {item.category}</p>
                        <p className="text-[10px] bg-[#DBA55C] py-0.5 px-2.5 rounded-full text-white font-medium shrink-0">
                          {item.avgRating || '0.0'} ★
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SearchBox;