"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // 👈 Added useState
import { useForm } from "react-hook-form";
import axios from "axios";

type ProfileFormValues = {
  bio: string;
  location: string;
  interests: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // 👈 Loading state
  
  // 👈 Added "reset" to pre-fill form
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileFormValues>();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    
    // 👇 NEW: Fetch Profile Data
    if (session?.user) {
      const fetchProfile = async () => {
        try {
          // @ts-ignore
          const token = session.user.accessToken;
          const res = await axios.get("http://localhost:5000/api/users/profile", {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          // Pre-fill the form with database data
          const userData = res.data;
          reset({
            bio: userData.bio || "",
            location: userData.location || "",
            interests: userData.interests ? userData.interests.join(", ") : "",
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [status, router, session, reset]); // Added dependencies

  const onSubmit = async (data: ProfileFormValues) => {
    // ... (Your existing onSubmit code stays EXACTLY the same) ...
    // Copy-paste your previous onSubmit logic here
    if (!session?.user) return;
    try {
        const interestsArray = data.interests.split(",").map((s) => s.trim());
          
          // @ts-expect-error
          const token = session.user.accessToken;
        await axios.put("http://localhost:5000/api/users/profile", 
            { bio: data.bio, location: data.location, interests: interestsArray },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Profile Updated Successfully! 🌟");
    } catch (e) { console.error(e); alert("Failed"); }
  };

  if (status === "loading" || loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    // ... (Your JSX stays EXACTLY the same) ...
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* ... Keep the same JSX form ... */}
        {/* Just make sure to keep the <form> and <inputs> as they were */}
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Your Profile ✏️</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                 {/* ... Inputs ... */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea {...register("bio")} rows={4} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input {...register("location")} type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Interests</label>
                    <input {...register("interests")} type="text" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                 </div>
                 <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                    {isSubmitting ? "Saving..." : "Save Profile"}
                 </button>
            </form>
        </div>
    </div>
  );
}