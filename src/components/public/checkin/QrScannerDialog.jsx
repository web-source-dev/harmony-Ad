import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

// Reads a check-in QR with the tablet's camera. Calls onCode with the 8-character code from the
// scanned link (".../check-in/K7QM4XWP") or from a QR that holds just the code.
export const codeFromQr = (text) => {
  const value = String(text || '').trim();
  const fromLink = value.match(/check-in\/([A-Za-z0-9-]+)\/?(?:[?#].*)?$/);
  const raw = (fromLink ? fromLink[1] : value).replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z2-9]{8}$/.test(raw) ? raw : null;
};

const QrScannerDialog = ({ open, onClose, onCode }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [badQr, setBadQr] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let stream = null;
    let frame = null;
    let stopped = false;
    setError(null);
    setBadQr(false);

    const scan = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Downscale so decoding stays fast on tablets
        const scale = Math.min(1, 640 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' });
        if (result?.data) {
          const code = codeFromQr(result.data);
          if (code) {
            stopped = true;
            if (navigator.vibrate) navigator.vibrate(80);
            onCode(code);
            return;
          }
          setBadQr(true);
        }
      }
      frame = requestAnimationFrame(scan);
    };

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((mediaStream) => {
        if (stopped) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        const video = videoRef.current;
        video.srcObject = mediaStream;
        video.setAttribute('playsinline', 'true'); // iPad Safari would otherwise open it full screen
        return video.play().then(() => {
          frame = requestAnimationFrame(scan);
        });
      })
      .catch(() => setError('Camera unavailable. Allow camera access for this site in the browser settings, or search by name instead.'));
    if (!navigator.mediaDevices) setError('This browser can’t use the camera here. Search by name instead.');

    return () => {
      stopped = true;
      if (frame) cancelAnimationFrame(frame);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [open, onCode]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Scan check-in QR</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="warning">{error}</Alert>
        ) : (
          <>
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'black', aspectRatio: '4 / 3' }}>
              <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box
                sx={{
                  position: 'absolute',
                  inset: '15%',
                  border: '3px solid rgba(255,255,255,0.85)',
                  borderRadius: 3,
                  pointerEvents: 'none',
                }}
              />
            </Box>
            <Typography variant="body2" color={badQr ? 'error' : 'text.secondary'} sx={{ mt: 1.5, textAlign: 'center' }}>
              {badQr ? 'That QR isn’t a Harmony 4 All check-in code.' : 'Hold the guest’s QR code inside the frame.'}
            </Typography>
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrScannerDialog;
