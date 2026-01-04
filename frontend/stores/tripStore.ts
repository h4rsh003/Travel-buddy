import { create } from 'zustand';
import axios from 'axios';

type Trip = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  user: { name: string; email: string };
};

type FilterType = 'ALL' | 'UPCOMING' | 'STARTED' | 'COMPLETED';

interface TripState {
  trips: Trip[];
  loading: boolean;
  searchQuery: string;
  filter: FilterType;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterType) => void;
  fetchTrips: () => Promise<void>;
  
  // Getters (Selectors can be derived in component, but helper functions are nice)
  getFilteredTrips: () => Trip[];
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  loading: false,
  searchQuery: "",
  filter: "ALL",

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilter: (filter: FilterType) => set({ filter }),

  fetchTrips: async () => {
    if (get().trips.length > 0) return; 

    set({ loading: true });
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips`);
      set({ trips: res.data, loading: false });
    } catch (error) {
      console.error("Error fetching trips:", error);
      set({ loading: false });
    }
  },

  getFilteredTrips: () => {
    const { trips, searchQuery, filter } = get();
    
    const getTripStatus = (start: string, end: string) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const startDate = new Date(start);
      startDate.setHours(0,0,0,0);
      const endDate = new Date(end);
      endDate.setHours(0,0,0,0);

      if (endDate < today) return 'COMPLETED';
      if (startDate <= today && endDate >= today) return 'STARTED';
      return 'UPCOMING';
    };

    return trips.filter((trip: Trip) => {
      const matchesSearch = 
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (filter === 'ALL') return true;
      return getTripStatus(trip.startDate, trip.endDate) === filter;
    });
  }
}));