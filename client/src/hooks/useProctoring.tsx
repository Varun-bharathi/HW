import { useEffect, useState, useRef } from 'react';
import { applicationsApi } from '@/api/applications';

export function useProctoring(applicationId: string | undefined, onTerminate: () => void) {
    const [tabSwitches, setTabSwitches] = useState(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Tab switching logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => {
                    const newCount = prev + 1;
                    if (newCount === 1) {
                        alert("WARNING: Tab switching is strictly prohibited! If you switch tabs again, your test will be terminated.");
                    } else if (newCount >= 2) {
                        alert("You are terminated from the hiring process due to multiple tab switches.");
                        if (applicationId) {
                            applicationsApi.reportProctoringViolation(applicationId, "Multiple tab switches detected").catch(console.error);
                        }
                        onTerminate();
                    }
                    return newCount;
                });
            }
        };

        const handleBlur = () => {
            // Also detect window blur as a tab switch
            if (document.hasFocus && !document.hasFocus()) {
                handleVisibilityChange();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, [applicationId, onTerminate]);

    // Camera logic
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied or unavailable", err);
                alert("Camera access is required for this test. Please enable your camera.");
            }
        };

        startCamera();

        const captureInterval = setInterval(() => {
            if (videoRef.current && canvasRef.current && applicationId) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                // Only draw if video has dimensions
                if (video.videoWidth && video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = canvas.toDataURL('image/jpeg', 0.3); // Compressed quality

                    // Send to recruiter API
                    applicationsApi.sendProctoringImage(applicationId, imageData).catch(console.error);
                }
            }
        }, 60000); // 1 minute

        return () => {
            clearInterval(captureInterval);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [applicationId]);

    const ProctoringView = () => (
        <div className="fixed bottom-6 left-6 z-50 w-48 h-36 bg-slate-900 border-2 border-slate-700/50 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover bg-black" />
            <canvas ref={canvasRef} className="hidden" />
            {!streamRef.current && <span className="absolute text-xs text-slate-500">Camera needed</span>}
        </div>
    );

return { ProctoringView, tabSwitches };
}
