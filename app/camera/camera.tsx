import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: { min: 480 },
  height: { min: 720 },
  aspectRatio: 0.6666666667,
  facingMode: "user",
};

const WebcamComponent = () => {
  const webcamRef = useRef<any>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null); // initialize it
  const [error, setError] = useState<string | null>(null);

  // Apply vintage filter: sepia overlay + high contrast + prominent grain effect
  const applyVintageFilter = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Draw the image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply neutral grey tone overlay (less sepia, more grey)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Convert to grayscale
          const gray = r * 0.299 + g * 0.587 + b * 0.114;

          // Apply neutral grey tone (minimal color shift)
          data[i] = Math.min(255, gray * 0.95 + 5); // red - very slight warmth
          data[i + 1] = Math.min(255, gray * 0.95 + 5); // green - same as red for neutral
          data[i + 2] = Math.min(255, gray * 0.95 + 5); // blue - same for neutral grey
        }

        // Apply high contrast
        const contrastFactor = 1.5;
        const contrastOffset = 128 * (1 - contrastFactor) / 2;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * contrastFactor + contrastOffset; // red
          data[i + 1] = data[i + 1] * contrastFactor + contrastOffset; // green
          data[i + 2] = data[i + 2] * contrastFactor + contrastOffset; // blue
        }

        // Apply prominent grain effect for authentic film look
        const grainAmount = 50;
        const grainIntensity = 0.6;
        for (let i = 0; i < data.length; i += 4) {
          const grain = (Math.random() - 0.5) * grainAmount * grainIntensity;
          data[i] += grain; // red
          data[i + 1] += grain; // green
          data[i + 2] += grain; // blue
        }

        // Add subtle vignette effect (darker edges)
        const imageDataWidth = canvas.width;
        const imageDataHeight = canvas.height;
        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4;
          const x = pixelIndex % imageDataWidth;
          const y = Math.floor(pixelIndex / imageDataWidth);

          // Calculate distance from center
          const dx = (x - imageDataWidth / 2) / (imageDataWidth / 2);
          const dy = (y - imageDataHeight / 2) / (imageDataHeight / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Apply vignette (darken edges)
          const vignette = Math.max(0, 1 - distance * 0.6);
          data[i] *= vignette;
          data[i + 1] *= vignette;
          data[i + 2] *= vignette;
        }

        // Clamp values to 0-255
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.max(0, Math.min(255, data[i]));
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert canvas back to image data URL
        const filteredImageSrc = canvas.toDataURL("image/jpeg", 0.85);
        resolve(filteredImageSrc);
      };
      img.src = imageSrc;
    });
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const filteredImage = await applyVintageFilter(imageSrc);
      setImgSrc(filteredImage);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setError(null);
  }

  const handleUserMediaError = (err: any) => {
    console.error("Camera error:", err);
    if (err.name === "NotAllowedError") {
      setError("Camera permission denied. Please allow camera access in your browser settings.");
    } else if (err.name === "NotFoundError" || err.name === "NotReadableError") {
      setError("No camera found or camera is in use by another application.");
    } else if (err.name === "OverconstrainedError") {
      setError("Your camera does not support the requested video constraints.");
    } else {
      setError(`Camera error: ${err.message || err.name || "Unknown error"}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-lg">
        {imgSrc ? (
          <img src={imgSrc} alt="webcam" className="w-full h-full object-cover" />
        ) : error ? (
          <div className="flex items-center justify-center w-96 h-96 bg-red-900 rounded text-white p-6">
            <p className="text-center text-sm">{error}</p>
          </div>
        ) : (
          <Webcam
            height={600}
            width={600}
            ref={webcamRef}
            videoConstraints={videoConstraints}
            screenshotFormat="image/jpeg"
            mirrored
            onUserMediaError={handleUserMediaError}
          />
        )}
      </div>
      <div className="flex gap-3">
        {imgSrc ? (
          <button
            onClick={retake}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retake photo
          </button>
        ) : (
          <button
            onClick={capture}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Capture photo
          </button>
        )}
      </div>
    </div>
  );
};

export default function Camera() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-4xl font-bold text-white">Camera Page</h1>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <p className="leading-6 text-white text-center">
            This is the camera page.
          </p>
        </div>
        <WebcamComponent />
      </div>
    </main>
  );
}

