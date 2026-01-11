import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DigitalPrint = () => {
  const [digitalItems, setDigitalItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedDesc, setSelectedDesc] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null); // Added for modal context
  const galleryRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDigitalImages = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "uploads"));
        const items = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.category === "Digital Print");

        setDigitalItems(items);
        setError(null);
      } catch (err) {
        console.error("Error fetching digital prints:", err);
        setError("Failed to load designs. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDigitalImages();
  }, []);

  const allImages = digitalItems.flatMap((item) =>
    item.imageUrls.map((url, idx) => ({
      id: `${item.id}-${idx}`,
      url,
      title: item.title || "Digital Print Design",
      description: item.description || "Premium digital print design",
      category: item.category || "Digital Print",
      price: item.price // Pulling dynamic price from database
    }))
  );

  const visibleImages = showAll ? allImages : allImages.slice(0, 8);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gallery Section */}
      <div
        ref={galleryRef}
        className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-cyan-50 to-blue-100 rounded-xl shadow-inner"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Our <span className="font-medium">Professional Collection</span>
          </h2>
          <div className="w-24 h-1 bg-cyan-400 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            High-quality digital prints with vibrant colors and sharp details
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm max-w-md mx-auto p-8">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Loading Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">Try Again</button>
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {visibleImages.map((img) => (
                <motion.div
                  key={img.id}
                  variants={item}
                  className="relative rounded-xl overflow-hidden shadow-lg bg-white group"
                >
                  <div className="relative h-64 overflow-hidden cursor-pointer">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onClick={() => {
                        setSelectedImage(img.url);
                        setSelectedTitle(img.title);
                        setSelectedDesc(img.description);
                        setSelectedPrice(img.price);
                      }}
                    />
                  </div>

                  {/* SPLIT ACTION SECTION */}
                  <div className="flex items-center border-t border-gray-100">
                    {/* Left Part: Pricing Info */}
                    <div className="flex-1 px-4 py-3 bg-gray-50/50">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none mb-1">
                        Price
                      </p>
                      <p className="text-cyan-700 font-bold text-lg leading-none">
                        {img.price ? `₹${img.price}` : "N/A"}
                        <span className="text-[10px] text-gray-500 font-normal ml-1">/100 pcs</span>
                      </p>
                    </div>

                    {/* Right Part: Order Button */}
                    <motion.button
                      whileHover={{ backgroundColor: "#0891b2" }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-4 bg-cyan-600 text-white font-bold text-sm uppercase tracking-widest transition-colors"
                      onClick={() => {
                        navigate("/confirmation", {
                          state: {
                            image: {
                              title: img.title,
                              url: img.url,
                              description: img.description,
                              category: img.category,
                              price: img.price
                            }
                          }
                        });
                      }}
                    >
                      Order Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {!showAll && allImages.length > 8 && (
              <div className="text-center mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAll(true)}
                  className="px-8 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm"
                >
                  View All Designs ({allImages.length - 8} more)
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative">
              <button
                className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                onClick={() => setSelectedImage(null)}
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <img src={selectedImage} className="w-full max-h-[60vh] object-contain bg-gray-50" alt="Enlarged design" />
            </div>
            <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedTitle}</h3>
                <p className="text-gray-500 mb-2">{selectedDesc}</p>
                <p className="text-cyan-600 font-bold text-xl">
                   {selectedPrice ? `₹${selectedPrice}` : "N/A"} <span className="text-sm text-gray-400 font-normal">per 100 pieces</span>
                </p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={() => setSelectedImage(null)} className="flex-1 md:flex-none px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">Close</button>
                <button 
                  onClick={() => navigate("/confirmation", { state: { image: { title: selectedTitle, url: selectedImage, description: selectedDesc, price: selectedPrice } } })}
                  className="flex-1 md:flex-none px-10 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700 transition-all"
                >
                  Order Design
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-[#0a192f] to-[#1a759f] py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-4">Ready for Professional Digital Prints?</h3>
          <p className="text-xl text-white/90 mb-8">High-quality finishes for every professional need</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-lg text-lg transition-all"
            onClick={() => navigate("/confirmation")}
          >
            Start Your Order Now
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default DigitalPrint;