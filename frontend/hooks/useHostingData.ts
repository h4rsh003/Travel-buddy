import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";
import { Trip } from "@/types/dashboard";

export function useHostingData() {
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHostedTrips = useCallback(async () => {
        if (status !== "authenticated") return;
        try {
            const res = await axiosAuth.get("/api/trips/user/me");
            setTrips(res.data);
        } catch (error) {
            console.error("Error fetching hosted trips:", error);
            toast.error("Failed to load hosted trips");
        } finally {
            setLoading(false);
        }
    }, [status, axiosAuth]);

    useEffect(() => {
        if (status === "authenticated") fetchHostedTrips();
    }, [status, fetchHostedTrips]);

    const handleAction = async (requestId: number, action: "accepted" | "rejected") => {
        const loadingToast = toast.loading(`Processing...`);
        try {
            await axiosAuth.patch(`/api/requests/${requestId}/${action}`);
            toast.dismiss(loadingToast);
            toast.success(action === "accepted" ? "Request Accepted!" : "Request Rejected.");
            fetchHostedTrips();
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Action failed.");
        }
    };

    const handleDeleteTrip = async (tripId: number) => {
        const loadingToast = toast.loading("Deleting trip...");
        try {
            await axiosAuth.delete(`/api/trips/${tripId}`);
            toast.dismiss(loadingToast);
            toast.success("Trip Deleted Successfully.");
            fetchHostedTrips(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Failed to delete trip.");
        }
    };

    return { trips, loading, handleAction, handleDeleteTrip };
}