//PickupRequestDetails.jsx
import React, { useMemo } from "react";
import {CalendarDays, Clock3, Mail, MapPin, Package, CheckCircle2, Truck, UserRound, Hash, Wrench, Cpu, Weight, Recycle
} from "lucide-react";
import PickupStatusBadge from "./PickupStatusBadge";

const PickupRequestDetails = ({
  request,
  onAccept,
  onUpdateStatus,
  accepting,
  updating,
  mode,
}) => {
  const nextStatusOptions = useMemo(() => {
    if (!request) return [];
    if (request.status === "Accepted") return ["Collected", "Completed"];
    if (request.status === "Collected") return ["Completed"];
    return [];
  }, [request]);

  if (!request) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-8 min-h-[420px] flex items-center justify-center text-slate-500">
        Select a pickup request to view details.
      </div>
    );
  }

  // Function to open Google Maps with the request address
  const handleOpenMap = () => {
  const destination = encodeURIComponent(request.address);

  if (!navigator.geolocation) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${destination}`,
      "_blank"
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}&travelmode=driving`;

      window.open(url, "_blank");
    },
    (error) => {
      console.error("Geolocation error:", error);

      let message = "Unable to retrieve your location.";

      if (error.code === 1) {
        message = "Location permission denied. Opening destination only.";
      } else if (error.code === 2) {
        message = "Location unavailable. Opening destination only.";
      } else if (error.code === 3) {
        message = "Location request timed out. Opening destination only.";
      }

      alert(message);

      window.open(
        `https://www.google.com/maps/search/?api=1&query=${destination}`,
        "_blank"
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] px-6 py-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">{request.itemName}</h2>
            <p className="text-white/90 text-sm mt-1">Pickup Request Details</p>
          </div>
          <PickupStatusBadge status={request.status} />
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-4">
              Request Information
            </h3>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#0f55a7]" />
                <span>Request ID: {request._id}</span>
              </div>

              <div className="flex items-center gap-2">
                <UserRound className="w-4 h-4 text-[#0f55a7]" />
                <span>{request.userName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[#0f55a7]" />
                <span><strong>Quantity:</strong> {request.quantity}</span>
              </div>

              {/* ===== E-WASTE ITEM DETAILS ===== */}
              {request.condition && (
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-[#0f55a7]" />
                  <span><strong>Condition:</strong> {request.condition}</span>
                </div>
              )}

              {request.age !== null && request.age !== undefined && (
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-[#0f55a7]" />
                  <span><strong>Age:</strong> {request.age} years</span>
                </div>
              )}

              {request.weight !== null && request.weight !== undefined && (
                <div className="flex items-center gap-3">
                  <Weight className="w-4 h-4 text-[#0f55a7]" />
                  <span><strong>Weight:</strong> {request.weight} kg</span>
                </div>
              )}

              {request.disposalType && (
                <div className="flex items-center gap-3">
                  <Recycle className="w-4 h-4 text-[#0f55a7]" />
                  <span><strong>Disposal:</strong> {request.disposalType}</span>
                </div>
              )}


              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#0f55a7]" />
                <span><strong>Address:</strong> {request.address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0f55a7]" />
                <span><strong>Email:</strong> {request.email}</span>
              </div>

              

              <div className="flex items-center gap-3">
                <Clock3 className="w-4 h-4 text-[#0f55a7]" />
                <span>
                  <strong>Created:</strong>{" "}
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* View Location Button */}
            <div className="mt-5">
              <button onClick={handleOpenMap}
              className="w-full px-5 py-3 rounded-xl border border-[#0f55a7] text-[#0f55a7] hover:bg-[#0f55a7]/10 transition font-medium"
              >
                View Location
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-4">
              Recycler Actions
            </h3>

            {/* Pending → Accept */}
            {mode === "pending" && request.status === "Pending" && (
              <button
                onClick={() => onAccept(request._id)}
                disabled={accepting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-[#0f55a7] to-[#4db848] hover:opacity-95 transition disabled:opacity-60"
              >
                <Truck className="w-4 h-4" />
                {accepting ? "Accepting..." : "Accept Request"}
              </button>
            )}

            {/* Accepted → Collected */}
            {mode === "accepted" && request.status === "Accepted" && (
              <button
                onClick={() => onUpdateStatus(request._id, "Collected")}
                disabled={updating}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-[#0f55a7] to-[#4db848] hover:opacity-95 transition disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                {updating ? "Updating..." : "Collected"}
              </button>
            )}

            {/* Collected → Completed */}
            {mode === "collected" && request.status === "Collected" && (
              <button
                onClick={() => onUpdateStatus(request._id, "Completed")}
                disabled={updating}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-[#0f55a7] to-[#4db848] hover:opacity-95 transition disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                {updating ? "Updating..." : "Completed"}
              </button>
            )}

            {request.status === "Completed" && (
              <div className="rounded-2xl bg-green-50 border border-green-200 text-green-700 px-4 py-4 text-sm font-medium">
                This pickup request has been completed.
              </div>
            )}

            {request.acceptedAt && (
              <div className="mt-5 text-sm text-slate-600">
                <strong>Accepted At:</strong>{" "}
                {new Date(request.acceptedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupRequestDetails;