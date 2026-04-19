//RecyclerPickupsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PickupRequestCard from "../../components/pickup/PickupRequestCard";
import PickupRequestDetails from "../../components/pickup/PickupRequestDetails";
import {
  acceptPickupRequest,
  getAllPickupRequests,
  getPickupRequestById,
  updatePickupRequestStatus,
} from "../../services/api";

const RecyclerPickupsPage = ({ mode = "pending" }) => {
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Validate allowed modes to avoid unexpected filtering states
  const validModes = ["pending", "accepted", "collected", "completed"];
  const safeMode = validModes.includes(mode) ? mode : "pending";

  const fetchRequests = async () => {
    try {
      setLoadingList(true);

      const response = await getAllPickupRequests();

      // Validation: ensure response data is an array
      const allData = Array.isArray(response?.data) ? response.data : [];

      let filteredByMode = [];

      if (safeMode === "pending") {
        filteredByMode = allData.filter((item) => item?.status === "Pending");
      } else if (safeMode === "accepted") {
        filteredByMode = allData.filter((item) => item?.status === "Accepted");
      } else if (safeMode === "collected") {
        filteredByMode = allData.filter((item) => item?.status === "Collected");
      } else if (safeMode === "completed") {
        filteredByMode = allData.filter((item) => item?.status === "Completed");
      }

      setRequests(filteredByMode);

      if (filteredByMode.length > 0) {
        const keepSelected = filteredByMode.find(
          (item) => item?._id === selectedId
        );
        const nextId = keepSelected ? selectedId : filteredByMode[0]?._id || null;
        setSelectedId(nextId);
      } else {
        setSelectedId(null);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Failed to fetch pickup requests:", error);
      setRequests([]);
      setSelectedId(null);
      setSelectedRequest(null);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchRequestDetails = async (id) => {
    // Validation: do not call API with invalid id
    if (!id || typeof id !== "string") return;

    try {
      setLoadingDetails(true);
      const response = await getPickupRequestById(id);

      // Validation: ensure object response
      const data = response?.data;
      if (!data || typeof data !== "object") {
        setSelectedRequest(null);
        return;
      }

      setSelectedRequest(data);
    } catch (error) {
      console.error("Failed to fetch pickup request details:", error);
      setSelectedRequest(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [safeMode]);

  useEffect(() => {
    if (selectedId) {
      fetchRequestDetails(selectedId);
    }
  }, [selectedId]);

  const filteredRequests = useMemo(() => {
    // Validation: safe normalize search input
    const keyword = String(searchTerm || "").trim().toLowerCase();

    // If search is empty, return original list
    if (!keyword) return requests;

    return requests.filter((item) => {
      const itemName = String(item?.itemName || "").toLowerCase();
      const address = String(item?.address || "").toLowerCase();
      const email = String(item?.email || "").toLowerCase();
      const status = String(item?.status || "").toLowerCase();

      return (
        itemName.includes(keyword) ||
        address.includes(keyword) ||
        email.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [requests, searchTerm]);

  const handleAccept = async (id) => {
    // Validation: prevent duplicate actions and invalid ids
    if (accepting || updating) return;
    if (!id || typeof id !== "string") {
      alert("Invalid request id");
      return;
    }

    try {
      setAccepting(true);
      await acceptPickupRequest(id);

      setRequests((prev) => prev.filter((item) => item?._id !== id));
      setSelectedId(null);
      setSelectedRequest(null);
      setShowModal(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to accept request");
    } finally {
      setAccepting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    // Validation: prevent duplicate actions
    if (accepting || updating) return;

    // Validation: request id + allowed statuses only
    const allowedStatuses = ["Collected", "Completed"];
    if (!id || typeof id !== "string") {
      alert("Invalid request id");
      return;
    }
    if (!allowedStatuses.includes(status)) {
      alert("Invalid status update");
      return;
    }

    try {
      setUpdating(true);
      await updatePickupRequestStatus(id, status);

      setRequests((prev) => prev.filter((item) => item?._id !== id));
      setSelectedId(null);
      setSelectedRequest(null);
      setShowModal(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const pageTitle =
    safeMode === "pending"
      ? "Pending Pickup Requests"
      : safeMode === "accepted"
      ? "Accepted Pickup Requests"
      : safeMode === "collected"
      ? "Collected Pickup Requests"
      : "Completed Pickup Requests";

  const pageDescription =
    safeMode === "pending"
      ? "View pending customer pickup requests ready to be accepted."
      : safeMode === "accepted"
      ? "View accepted pickup requests and mark them as collected."
      : safeMode === "collected"
      ? "View collected pickup requests and mark them as completed."
      : "View completed pickup requests.";

  return (
    <main className="flex-1 bg-[#f5f7fb]">
      <section className="bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
          <p className="uppercase tracking-[0.25em] text-xs text-white/80 mb-3">
            Recycler Dashboard
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">
            Pickup Requests
          </h1>
          <p className="text-white/90 max-w-2xl text-sm md:text-base">
            Manage all customer pickup requests, review request details, and track your
            accepted collections.
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{pageTitle}</h2>
            <p className="text-sm text-slate-500 mt-1">{pageDescription}</p>
          </div>

          <div className="relative w-full lg:w-[320px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => {
                // Validation: safely store input as string and limit excessive length
                const value = String(e.target.value || "").slice(0, 100);
                setSearchTerm(value);
              }}
              className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#0f55a7]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            {loadingList ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center text-slate-500">
                Loading pickup requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center text-slate-500">
                No pickup requests found.
              </div>
            ) : (
              filteredRequests.map((request) => (
                <PickupRequestCard
                  key={request?._id}
                  request={request}
                  selected={selectedId === request?._id}
                  onClick={() => {
                    // Validation: ignore invalid card data
                    if (!request?._id) return;
                    setSelectedId(request._id);
                    setShowModal(true);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => {
            // Validation: do not allow accidental close during active action
            if (accepting || updating) return;
            setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetails ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center text-slate-500 min-h-[420px] shadow-xl">
                Loading request details...
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    // Validation: do not close modal while action is processing
                    if (accepting || updating) return;
                    setShowModal(false);
                  }}
                  className="absolute -top-3 -right-3 z-10 bg-white text-slate-700 border border-slate-200 rounded-full w-10 h-10 shadow hover:bg-slate-50"
                >
                  ×
                </button>

                <PickupRequestDetails
                  request={selectedRequest}
                  onAccept={handleAccept}
                  onUpdateStatus={handleUpdateStatus}
                  accepting={accepting}
                  updating={updating}
                  mode={safeMode}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default RecyclerPickupsPage;