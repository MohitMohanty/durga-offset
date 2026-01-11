import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConfirmationPage = () => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // FIX: Allow empty string during typing so user can delete
  const [quantity, setQuantity] = useState("1");
  
  const image = location.state?.image || {
    url: null,
    title: "Untitled Design",
    description: "No description available",
    price: null 
  };

  const SHOP_OWNER_WHATSAPP = "8249814359"; 
  const COUNTRY_CODE = "91";

  const sendWhatsAppMessage = (orderData) => {
    const orderTypes = [
      { key: "invitation", label: "Invitation Card" },
      { key: "pamphlets", label: "Pamphlets" },
      { key: "bill", label: "Bill/Receipt Book" },
      { key: "flex", label: "Flex/Banner" },
      { key: "other", label: "Other" }
    ].filter(type => orderData[type.key]).map(type => type.label);

    const rate = parseFloat(image.price) || 0;
    const qty = parseInt(orderData.quantity) || 0;
    const total = rate > 0 ? ((rate * qty) / 100).toFixed(2) : "To be quoted";

    // Standard Unicode Emojis for maximum API compatibility
    const messageLines = [
      "🌟 *NEW PRINT ORDER* 🌟",
      "",
      "👤 *CUSTOMER DETAILS*",
      `Name: ${orderData.name}`,
      `WhatsApp: ${orderData.whatsapp}`,
      `Email: ${orderData.email || "N/A"}`,
      "",
      "📦 *ORDER INFO*",
      `Type: ${orderTypes.join(", ") || "General Printing"}`,
      `Quantity: ${orderData.quantity}`,
      `Design: ${orderData.designTitle}`,
      "",
      "💰 *PRICING*",
      `Rate: ₹${image.price || "0"} (per 100 pcs)`,
      `Total: ₹${total}`,
      "",
      "🖼️ *DESIGN REFERENCE*",
      orderData.designUrl ? orderData.designUrl : "No link provided",
      "",
      "✅ *Please confirm this order.*"
    ];

    // FIX: Proper encoding of the entire string including emojis
    const encodedMessage = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/${COUNTRY_CODE}${SHOP_OWNER_WHATSAPP}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank", "noopener,noreferrer,,width=600,height=800");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.target;
      const orderData = {
        name: form.name.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        email: form.email.value.trim(),
        invitation: form.invitation.checked,
        pamphlets: form.pamphlets.checked,
        bill: form.bill.checked,
        flex: form.flex.checked,
        other: form.other.checked,
        quantity: quantity === "" ? 1 : Math.max(1, parseInt(quantity)),
        designTitle: image.title,
        designUrl: image.url || null
      };

      if (!orderData.name || !orderData.whatsapp) {
        throw new Error("Required fields missing");
      }

      sendWhatsAppMessage(orderData);
      toast.success("✅ Order confirmed! Opening WhatsApp...");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setQuantity(value); // Allows empty string while typing
  };

  const handleQuantityBlur = () => {
    if (quantity === "" || parseInt(quantity) < 1) {
      setQuantity("1"); // Fallback only after user leaves the field
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden md:flex border border-gray-200">
          
          {/* Image Section */}
          <div className="md:w-1/2 p-6 bg-gray-50 flex flex-col items-center justify-center border-r">
            <div className="relative w-full max-w-xs mx-auto">
              <img
                src={image.url || "https://placehold.co/300x400?text=Design"}
                alt="Selected Design"
                className="w-full h-auto rounded-lg shadow-md border-2 border-white"
              />
              
              
              {image.price && (
                <div className="absolute top-0 right-0 mt-2 mr-2 bg-blue-600 text-white px-3 py-1 rounded shadow-md font-bold border border-white/20">
                  <span className="text-[10px] block leading-none opacity-90 uppercase">Rate</span>
                  <span className="text-lg leading-tight">₹{image.price}</span>
                  <span className="text-[9px] block leading-none font-normal">per 100pcs</span>
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-xl font-bold text-gray-800">{image.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{image.description}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="md:w-1/2 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-semibold">Full Name *</label>
                  <input type="text" name="name" required className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-semibold">WhatsApp Number *</label>
                  <input type="tel" name="whatsapp" required className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10-digit number" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-semibold">Email</label>
                    <input type="email" name="email" className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-semibold">Quantity *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantity}
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
                      required
                    />
                  </div>
                </div>
              </div>

              <fieldset className="border rounded-lg p-4 bg-gray-50/50">
                <legend className="text-xs font-bold text-gray-400 px-2 uppercase tracking-widest">Order Category *</legend>
                <div className="grid grid-cols-2 gap-2">
                  {["invitation", "pamphlets", "bill", "flex", "other"].map((id) => (
                    <div key={id} className="flex items-center">
                      <input id={id} name={id} type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                      <label htmlFor={id} className="ml-2 text-sm text-gray-600 capitalize cursor-pointer">
                        {id === "bill" ? "Bill Book" : id === "flex" ? "Banner" : id}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                {isSubmitting ? "Processing..." : "Confirm via WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ConfirmationPage;