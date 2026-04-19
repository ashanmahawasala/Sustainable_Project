import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEwasteItem, createPickupRequest  } from "../../services/api";

const CreateEwaste = () => {
  const navigate = useNavigate();
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [pickupAddress, setPickupAddress] = useState("");

  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    condition: "",
    age: "",
    weight: "",
    disposalType: "",
    quantity: 1,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!useProfileAddress && !pickupAddress.trim()) {
    return alert("Please enter pickup address");
    }

    try {
      setLoading(true);

      // 🔥 FIX: convert numbers before sending
      const payload = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        quantity: Number(formData.quantity),
        pickupAddress: useProfileAddress ? null : pickupAddress,
      };

      const res = await createEwasteItem(payload);

      // 🔥 AUTO create pickup request
      await createPickupRequest({
        ewasteItemId: res.data._id,
        quantity: Number(formData.quantity),
      });

      alert("E-Waste item created successfully!");
      navigate("/user/dashboard");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-[#f5f7fb]">

      {/* HEADER */}
      <section className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <p className="uppercase tracking-[0.25em] text-xs text-white/80 mb-3">
            User Dashboard
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">
            Add E-Waste Item
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            Submit your electronic waste for recycling, donation, or resale.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="max-w-[800px] mx-auto px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6"
        >

          {/* Device Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Device Type</label>
            <select
              name="deviceType"
              value={formData.deviceType}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Select device</option>
              <option value="Mobile">Mobile</option>
              <option value="Laptop">Laptop</option>
              <option value="Tablet">Tablet</option>
              <option value="TV">TV</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* Condition (FIXED) */}
          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Not Working">Not Working</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium mb-2">Age (years)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              required
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
          {/* Quantity */}
          <div>
         <label className="block text-sm font-medium mb-2">
          Quantity
        </label>

         <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
          className="w-full border rounded-xl px-4 py-3"
         />
        </div>

          {/* Disposal Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Disposal Type</label>
            <select
              name="disposalType"
              value={formData.disposalType}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Select option</option>
              <option value="Recycle">Recycle</option>
              <option value="Donate">Donate</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-sm font-medium mb-3">Pickup Address</label>

          {/* Radio Options */}
          <div className="space-y-2 mb-3">
          <label className="flex items-center gap-2 text-sm">
          <input
             type="radio"
             checked={useProfileAddress}
             onChange={() => setUseProfileAddress(true)}
          />
            Use my profile address
         </label>

         <label className="flex items-center gap-2 text-sm">
         <input
            type="radio"
            checked={!useProfileAddress}
            onChange={() => setUseProfileAddress(false)}
          />
             Enter different address
          </label>
      </div>

        {/* Conditional Input */}
      {!useProfileAddress && (
      <textarea
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          placeholder="Enter pickup address"
          className="w-full border rounded-xl px-4 py-3"
          required
         />
        )}
        </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white py-3 rounded-xl font-medium"
          >
            {loading ? "Submitting..." : "Create Item"}
          </button>

        </form>
      </section>
    </main>
  );
};

export default CreateEwaste;