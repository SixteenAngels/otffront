import React, { useState, useEffect } from 'react';
import { QRScanner } from '../components/QRScanner';
import { scanAPI, ticketAPI, concertAPI } from '../api/client';
import { useAuthStore } from '../store';
import { toast } from 'react-toastify';

export const ScannerPage = () => {
  const [scanType, setScanType] = useState('attendance');
  const [location, setLocation] = useState('');
  const [scannedTicket, setScannedTicket] = useState(null);
  const [scannedConcert, setScannedConcert] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const handleScan = async (qrData) => {
    try {
      // First get the ticket details
      const ticket = await ticketAPI.getByNumber(qrData.ticket_number);
      setScannedTicket(ticket);
      
      // Check if user is a verification user
      const isVerifier = user?.role === 'scanner'; // Both sales and verify have 'scanner' role
      const userType = user?.username?.startsWith('verify') ? 'verify' : 'sales';
      
      // If verification user trying to scan already-verified ticket, reject
      if (userType === 'verify' && ticket.status === 'verified') {
        toast.error('❌ Ticket already verified - cannot rescan!');
        setScannedTicket(null);
        return;
      }
      
      // Then get the concert details
      try {
        const concert = await concertAPI.get(ticket.concert_id);
        setScannedConcert(concert);
      } catch (err) {
        // Concert fetch might fail, but ticket info is still valid
        setScannedConcert(null);
      }

      // Record the scan
      setLoading(true);
      await scanAPI.create({
        ticket_id: ticket.id,
        scan_type: scanType,
        location: location || undefined,
      });

      // Auto-mark as verified if verify user scans it
      if (userType === 'verify') {
        toast.success(`✓ Ticket verified & locked (no re-scan allowed)`);
      } else {
        toast.success(`Ticket scanned - Status: ${scanType}`);
      }
      
      setTimeout(() => {
        setScannedTicket(null);
        setScannedConcert(null);
      }, 4000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Scanner</h1>
        <p className="text-gray-600 mb-8">
          {user?.username?.startsWith('verify') 
            ? '🔒 Verification Mode - Each ticket can only be scanned ONCE' 
            : '📝 Sales Mode - Multiple scans allowed per ticket'}
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan Type
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="attendance">Attendance Check</option>
              <option value="entry_check">Entry Check</option>
              <option value="sale_confirmation">Sale Confirmation</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Gate 1, Entrance A, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <QRScanner onScan={handleScan} />

          {scannedTicket && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                ✓ Ticket Scanned Successfully
              </h3>
              
              {scannedConcert && (
                <div className="mb-4 pb-4 border-b border-green-200">
                  <p className="text-green-900 font-bold text-base">
                    {scannedConcert.name}
                  </p>
                  <p className="text-green-800 text-sm">
                    <strong>Venue:</strong> {scannedConcert.venue}
                  </p>
                  <p className="text-green-800 text-sm">
                    <strong>Date:</strong> {new Date(scannedConcert.date).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="space-y-1 text-sm">
                <p className="text-green-800">
                  <strong>Ticket:</strong> {scannedTicket.ticket_number}
                </p>
                <p className="text-green-800">
                  <strong>Buyer:</strong> {scannedTicket.buyer_name || 'N/A'}
                </p>
                <p className="text-green-800">
                  <strong>Email:</strong> {scannedTicket.buyer_email || 'N/A'}
                </p>
                <p className={`font-semibold ${scannedTicket.status === 'verified' ? 'text-red-700' : 'text-green-800'}`}>
                  <strong>Status:</strong> 
                  <span className="ml-2 px-2 py-1 rounded text-xs font-mono" style={{
                    backgroundColor: scannedTicket.status === 'verified' ? '#fee2e2' : '#dcfce7',
                    color: scannedTicket.status === 'verified' ? '#7f1d1d' : '#166534'
                  }}>
                    {scannedTicket.status}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
