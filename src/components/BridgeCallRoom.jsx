import { useEffect, useRef, useState } from 'react';

const domain = 'meet.trujillolucena.es';

export default function BridgeCallRoom({ roomName, displayName, email, onLeave }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;

    function init() {
      if (disposed || !containerRef.current || apiRef.current) return;

      if (!window.JitsiMeetExternalAPI) {
        setError('No se pudo cargar Jitsi External API.');
        setLoading(false);
        return;
      }

      const api = new window.JitsiMeetExternalAPI(domain, {
        roomName,
        parentNode: containerRef.current,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName,
          email: email || '',
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableDeepLinking: true,
          defaultLanguage: 'es',
          subject: 'BridgeCall',
          toolbarButtons: [
            'microphone',
            'camera',
            'desktop',
            'chat',
            'raisehand',
            'tileview',
            'fullscreen',
            'hangup',
            'settings',
          ],
        },
        interfaceConfigOverwrite: {
          APP_NAME: 'BridgeCall',
          NATIVE_APP_NAME: 'BridgeCall',
          PROVIDER_NAME: 'BridgeClass',
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
        },
      });

      apiRef.current = api;
      api.executeCommand('subject', 'BridgeCall');

      api.addListener('videoConferenceJoined', () => {
        setLoading(false);
      });

      api.addListener('videoConferenceLeft', () => {
        onLeave?.();
      });

      api.addListener('readyToClose', () => {
        onLeave?.();
      });

      setLoading(false);
    }

    if (window.JitsiMeetExternalAPI) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.JitsiMeetExternalAPI) {
          clearInterval(interval);
          init();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        if (!window.JitsiMeetExternalAPI) {
          setError('No se pudo cargar el motor de videollamada.');
          setLoading(false);
        }
      }, 5000);

      return () => clearInterval(interval);
    }

    return () => {
      disposed = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, email, onLeave]);

  return (
    <div className="bridgecall-room">
      {loading && <div className="bridgecall-overlay">Conectando con BridgeCall...</div>}
      {error && <div className="bridgecall-overlay bridgecall-overlay--error">{error}</div>}
      <div ref={containerRef} className="bridgecall-room__container" />
    </div>
  );
}
