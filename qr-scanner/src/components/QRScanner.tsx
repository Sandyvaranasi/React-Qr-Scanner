import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";

const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<string>("");
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    const startScanner = async () => {
      if (!videoRef.current) return;

      try {
        const devices: MediaDeviceInfo[] =
          await BrowserQRCodeReader.listVideoInputDevices();

        console.log("Cameras found:");
        devices.forEach((d, i) => {
          console.log(`Cam ${i + 1}:`, d.label, d.deviceId);
        });

        const backCam = devices.find((d) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("environment")
        );

        const selectedDeviceId = backCam?.deviceId || devices[0]?.deviceId;

        if (!selectedDeviceId) {
          alert("No camera found.");
          return;
        }

        const controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (res) => {
            if (res) {
              setResult(res.getText());
              controls.stop();
            }
          }
        );

        controlsRef.current = controls;
      } catch (error) {
        console.error("Camera access failed:", error);
        alert(`Camera access failed: ${(error as Error).message}`);
      }
    };

    startScanner();

    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: "1rem", textAlign: "center" }}>
      <h2>QR Scanner</h2>
      <video
        ref={videoRef}
        style={{ width: "100%", borderRadius: 8 }}
        playsInline
        muted
        autoPlay
      />
      <p style={{ marginTop: "1rem", color: "green" }}>
        {result ? `✅ ${result}` : "📷 Scan a QR code"}
      </p>
    </div>
  );
};

export default QRScanner;
