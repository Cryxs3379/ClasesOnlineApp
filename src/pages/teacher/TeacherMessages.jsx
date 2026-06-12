export default function TeacherMessages() {
  return (
    <div className="messages-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Comunicación</span>
          <h1>Mensajes</h1>
          <p>Mensajería en tiempo real próximamente.</p>
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="card messages-shell__sidebar">
          <h2>Conversaciones</h2>
          <div className="messages-shell__conversation muted">Sin conversaciones todavía</div>
        </aside>

        <section className="card messages-shell__panel">
          <div className="messages-shell__empty">
            <p>Selecciona una conversación para ver los mensajes.</p>
            <p className="muted">La mensajería en tiempo real se activará en una próxima versión.</p>
          </div>

          <div className="messages-shell__composer">
            <input type="text" placeholder="Escribe un mensaje..." disabled />
            <button type="button" className="btn btn-primary" disabled>
              Enviar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
