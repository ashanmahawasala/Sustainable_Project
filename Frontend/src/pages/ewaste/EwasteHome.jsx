import React, { useEffect, useState } from "react";
import { getMyEwasteItems } from "../../services/api";
import { useNavigate } from "react-router-dom";

const EwasteHome = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const res = await getMyEwasteItems();
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ Stats
  const total = items.length;
  const available = items.filter(i => i.status === "available" || i.status === "requested").length;
  const picked = items.filter(i => i.status === "picked-up").length;
  const recycled = items.filter(i => i.status === "recycled").length;


  const getStatusColor = (status) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700";
    case "requested":
      return "bg-yellow-100 text-yellow-700";
    case "picked-up":
      return "bg-blue-100 text-blue-700";
    case "recycled":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

  return (
    <main className="flex-1 bg-[#f5f7fb]">

      {/* HEADER */}
      <section className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">
            Dashboard Overview
          </h1>
          <p className="text-white/90 text-sm">
            Track your e-waste activity and contributions 🌱
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 ">
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border">
            <p className="text-sm text-blue-700">Total Items</p>
            <h2 className="text-2xl font-semibold mt-2 text-blue-900">{total}</h2>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl shadow-sm border">
            <p className="text-sm text-green-700">Available</p>
            <h2 className="text-2xl font-semibold mt-2 text-green-800">
              {available}
            </h2>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-2xl shadow-sm border">
            <p className="text-sm text-indigo-700">Picked-Up</p>
            <h2 className="text-2xl font-semibold mt-2 text-indigo-800">
              {picked}
            </h2>
          </div>

          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl shadow-sm border">
            <p className="text-sm text-gray-700">Recycled</p>
            <h2 className="text-2xl font-semibold mt-2 text-gray-900">
              {recycled}
            </h2>
          </div>

        </div>

        {/* QUICK ACTION */}
        <div className="bg-gradient-to-r from-[#0f55a7]/10 to-[#4db848]/10 p-6 rounded-2xl border flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-slate-800 items-center gap-2">
              ♻️ Got e-waste to dispose?
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Add a new item and schedule a pickup easily.
            </p>
          </div>

          <button
            onClick={() => navigate("/user/ewaste/create")}
            className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white px-6 py-3 rounded-xl text-sm"
          >
            + Add Item
          </button>
        </div>

        {/* RECENT ITEMS */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Recent Items
          </h3>

          {items.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border text-center">
              <p className="text-slate-500">
                No items yet. Start by adding one.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {items.slice(0, 3).map((item) => {
                const statusStyles = {
                available: "border-green-400 bg-green-50/40",
                requested: "border-yellow-400 bg-yellow-50/40",
                "picked-up": "border-blue-400 bg-blue-50/40",
                recycled: "border-gray-400 bg-gray-50/60",
            };

    return (
         <div
           key={item._id}
           className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition flex flex-col justify-between border-l-4 ${
            statusStyles[item.status] || "bg-white border-slate-200"
           }`}
          >
          <div>
             <h3 className="font-semibold text-lg">
                {item.deviceType} - {item.brand}
             </h3>

             <div className="mt-3 space-y-1 text-sm text-slate-600">
               <p>
                  Condition: <span className="text-slate-800">{item.condition}</span>
               </p>
              <p>
                 Age: <span className="text-slate-800">{item.age} yrs</span>
              </p>
              <p>
                Weight: <span className="text-slate-800">{item.weight} kg</span>
               </p>
               <p>
                  Disposal: <span className="text-slate-800">{item.disposalType}</span>
                </p>
              </div>

            <span
                 className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${getStatusColor(
                 item.status
               )}`}
               >
                 {item.status}
               </span>
             </div>
           </div>
           );
         })}
        </div>
          )}
        </div>

      </section>
    </main>
  );
};

export default EwasteHome;