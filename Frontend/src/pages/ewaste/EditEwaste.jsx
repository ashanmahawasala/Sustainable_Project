import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEwasteItemById, updateEwasteItem } from "../../services/api";

const EditEwaste = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [fetching, setFetching] = useState(true);

  // ✅ Fetch existing item
  const fetchItem = async () => {
    try {
      const res = await getEwasteItemById(id);

      const item = res.data;

      setFormData({
        deviceType: item.deviceType,
        brand: item.brand,
        condition: item.condition,
        age: item.age,
        weight: item.weight,
        disposalType: item.disposalType,
        quantity: item.quantity || 1,
      });

      setUseProfileAddress(item.useProfileAddress ?? true);
      setPickupAddress(item.pickupAddress || "")

    } catch (error) {
      alert("Failed to load item");
      navigate("/user/dashboard");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!useProfileAddress && !pickupAddress.trim()) {
      return  alert("Please enter pickup address");
    }

    try {
      setLoading(true);
      await updateEwasteItem(id, {
        ...formData,
        useProfileAddress,
        pickupAddress: useProfileAddress ? null : pickupAddress,
     });

      alert("Item updated successfully!");
      navigate("/user/dashboard");

    } catch (error) {
      alert(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main className="flex-1 bg-[#f5f7fb]">

      {/* HEADER */}
      <section className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">
            Edit E-Waste Item
          </h1>
          <p className="text-white/90 text-sm">
            Update your item details.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="max-w-[800px] mx-auto px-6 lg:px-8 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border p-8 space-y-6"
        >

          {/* Device Type */}
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

          {/* Brand */}
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            placeholder="Brand"
            className="w-full border rounded-xl px-4 py-3"
          />

          {/* Condition */}
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

          {/* Age */}
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="0"
            required
            placeholder="Age (years)"
            className="w-full border rounded-xl px-4 py-3"
          />

          {/* Weight */}
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            step="0.1"
            required
            placeholder="Weight (kg)"
            className="w-full border rounded-xl px-4 py-3"
          />

          {/* Quantity */}
          <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
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


          {/* Address Option */}
        <div>
         <label className="block text-sm font-medium mb-2">
            Pickup Address Option
         </label>

         <select
            value={useProfileAddress ? "profile" : "custom"}
            onChange={(e) =>
            setUseProfileAddress(e.target.value === "profile")
          }
          className="w-full border rounded-xl px-4 py-3"
         >
          <option value="profile">Use My Profile Address</option>
          <option value="custom">Enter Different Address</option>
        </select>
       </div>

        {/* Custom Address */}
        {!useProfileAddress && (
       <div>
       <label className="block text-sm font-medium mb-2">
         Pickup Address
       </label>
       <textarea
         value={pickupAddress}
         onChange={(e) => setPickupAddress(e.target.value)}
         required={!useProfileAddress}
         className="w-full border rounded-xl px-4 py-3"
         rows={3}
        />
        </div>
        )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white py-3 rounded-xl"
          >
            {loading ? "Updating..." : "Update Item"}
          </button>

        </form>
      </section>
    </main>
  );
};

export default EditEwaste;