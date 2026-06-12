export default function StudentDocuments() {
  return (
    <div className="documents-grid">
      <div className="page-header">
        <div>
          <span className="eyebrow">Materiales</span>
          <h1>Documentos</h1>
          <p>Materiales y tareas compartidos por tu profesor.</p>
        </div>
      </div>

      <div className="card">
        <h2>Documentos asignados</h2>
        <p className="muted">
          Cuando tu profesor comparta materiales, aparecerán aquí.
        </p>
      </div>

      <div className="cards-grid">
        <article className="card">
          <h3>Sin documentos</h3>
          <p className="muted">Aquí verás PDFs, enlaces y tareas asignadas.</p>
        </article>
      </div>
    </div>
  );
}
