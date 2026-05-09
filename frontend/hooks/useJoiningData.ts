import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";
import { JoinedTrip } from "@/types/dashboard";

export function useJoiningData() {
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();
    const [joinedTrips, setJoinedTrips] = useState<JoinedTrip[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJoinedTrips = useCallback(async () => {
        if (status !== "authenticated") return;
        try {
            const res = await axiosAuth.get("/api/requests/my-requests");
            setJoinedTrips(res.data);
        } catch (error) {
            console.error("Error fetching joined trips:", error);
            toast.error("Failed to load joined trips");
        } finally {
            setLoading(false);
        }
    }, [status, axiosAuth]);

    useEffect(() => {
        if (status === "authenticated") fetchJoinedTrips();
    }, [status, fetchJoinedTrips]);

    return { joinedTrips, loading };
}