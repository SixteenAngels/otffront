const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const endpoints = {
  // Auth
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
  },
  
  // Concerts
  concerts: {
    list: `${API_BASE_URL}/api/concerts/`,
    create: `${API_BASE_URL}/api/concerts/`,
    get: (id) => `${API_BASE_URL}/api/concerts/${id}`,
  },
  
  // Tickets
  tickets: {
    list: `${API_BASE_URL}/api/tickets/`,
    create: (concertId) => `${API_BASE_URL}/api/tickets/create/${concertId}`,
    batchCreate: (concertId) => `${API_BASE_URL}/api/tickets/batch/create/${concertId}`,
    get: (id) => `${API_BASE_URL}/api/tickets/${id}`,
    getQRCode: (id) => `${API_BASE_URL}/api/tickets/${id}/qr-code`,
    getByNumber: (number) => `${API_BASE_URL}/api/tickets/number/${number}`,
    markSold: (id) => `${API_BASE_URL}/api/tickets/${id}/mark-sold`,
    listConcert: (concertId) => `${API_BASE_URL}/api/tickets/concert/${concertId}`,
  },
  
  // Scans
  scans: {
    create: `${API_BASE_URL}/api/scans/`,
    getTicketScans: (ticketId) => `${API_BASE_URL}/api/scans/ticket/${ticketId}`,
    getAttendance: (concertId) => `${API_BASE_URL}/api/scans/concert/${concertId}/attendance`,
  },
  
  // Transfers
  transfers: {
    initiate: `${API_BASE_URL}/api/transfers/initiate`,
    pending: `${API_BASE_URL}/api/transfers/pending`,
    get: (id) => `${API_BASE_URL}/api/transfers/${id}`,
    accept: (id) => `${API_BASE_URL}/api/transfers/${id}/accept`,
    reject: (id) => `${API_BASE_URL}/api/transfers/${id}/reject`,
  },
};

export default endpoints;
