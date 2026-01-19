import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';

export const QRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          onScan(data);
          setScanning(false);
          scanner.clear();
        } catch (error) {
          toast.error('Invalid QR code format');
          onError?.(error);
        }
      },
      (error) => {
        // Ignore scanning errors
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanning, onScan, onError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" style={{ width: '100%' }} />
      <button
        onClick={() => setScanning(!scanning)}
        className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {scanning ? 'Stop Scanner' : 'Start Scanner'}
      </button>
    </div>
  );
};

export default QRScanner;
