import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyEwasteItems, deleteEwasteItem } from "../../services/api";

const EwasteList = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "USER";
  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";
  const isRecycler = userRole === "RECYCLER";

  //console.log("Role:", userRole); // DEBUG

  const fetchItems = async () => {
    try {
      const res = await getMyEwasteItems();
      setItems(res.data.data);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteEwasteItem(id);
      fetchItems(); // refresh list
    } catch (error) {
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

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

  

  useEffect(() => {
    fetchItems();
  }, []);

  
  return (
  <main className="flex-1 bg-[#f5f7fb]">

    {/* HEADER */}
    <section className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
        <p className="uppercase tracking-[0.25em] text-xs text-white/80 mb-3">
          E-Waste Management
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold mb-3">
          {isAdmin
            ? "All E-Waste Items"
            : isRecycler
            ? "Available E-Waste Items"
            : "My E-Waste Items"}
        </h1>
        <p className="text-white/90 max-w-2xl text-sm md:text-base">
          {isAdmin
            ? "View and manage every user's e-waste item."
            : isRecycler
            ? "Browse available e-waste items for pickup." 
            : "Manage your electronic waste items and track their lifecycle."}
        </p>
      </div>
    </section>

    {/* CONTENT */}
    <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">

      {/* ADD BUTTON */}
      {isUser && items.length > 0 && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/user/ewaste/create")}
            className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90"
          >
            + Add New Item
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border text-center shadow-sm flex flex-col items-center">
    
     {/* Icon */}
     <div className="text-5xl mb-4">♻️</div>

     {/* Title */}
     <h2 className="text-xl font-semibold text-slate-700 mb-2">
      No E-Waste Items Yet
     </h2>

     {/* Description */}
     <p className="text-slate-500 text-sm mb-6 max-w-md">
      Start by adding your first electronic waste item and help make the planet greener.
     </p>

     {/* CTA Button */}
     {isUser ? (
       <button
         onClick={() => navigate("/user/ewaste/create")}
         className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90"
       >
         + Add Your First Item
       </button>
     ) : (
       <p className="text-sm text-slate-500 max-w-md">
         {isAdmin
           ? "There are no e-waste items in the system yet."
           : "No e-waste items are available right now."}
       </p>
     )}

     </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
       {items.map((item) => {
        const statusStyles = {
           available: "border-green-400 bg-green-50/40",
           requested: "border-yellow-400 bg-yellow-50/40",
           "picked-up": "border-blue-400 bg-blue-50/40",
           recycled: "border-gray-400 bg-gray-50/60",
         };

    return (
      <div
        key={item._id}
        className={`p-5 rounded-2xl border border-l-4 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
          statusStyles[item.status] || "bg-white border-slate-200"
        }`}
      >
        <div>
          <h3 className="font-semibold text-lg text-slate-800">
            {item.deviceType} - {item.brand}
          </h3>

          {/* INFO GRID */}
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            {isAdmin && item.owner && (
              <p>
                Owner: <span className="text-slate-800">{typeof item.owner === "object" ? item.owner.fullName || item.owner.email || item.owner._id : item.owner}</span>
              </p>
            )}
            <p>
              Condition:{" "}
              <span className="text-slate-800">{item.condition}</span>
            </p>
            <p>
              Age:{" "}
              <span className="text-slate-800">{item.age} yrs</span>
            </p>
            <p>
              Weight:{" "}
              <span className="text-slate-800">{item.weight} kg</span>
            </p>
            <p>
              Disposal:{" "}
              <span className="text-slate-800">{item.disposalType}</span>
            </p>
          </div>

          {/* STATUS BADGE */}
          <span
            className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${getStatusColor(
              item.status
            )}`}
          >
            {item.status}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-5">
          {isAdmin && (
            <button
              onClick={() => handleDelete(item._id)}
              className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition"
            >
              Delete
            </button>
          )}

          {isUser && (item.status === "available" || item.status === "requested") && (
            <>
              <button
                onClick={() => navigate(`/user/ewaste/edit/${item._id}`)}
                className="flex-1 border border-[#0f55a7] text-[#0f55a7] py-2 rounded-lg text-sm hover:bg-[#0f55a7] hover:text-white transition"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  })}
</div>
      )}
    </section>
  </main>
 );
};

export default EwasteList;