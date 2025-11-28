"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

// 1. Updated Type to include Name
type UserProfile = {
  name: string;
  email: string;
  bio?: string;
  location?: string;
  interests?: string[];
};

type ProfileFormValues = {
  name: string; // 👈 Added Name
  bio: string;
  location: string;
  interests: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileFormValues>();

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;
    try {
      // @ts-expect-error -- Access token is not yet typed in NextAuth
      let token = session.user.accessToken;
      if (typeof token === "string") token = token.replace(/"/g, "");

      const res = await axios.get("process.env.NEXT_PUBLIC_BACKEND_URL/api/users/profile", {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserData(res.data);
      
      // Pre-fill form (Including Name now)
      reset({
        name: res.data.name || "", // 👈 Pre-fill Name
        bio: res.data.bio || "",
        location: res.data.location || "",
        interests: res.data.interests ? res.data.interests.join(", ") : "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [session, reset]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    
    if (session?.user) {
      fetchProfile();
    }
  }, [status, router, session, fetchProfile]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!session?.user) return;
    try {
        const interestsArray = data.interests.split(",").map((s) => s.trim());
          
        // @ts-expect-error -- Access token fix
        let token = session.user.accessToken;
        if (typeof token === "string") token = token.replace(/"/g, "");

        await axios.put("process.env.NEXT_PUBLIC_BACKEND_URL/api/users/profile", 
            { 
              name: data.name, // 👈 Send Name to Backend
              bio: data.bio, 
              location: data.location, 
              interests: interestsArray 
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert("Profile Updated Successfully! 🌟");
        setIsEditing(false); 
        fetchProfile(); // Refresh data to show new name immediately
    } catch (e) { 
        console.error(e); 
        alert("Failed to update profile"); 
    }
  };

  if (status === "loading" || loading) return <p className="text-center mt-10">Loading Profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Header / Cover Area */}
            <div className="bg-blue-600 h-32 relative">
                <div className="absolute -bottom-10 left-8">
                    <div className="h-24 w-24 bg-white rounded-full p-1 shadow-lg">
                        <div className="h-full w-full bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
                             {userData?.name?.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 px-8 pb-8">
                <div className="flex justify-between items-start">
                    <div>
                        {/* Show Name */}
                        <h1 className="text-2xl font-bold text-gray-900">{userData?.name}</h1>
                        <p className="text-gray-500 text-sm">{userData?.email}</p>
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                            isEditing 
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                </div>

                <hr className="my-6 border-gray-100"/>

                {isEditing ? (
                    // 🟢 EDIT MODE
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
                         {/* 👇 NEW: Name Input Field */}
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input 
                              {...register("name")} 
                              type="text" 
                              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                            />
                         </div>

                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                            <textarea {...register("bio")} rows={3} className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                            <input {...register("location")} type="text" className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Interests</label>
                            <input {...register("interests")} type="text" className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                            <p className="text-xs text-gray-500 mt-1">Separate with commas (e.g. Hiking, Music)</p>
                         </div>
                         <div className="flex justify-end pt-2">
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:bg-green-400">
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                         </div>
                    </form>
                ) : (
                    // 🔵 VIEW MODE
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">About</h3>
                            <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                                {userData?.bio || "No bio added yet."}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Location</h3>
                                <p className="text-gray-700 mt-1 font-medium">📍 {userData?.location || "Not set"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Interests</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {userData?.interests && userData.interests.length > 0 ? (
                                        userData.interests.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No interests added.</span>
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