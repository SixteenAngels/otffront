import axios from 'axios';
import { endpoints } from './endpoints';

const apiClient = axios.create();

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (username, email, password, role = 'viewer') => {
    const response = await apiClient.post(endpoints.auth.register, {
      username,
      email,
      password,
      role,
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await apiClient.post(endpoints.auth.login, {
      username,
      password,
    });
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const concertAPI = {
  list: async () => {
    const response = await apiClient.get(endpoints.concerts.list);
    return response.data;
  },

  create: async (concertData) => {
    const response = await apiClient.post(endpoints.concerts.create, concertData);
    return response.data;
  },

  get: async (id) => {
    const response = await apiClient.get(endpoints.concerts.get(id));
    return response.data;
  },

  update: async (id, concertData) => {
    const response = await apiClient.put(`${endpoints.concerts.list}${id}`, concertData);
    return response.data;
  },
};

export const ticketAPI = {
  create: async (concertId) => {
    const response = await apiClient.post(endpoints.tickets.create(concertId));
    return response.data;
  },

  createBatch: async (concertId, quantity) => {
    const response = await apiClient.post(endpoints.tickets.batchCreate(concertId), {
      quantity,
    });
    return response.data;
  },

  get: async (id) => {
    const response = await apiClient.get(endpoints.tickets.get(id));
    return response.data;
  },

  getByNumber: async (ticketNumber) => {
    const response = await apiClient.get(endpoints.tickets.getByNumber(ticketNumber));
    return response.data;
  },

  markSold: async (id, buyerData) => {
    const response = await apiClient.post(endpoints.tickets.markSold(id), buyerData);
    return response.data;
  },

  listConcert: async (concertId) => {
    const response = await apiClient.get(endpoints.tickets.listConcert(concertId));
    return response.data;
  },

  getQRCode: async (ticketId) => {
    const response = await apiClient.get(endpoints.tickets.getQRCode(ticketId));
    return response.data;
  },
};

export const scanAPI = {
  create: async (scanData) => {
    const response = await apiClient.post(endpoints.scans.create, scanData);
    return response.data;
  },

  getTicketScans: async (ticketId) => {
    const response = await apiClient.get(endpoints.scans.getTicketScans(ticketId));
    return response.data;
  },

  getAttendance: async (concertId) => {
    const response = await apiClient.get(endpoints.scans.getAttendance(concertId));
    return response.data;
  },
};

export const transferAPI = {
  initiate: async (transferData) => {
    const response = await apiClient.post(endpoints.transfers.initiate, transferData);
    return response.data;
  },

  pending: async () => {
    const response = await apiClient.get(endpoints.transfers.pending);
    return response.data;
  },

  get: async (id) => {
    const response = await apiClient.get(endpoints.transfers.get(id));
    return response.data;
  },

  accept: async (id) => {
    const response = await apiClient.post(endpoints.transfers.accept(id));
    return response.data;
  },

  reject: async (id) => {
    const response = await apiClient.post(endpoints.transfers.reject(id));
    return response.data;
  },
};

export default apiClient;
