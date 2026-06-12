export default function WhiteboardOverlayPlaceholder({ canDraw }) {
  return (
    <div className="whiteboard-placeholder whiteboard-coming-soon">
      <div className="whiteboard-placeholder__toolbar">
        <button type="button" disabled>
          Lápiz
        </button>
        <button type="button" disabled>
          Texto
        </button>
        <button type="button" disabled>
          Borrar
        </button>
        <button type="button" disabled>
          Limpiar
        </button>
      </div>
      <p>
        {canDraw
          ? 'La pizarra del profesor se añadirá aquí como una capa sincronizada en tiempo real.'
          : 'Aquí verás las anotaciones del profesor durante la clase.'}
      </p>
    </div>
  );
}
