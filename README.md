# Concert Ticket QR Code System - Frontend

A React-based frontend for the concert ticket QR system with QR scanning, admin dashboard, and user management.

## Features

- **User Authentication**: Login with JWT tokens
- **QR Scanner**: Real-time QR code scanning using camera
- **Admin Dashboard**: View concerts, tickets, and attendance stats
- **Ticket Management**: Create, track, and manage tickets
- **Refund Management**: Request and manage refunds
- **Ticket Transfers**: Transfer tickets between users
- **Attendance Tracking**: View real-time attendance data
- **Responsive Design**: Mobile-friendly Tailwind CSS UI

## Tech Stack

- **Framework**: React 18+
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **QR Scanning**: html5-qrcode
- **Notifications**: React-Toastify
- **Styling**: Tailwind CSS
- **TypeScript**: Full type support

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js         # Axios instance & API methods
│   │   └── endpoints.js      # API endpoint constants
│   ├── components/
│   │   └── QRScanner.jsx     # QR scanner component
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   ├── Scanner.jsx       # Scanner interface
│   │   └── AdminDashboard.jsx # Admin dashboard
│   ├── store/
│   │   └── index.js          # Zustand store
│   ├── App.jsx               # Main app component
│   ├── App.css               # App styles
│   ├── index.jsx             # Entry point
│   └── index.css             # Global styles
├── public/
│   └── index.html            # HTML template
├── package.json              # Dependencies
├── .env.example              # Environment template
├── Dockerfile                # Docker image
├── tailwind.config.js        # Tailwind config
├── tsconfig.json             # TypeScript config
└── README.md                # This file
```

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Local Installation

1. **Navigate to frontend**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env if API is not at localhost:8000
```

4. **Start development server**:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Using Docker

```bash
docker build -t concert-frontend .
docker run -p 3000:3000 -e REACT_APP_API_URL="http://localhost:8000" concert-frontend
```

## Pages

### Login Page (`/login`)
- Username and password form
- Redirects to dashboard on success
- Form validation

### Scanner Page (`/scanner`)
- Real-time QR code scanning
- Select scan type (attendance, entry check, sale confirmation)
- Optional location input
- Shows scanned ticket details
- Requires Scanner or Admin role

### Admin Dashboard (`/dashboard`)
- List all concerts
- Click to view concert details
- Display ticket information
- Show attendance statistics
- View sold vs. attended counts
- Attendance rate calculation

## API Integration

The frontend communicates with the backend via Axios:

### Authentication
```javascript
// Login
await authAPI.login(username, password);

// Register
await authAPI.register(username, email, password, role);

// Logout
authAPI.logout();
```

### Concerts
```javascript
// List concerts
const concerts = await concertAPI.list();

// Create concert (admin)
const concert = await concertAPI.create(concertData);

// Get concert details
const concert = await concertAPI.get(concertId);
```

### Tickets
```javascript
// Create ticket
const ticket = await ticketAPI.create(concertId);

// Get ticket
const ticket = await ticketAPI.get(ticketId);

// Get ticket by QR code
const ticket = await ticketAPI.getByNumber(ticketNumber);

// Mark ticket as sold
await ticketAPI.markSold(ticketId, buyerData);
```

### Scans
```javascript
// Record scan
await scanAPI.create({
  ticket_id: ticketId,
  scan_type: 'attendance',
  location: 'Gate 1',
});

// Get attendance stats
const stats = await scanAPI.getAttendance(concertId);
```

### Refunds
```javascript
// Request refund
await refundAPI.request({
  ticket_id: ticketId,
  reason: 'Cannot attend',
  amount: 100,
});

// Approve refund (admin)
await refundAPI.approve(refundId, notes);

// Reject refund (admin)
await refundAPI.reject(refundId, notes);
```

### Transfers
```javascript
// Initiate transfer
await transferAPI.initiate({
  ticket_id: ticketId,
  to_user_id: userId,
});

// Accept transfer
await transferAPI.accept(transferId);

// Reject transfer
await transferAPI.reject(transferId);

// Get pending transfers
const transfers = await transferAPI.pending();
```

## State Management

Using Zustand for lightweight state:

```javascript
// Auth store
useAuthStore((state) => ({
  user,
  token,
  isAuthenticated,
  setAuth,
  logout,
}));

// Concert store
useConcertStore((state) => ({
  concerts,
  selectedConcert,
  setConcerts,
  setSelectedConcert,
}));

// Ticket store
useTicketStore((state) => ({
  tickets,
  selectedTicket,
  setTickets,
  setSelectedTicket,
}));
```

## QR Scanner

The QR scanner component uses `html5-qrcode`:

```javascript
<QRScanner 
  onScan={(qrData) => handleScan(qrData)} 
  onError={(error) => handleError(error)}
/>
```

Features:
- Camera access (mobile & desktop)
- Real-time scanning
- Adjustable scanning box size
- Error handling

## Environment Variables

```env
# API base URL (default: http://localhost:8000)
REACT_APP_API_URL=http://localhost:8000
```

## Styling

Using Tailwind CSS for styling:
- Responsive design
- Dark/light mode support
- Component-based utilities
- Custom color scheme

## Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Development Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (⚠️ cannot be undone)
npm run eject
```

## Component Structure

### QRScanner Component
```jsx
<QRScanner 
  onScan={handleScan}
  onError={handleError}
/>
```

### Protected Routes
```jsx
<ProtectedRoute>
  <ScannerPage />
</ProtectedRoute>
```

## Error Handling

- Global axios interceptor catches 401 errors
- Redirects to login on auth failure
- Toast notifications for user feedback
- Error messages from API responses

## Security

- JWT tokens stored in localStorage
- HTTP-only cookie support ready
- CORS configured for backend
- Token included in all requests
- Auto-logout on 401 response

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Code splitting with React Router
- Lazy loading components
- Optimized QR scanning
- Minimal dependencies
- Fast initial load

## Troubleshooting

### Scanner not working
- Check camera permissions
- Ensure HTTPS on production
- Verify browser support

### API connection failed
- Check `REACT_APP_API_URL`
- Verify backend is running
- Check CORS configuration

### Authentication issues
- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Re-login

## Support

For issues, check the main README in the project root.
