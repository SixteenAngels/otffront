import React, { useEffect, useState } from 'react';
import { concertAPI, ticketAPI, scanAPI } from '../api/client';
import { toast } from 'react-toastify';

export const AdminDashboard = () => {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState(500);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [viewMode, setViewMode] = useState('qr');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConcert, setEditingConcert] = useState(null);
  const [useDevQR, setUseDevQR] = useState(false);
  const [newConcert, setNewConcert] = useState({
    name: '',
    venue: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      setLoading(true);
      const data = await concertAPI.list();
      setConcerts(data);
    } catch (error) {
      toast.error('Failed to load concerts');
    } finally {
      setLoading(false);
    }
  };

  const handleConcertSelect = async (concert) => {
    setSelectedConcert(concert);
    try {
      setLoading(true);
      const ticketsData = await ticketAPI.listConcert(concert.id);
      setTickets(ticketsData);
      
      // Try to get attendance, but don't fail if it doesn't work
      try {
        const attendanceData = await scanAPI.getAttendance(concert.id);
        setAttendance(attendanceData);
      } catch {
        // Set default attendance if endpoint fails
        setAttendance({
          total_sold: 0,
          total_attended: 0,
          attendance_rate: '0%'
        });
      }
    } catch (error) {
      toast.error('Failed to load concert details');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (batchQuantity <= 0 || batchQuantity > 5000) {
      toast.error('Quantity must be between 1 and 5000');
      return;
    }

    try {
      setLoading(true);
      const result = await ticketAPI.createBatch(selectedConcert.id, batchQuantity);
      toast.success(`Generated ${result.created_count} QR codes!`);
      setShowBatchForm(false);
      setBatchQuantity(500);
      // Refresh the tickets list
      await handleConcertSelect(selectedConcert);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllQRCodes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/tickets/concert/${selectedConcert.id}/qr-codes/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-codes-${selectedConcert.name}-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR codes downloaded!');
    } catch (error) {
      toast.error('Failed to download QR codes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSingleQR = async (ticket) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/tickets/${ticket.id}/download-qr`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${ticket.ticket_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded QR for ${ticket.ticket_number}`);
    } catch (error) {
      toast.error('Failed to download QR code');
      console.error(error);
    }
  };

  const deleteTicket = async (ticket) => {
    if (!window.confirm(`Delete ticket ${ticket.ticket_number}? This cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/tickets/${ticket.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Delete failed');
      }

      toast.success(`Ticket ${ticket.ticket_number} deleted`);
      await handleConcertSelect(selectedConcert);
    } catch (error) {
      toast.error('Failed to delete ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConcert = async (concert) => {
    if (!window.confirm(`Delete concert "${concert.name}"? This will delete all associated tickets and cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/concerts/${concert.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Delete failed');
      }

      toast.success(`Concert "${concert.name}" deleted`);
      if (selectedConcert?.id === concert.id) {
        setSelectedConcert(null);
      }
      await fetchConcerts();
    } catch (error) {
      toast.error('Failed to delete concert');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConcert = async (e) => {
    e.preventDefault();
    if (!newConcert.name || !newConcert.venue || !newConcert.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const concert = await concertAPI.create(newConcert);
      toast.success(`Concert "${concert.name}" created successfully!`);
      setShowCreateForm(false);
      setNewConcert({
        name: '',
        venue: '',
        date: '',
        description: '',
      });
      await fetchConcerts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create concert');
    } finally {
      setLoading(false);
    }
  };

  const handleEditConcert = async (e) => {
    e.preventDefault();
    if (!editingConcert.name || !editingConcert.venue || !editingConcert.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const updated = await concertAPI.update(editingConcert.id, editingConcert);
      toast.success(`Concert "${updated.name}" updated successfully!`);
      setEditingConcert(null);
      await handleConcertSelect(updated);
      await fetchConcerts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update concert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {showCreateForm ? 'Cancel' : '+ New Concert'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Create New Concert</h2>
            <form onSubmit={handleCreateConcert}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concert Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newConcert.name}
                    onChange={(e) =>
                      setNewConcert({ ...newConcert, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., Summer Festival 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={newConcert.venue}
                    onChange={(e) =>
                      setNewConcert({ ...newConcert, venue: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., Madison Square Garden"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newConcert.date}
                    onChange={(e) =>
                      setNewConcert({ ...newConcert, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newConcert.description}
                    onChange={(e) =>
                      setNewConcert({
                        ...newConcert,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="Concert description"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded font-medium"
              >
                {loading ? 'Creating...' : 'Create Concert'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {concerts.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500 text-lg">
                No concerts yet. Click "+ New Concert" to create one.
              </p>
            </div>
          ) : (
            concerts.map((concert) => (
              <div
                key={concert.id}
                onClick={() => handleConcertSelect(concert)}
                className={`p-4 rounded-lg cursor-pointer relative group ${
                  selectedConcert?.id === concert.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{concert.name}</h3>
                    <p className="text-gray-600 text-sm">{concert.venue}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(concert.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingConcert(concert);
                      }}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConcert(concert);
                      }}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedConcert && attendance && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedConcert.name}</h2>
              <button
                onClick={() => setShowBatchForm(!showBatchForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                {showBatchForm ? 'Cancel' : 'Generate QR Codes'}
              </button>
            </div>

            {showBatchForm && (
              <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-200">
                <h3 className="font-semibold text-lg mb-4">Generate QR Codes for {selectedConcert.name}</h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={batchQuantity}
                      onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleBatchGenerate}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded font-medium whitespace-nowrap"
                  >
                    {loading ? `Generating ${batchQuantity} tickets...` : `Generate ${batchQuantity} Tickets`}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Total Sold</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attendance.total_sold}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Attended</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendance.total_attended}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {attendance.attendance_rate}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setViewMode('qr')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'qr'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                QR Codes Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setUseDevQR(!useDevQR)}
                className={`px-4 py-2 rounded font-semibold ${
                  useDevQR
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                }`}
              >
                {useDevQR ? '🎲 Dev QR ON' : 'Use Dev QR'}
              </button>
              {tickets.length > 0 && !useDevQR && (
                <button
                  onClick={() => downloadAllQRCodes()}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white"
                >
                  Download All QR Codes (ZIP)
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Total Sold</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attendance.total_sold}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Attended</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendance.total_attended}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {attendance.attendance_rate}
                </p>
              </div>
            </div>

            {viewMode === 'qr' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-xl transition"
                  >
                    {useDevQR ? (
                      <img
                        src="http://127.0.0.1:8000/api/tickets/dev/random-qr?size=29&module_size=10"
                        alt={`Dev QR Code ${ticket.ticket_number}`}
                        className="w-full h-auto mb-3 border-2 border-orange-300 rounded"
                      />
                    ) : ticket.qr_code_data ? (
                      <img
                        src={`data:image/png;base64,${ticket.qr_code_data}`}
                        alt={`QR Code ${ticket.ticket_number}`}
                        className="w-full h-auto mb-3 border-2 border-gray-300 rounded"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No QR</span>
                      </div>
                    )}
                    <p className="font-mono text-sm font-bold text-gray-800 break-all">
                      {ticket.ticket_number}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">ID: {ticket.id}</p>
                    <p
                      className={`text-xs mt-2 px-2 py-1 rounded ${
                        ticket.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'sold_confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ticket.status}
                    </p>
                    {!useDevQR && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => downloadSingleQR(ticket)}
                          className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                          title="Download QR as PNG"
                        >
                          📥 Download
                        </button>
                        <button
                          onClick={() => deleteTicket(ticket)}
                          className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                          title="Delete this ticket"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Ticket #</th>
                      <th className="px-4 py-2 text-left">Buyer</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Sold At</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-t">
                        <td className="px-4 py-2 font-bold text-gray-800">
                          {ticket.id}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {ticket.ticket_number}
                        </td>
                        <td className="px-4 py-2">{ticket.buyer_name || '-'}</td>
                        <td className="px-4 py-2">${ticket.price || '-'}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              ticket.status === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : ticket.status === 'sold_confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600">
                          {ticket.sold_at
                            ? new Date(ticket.sold_at).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadSingleQR(ticket)}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                              title="Download QR as PNG"
                            >
                              📥
                            </button>
                            <button
                              onClick={() => deleteTicket(ticket)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                              title="Delete ticket"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {editingConcert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Edit Concert</h2>
              <form onSubmit={handleEditConcert}>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Concert Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingConcert.name}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue
                    </label>
                    <input
                      type="text"
                      required
                      value={editingConcert.venue}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, venue: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingConcert.date}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingConcert.description}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingConcert(null)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

