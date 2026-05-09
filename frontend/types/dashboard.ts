export type JoinRequest = {
    id: number;
    status: "pending" | "accepted" | "rejected";
    user: {
        id: number;
        name: string;
        email: string;
    };
};

export type Trip = {
    id: number;
    destination: {
        name: string;
        country: string;
        formattedAddress?: string;
        lat: number;
        lon: number;
    } | string;
    startDate: string;
    endDate: string;
    joinRequests: JoinRequest[];
};

export type JoinedTrip = {
    id: number;
    status: "pending" | "accepted" | "rejected";
    trip: {
        id: number;
        destination: {
            name: string;
            country: string;
        } | string;
        startDate: string;
        endDate: string;
        user: {
            name: string;
            email: string;
        };
    };
};