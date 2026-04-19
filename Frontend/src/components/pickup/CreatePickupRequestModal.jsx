// CreatePickupRequestModal.jsx
import React, { useState } from "react";
import { X, Truck, CalendarDays, MapPin, Package } from "lucide-react";
import { createPickupRequest } from "../../services/api";

const CreatePickupRequestModal = ({ item, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    address: "",
    preferredDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !item) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const payload = {
        ewasteItemId: item._id,
        quantity: Number(formData.quantity),
        address: formData.address,
        preferredDate: formData.preferredDate,
      };

      const response = await createPickupRequest(payload);

      if (onSuccess) onSuccess(response.data);
      onClose();
      setFormData({
        quantity: 1,
        address: "",
        preferredDate: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create pickup request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Truck className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Create Pickup Request</h2>
              <p className="text-sm text-white/90">Request recycler collection for this item</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 mb-3 font-semibold">
              Selected E-Waste Item
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0f55a7]" />
                <span className="font-medium">Device:</span>
                <span>{item.brand} {item.deviceType}</span>
              </div>

              <div>
                <span className="font-medium">Condition:</span> {item.condition}
              </div>

              <div>
                <span className="font-medium">Weight:</span> {item.weight} kg
              </div>

              <div>
                <span className="font-medium">Disposal Type:</span> {item.disposalType}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0f55a7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pickup Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter pickup address"
                  className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#0f55a7]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preferred Pickup Date
              </label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#0f55a7]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl text-white bg-gradient-to-r from-[#0f55a7] to-[#4db848] hover:opacity-95 transition disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Pickup Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePickupRequestModal;