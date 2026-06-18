import { useCallback, useEffect, useRef, useState } from 'react';
import { getToken } from '../storage/authStorage';
import {
  connectSocket,
  joinWhiteboard,
  leaveWhiteboard,
  requestWhiteboardState,
  sendWhiteboardDraw,
  sendWhiteboardClear,
} from '../socket/socketClient';

function isValidPoint(point) {
  return (
    point &&
    typeof point.x === 'number' &&
    typeof point.y === 'number' &&
    point.x >= 0 &&
    point.x <= 1 &&
    point.y >= 0 &&
    point.y <= 1
  );
}

function createStrokeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function WhiteboardRoom({ classId, canDraw }) {
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const strokesRef = useRef([]);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#111827');
  const [width, setWidth] = useState(4);
  const [status, setStatus] = useState('');

  const isValidStroke = useCallback(
    (stroke) => {
      return (
        stroke &&
        stroke.classId === classId &&
        (stroke.tool === 'pen' || stroke.tool === 'eraser') &&
        isValidPoint(stroke.from) &&
        isValidPoint(stroke.to)
      );
    },
    [classId]
  );

  const drawStroke = useCallback(
    (stroke) => {
      const canvas = canvasRef.current;
      if (!canvas || !isValidStroke(stroke)) return;

      const ctx = canvas.getContext('2d');

      const fromX = stroke.from.x * canvas.width;
      const fromY = stroke.from.y * canvas.height;
      const toX = stroke.to.x * canvas.width;
      const toY = stroke.to.y * canvas.height;

      ctx.save();

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Number(stroke.width || 4);

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color || '#111827';
      }

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.restore();
    },
    [isValidStroke]
  );

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesRef.current.forEach((stroke) => {
      drawStroke(stroke);
    });
  }, [drawStroke]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;

    if (!canvas || !shell) return;

    const rect = shell.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    redrawAll();
  }, [redrawAll]);

  useEffect(() => {
    resizeCanvas();

    const shell = shellRef.current;

    if (!shell) return undefined;

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => {
        resizeCanvas();
      });

      observer.observe(shell);

      return () => observer.disconnect();
    }

    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (!classId) {
      setStatus('No se pudo iniciar la pizarra de esta clase.');
      return undefined;
    }

    const token = getToken();

    if (!token) {
      setStatus('No se pudo conectar con la pizarra.');
      return undefined;
    }

    const socket = connectSocket(token);

    if (!socket) {
      setStatus('No se pudo conectar con la pizarra.');
      return undefined;
    }

    function subscribe() {
      joinWhiteboard(classId);
      requestWhiteboardState(classId);
    }

    if (socket.connected) {
      subscribe();
    } else {
      socket.once('connect', subscribe);
    }

    function onWhiteboardDraw(stroke) {
      if (!isValidStroke(stroke)) return;

      strokesRef.current = [...strokesRef.current, stroke];
      drawStroke(stroke);
    }

    function onWhiteboardClear(payload) {
      if (payload?.classId !== classId) return;

      strokesRef.current = [];
      redrawAll();
    }

    function onWhiteboardState(payload) {
      if (payload?.classId !== classId) return;

      const strokes = Array.isArray(payload.strokes)
        ? payload.strokes.filter(isValidStroke)
        : [];

      strokesRef.current = strokes;
      redrawAll();
    }

    function onWhiteboardError(payload) {
      setStatus(payload?.message || 'Error en la pizarra.');
    }

    socket.on('whiteboard:draw', onWhiteboardDraw);
    socket.on('whiteboard:clear', onWhiteboardClear);
    socket.on('whiteboard:state', onWhiteboardState);
    socket.on('whiteboard:error', onWhiteboardError);

    return () => {
      socket.off('connect', subscribe);
      socket.off('whiteboard:draw', onWhiteboardDraw);
      socket.off('whiteboard:clear', onWhiteboardClear);
      socket.off('whiteboard:state', onWhiteboardState);
      socket.off('whiteboard:error', onWhiteboardError);
      leaveWhiteboard(classId);
    };
  }, [classId, drawStroke, redrawAll, isValidStroke]);

  function getRelativePoint(event) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  function handlePointerDown(event) {
    if (!canDraw) return;

    const point = getRelativePoint(event);
    if (!point) return;

    drawingRef.current = true;
    lastPointRef.current = point;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ignorar
    }
  }

  function handlePointerMove(event) {
    if (!canDraw || !drawingRef.current) return;

    const currentPoint = getRelativePoint(event);
    const lastPoint = lastPointRef.current;

    if (!currentPoint || !lastPoint) return;

    const stroke = {
      id: createStrokeId(),
      classId,
      tool,
      color,
      width,
      from: lastPoint,
      to: currentPoint,
    };

    strokesRef.current = [...strokesRef.current, stroke];
    drawStroke(stroke);
    sendWhiteboardDraw(stroke);

    lastPointRef.current = currentPoint;
  }

  function stopDrawing(event) {
    drawingRef.current = false;
    lastPointRef.current = null;

    try {
      if (event?.currentTarget && event?.pointerId) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // ignorar
    }
  }

  function handleClear() {
    if (!canDraw || !classId) return;

    const confirmed = window.confirm('¿Limpiar la pizarra para todos?');
    if (!confirmed) return;

    strokesRef.current = [];
    redrawAll();
    sendWhiteboardClear(classId);
  }

  if (!classId) {
    return (
      <p className="whiteboard-status">No se pudo iniciar la pizarra de esta clase.</p>
    );
  }

  return (
    <div className="whiteboard-room">
      <div className="whiteboard-toolbar">
        {canDraw ? (
          <>
            <div className="whiteboard-toolbar__group">
              <button
                type="button"
                className={`btn btn-sm ${tool === 'pen' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTool('pen')}
              >
                Lápiz
              </button>

              <button
                type="button"
                className={`btn btn-sm ${tool === 'eraser' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTool('eraser')}
              >
                Goma
              </button>
            </div>

            <div className="whiteboard-toolbar__group">
              <label htmlFor="whiteboard-color">Color</label>
              <input
                id="whiteboard-color"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                disabled={tool === 'eraser'}
              />
            </div>

            <div className="whiteboard-toolbar__group">
              <label htmlFor="whiteboard-width">Grosor {width}px</label>
              <input
                id="whiteboard-width"
                type="range"
                min="1"
                max="24"
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
              />
            </div>

            <button type="button" className="btn btn-ghost btn-sm" onClick={handleClear}>
              Limpiar
            </button>
          </>
        ) : (
          <span className="whiteboard-readonly-badge">
            Viendo la pizarra del profesor en tiempo real
          </span>
        )}
      </div>

      <div ref={shellRef} className="whiteboard-canvas-shell">
        <canvas
          ref={canvasRef}
          className={`whiteboard-canvas ${!canDraw ? 'whiteboard-canvas--readonly' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
        />
      </div>

      {status && <p className="whiteboard-status">{status}</p>}
    </div>
  );
}
