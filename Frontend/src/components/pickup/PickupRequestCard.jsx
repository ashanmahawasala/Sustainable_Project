//PickupRequestCard.jsx
import React from "react";
import { CalendarDays, MapPin, Package, UserRound } from "lucide-react";
import PickupStatusBadge from "./PickupStatusBadge";

const PickupRequestCard = ({ request, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-5 cursor-pointer transition-all duration-200 shadow-sm
        hover:border-[#4db848] hover:bg-green-50 hover:shadow-lg hover:scale-[1.01]
        ${
          selected
            ? "border-[#0f55a7] bg-blue-50 shadow-md"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{request.itemName}</h3>
          <p className="text-sm text-slate-500 mt-1">Request ID: {request._id}</p>
        </div>

        <PickupStatusBadge status={request.status} />
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#0f55a7]" />
          <span>Quantity: {request.quantity}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0f55a7]" />
          <span className="line-clamp-1">{request.address}</span>
        </div>

        <div className="flex items-center gap-2">
          <UserRound className="w-4 h-4 text-[#0f55a7]" />
          <div className="flex flex-col">
            <span className="font-medium text-slate-700">
              {request.userName}
            </span>
            <span className="text-xs text-slate-400">
              {request.email}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default PickupRequestCard;