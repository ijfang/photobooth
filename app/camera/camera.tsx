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

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImgSrc(imageSrc ?? null);
  }, [webcamRef]);

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
    <div>
      <div className="webcam container">
        {imgSrc ? (
          <img src={imgSrc} alt="webcam" />
        ) : error ? (
          <div className="flex items-center justify-center h-96 bg-red-900 rounded text-white p-4">
            <p className="text-center">{error}</p>
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
      <div className="btn container">
        <button onClick={capture}>Capture photo</button>
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
