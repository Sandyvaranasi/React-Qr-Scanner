import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

const QrScanner: React.FC = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const qrRegionId = "qr-reader";

  const startScanning = async () => {
    try {
      setIsLoadingCamera(true);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(qrRegionId);
      }

      if (scannerRef.current.getState() === Html5QrcodeScannerState.NOT_STARTED) {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await scannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              setScannedResult(decodedText);
              stopScanning();
            },
            () => {} // Optional error callback
          );
          setIsCameraRunning(true);
        } else {
          alert("No camera found.");
        }
      }
    } catch (error) {
      console.error("Error starting scanner:", error);
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (
        scannerRef.current &&
        scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING
      ) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        setIsCameraRunning(false);
      }
    } catch (error) {
      console.warn("Error stopping scanner:", error);
    }
  };

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(qrRegionId);
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h2>QR Code Scanner</h2>
      <div
        id={qrRegionId}
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
          minHeight: "300px", // reserve space to prevent layout jump
          border: isCameraRunning ? "2px solid #ccc" : "none",
        }}
      />
      <div style={{ marginTop: "1rem" }}>
        {!isCameraRunning && !scannedResult && (
          <button
            onClick={startScanning}
            style={buttonStyle}
            disabled={isLoadingCamera}
          >
            {isLoadingCamera ? "Loading camera..." : "Start Scanning"}
          </button>
        )}
        {isCameraRunning && (
          <button onClick={stopScanning} style={buttonStyle}>
            Stop Scanning
          </button>
        )}
        {scannedResult && (
          <>
            <p style={{ color: "green" }}>✅ Scanned: {scannedResult}</p>
            <button
              onClick={() => {
                setScannedResult(null);
                startScanning();
              }}
              style={buttonStyle}
            >
              Scan Another QR
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: "16px",
  margin: "8px",
  cursor: "pointer",
};

export default QrScanner;
