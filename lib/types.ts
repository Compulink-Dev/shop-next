// /lib/types.ts
export type AuthUser = {
    _id: string;
    email: string;
    name: string;
    isAdmin: boolean;
};

export type Context = {
    params: { id: string }; // Modify according to your route parameters
    user?: AuthUser; // Optional user property to hold authenticated user info
};