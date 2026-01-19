import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => set({ user, token, isAuthenticated: !!token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));

export const useConcertStore = create((set) => ({
  concerts: [],
  selectedConcert: null,
  setConcerts: (concerts) => set({ concerts }),
  setSelectedConcert: (concert) => set({ selectedConcert: concert }),
}));

export const useTicketStore = create((set) => ({
  tickets: [],
  selectedTicket: null,
  setTickets: (tickets) => set({ tickets }),
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
}));
