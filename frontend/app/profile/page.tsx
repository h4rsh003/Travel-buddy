"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import useAxiosAuth from "@/hooks/useAxiosAuth";

// 1. Define Types
type UserProfile = {
    name: string;
    email: string;
    bio?: string;
    location?: string;
    interests?: string[];
};

type ProfileFormValues = {
    name: string;
    bio: string;
    location: string;
    interests: string;
};

export default function ProfilePage() {
    const { status } = useSession();
    const router = useRouter();
    const axiosAuth = useAxiosAuth();

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<UserProfile | null>(null);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileFormValues>();

    const fetchProfile = useCallback(async () => {
        if (status !== "authenticated") return;
        try {
            const res = await axiosAuth.get("/api/users/profile");

            setUserData(res.data);

            // Pre-fill form
            reset({
                name: res.data.name || "",
                bio: res.data.bio || "",
                location: res.data.location || "",
                interests: res.data.interests ? res.data.interests.join(", ") : "",
            });
        } catch (error) {
            console.error("❌ Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    }, [status, axiosAuth, reset]);

    // Fetch Profile Data
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }

        if (status === "authenticated") {
            fetchProfile();
        }
    }, [status, router, fetchProfile]);

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            const interestsArray = data.interests.split(",").map((s) => s.trim());

            // Use axiosAuth for updates too
            await axiosAuth.put("/api/users/profile", {
                name: data.name,
                bio: data.bio,
                location: data.location,
                interests: interestsArray
            });

            alert("Profile Updated Successfully!");
            setIsEditing(false);
            fetchProfile();
        } catch (e) {
            console.error(e);
            alert("Failed to update profile");
        }
    };

    if (status === "loading" || loading) return <p className="min-h-screen flex justify-center items-center bg-travel-bg"><p className="text-travel-text-muted animate-pulse">Loading Profile...</p></p>;

    return (
        <div className="min-h-screen bg-travel-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-travel-card rounded-2xl shadow-sm border border-travel-border overflow-hidden">

                <div className="bg-travel-accent h-32 relative">
                    <div className="absolute -bottom-10 left-8">
                        <div className="h-24 w-24 bg-travel-card rounded-full p-1 shadow-lg">
                            <div className="h-full w-full bg-travel-bg rounded-full flex items-center justify-center text-3xl font-bold text-travel-text">
                                {userData?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 px-8 pb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-travel-text">{userData?.name}</h1>
                            <p className="text-travel-text-muted text-sm">{userData?.email}</p>
                        </div>

                        <div className="flex mt-4 sm:mt-0 gap-3">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer
    ${isEditing
                                        ? "bg-travel-bg text-travel-text hover:bg-travel-card hover:text-travel-text border border-travel-border"
                                        : "bg-travel-accent text-white hover:bg-travel-accent-hover"
                                    }`
                                }
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>


                            {/* Logout Button */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="px-4 py-2 bg-red-50 text-red-600 cursor-pointer rounded-lg font-medium text-sm hover:bg-red-100 transition border border-red-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <hr className="my-6 border-travel-border" />

                    {isEditing ? (

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
                            <div>
                                <label className="block text-sm font-semibold text-travel-text mb-1">Full Name</label>
                                <input
                                    {...register("name")}
                                    type="text"
                                    className="w-full rounded-lg border border-travel-border p-3
                                        text-travel-text bg-travel-bg
                                        focus:ring-2 focus:ring-travel-accent focus:outline-none transition"
                                />                         </div>
                            <div>
                                <label className="block text-sm font-semibold text-travel-text mb-1">Bio</label>
                                <textarea
                                    {...register("bio")}
                                    rows={3}
                                    className="w-full rounded-lg border border-travel-border p-3
                                                text-travel-text bg-travel-bg
                                                focus:ring-2 focus:ring-travel-accent focus:outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-travel-text mb-1">Location</label>
                                <input {...register("location")} type="text"
                                    className="w-full rounded-lg border border-travel-border p-3
                                                text-travel-text bg-travel-bg
                                                focus:ring-2 focus:ring-travel-accent focus:outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-travel-text mb-1">Interests</label>
                                <input {...register("interests")} type="text"
                                    className="w-full rounded-lg border border-travel-border p-3
                                    text-travel-text bg-travel-bg
                                    focus:ring-2 focus:ring-travel-accent focus:outline-none transition" />
                                <p className="text-xs text-travel-text-muted mt-1">Separate with commas (e.g. Hiking, Music)</p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 cursor-pointer bg-travel-accent text-white rounded-lg hover:bg-travel-accent-hover font-medium transition disabled:opacity-70">
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    ) : (

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-travel-text-muted uppercase tracking-wider">About</h3>
                                <p className="text-travel-text mt-1 whitespace-pre-wrap">
                                    {userData?.bio || "No bio added yet."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-travel-text-muted uppercase tracking-wider">Location</h3>
                                    <p className="text-travel-text mt-1 font-medium">📍 {userData?.location || "Not set"}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-travel-text-muted uppercase tracking-wider">Interests</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {userData?.interests && userData.interests.length > 0 ? (
                                            userData.interests.map((tag: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-travel-bg border border-travel-border text-travel-text text-xs rounded-full font-medium">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-travel-text-muted text-sm">No interests added.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}