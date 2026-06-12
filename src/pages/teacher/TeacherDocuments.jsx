export default function TeacherDocuments() {
  return (
    <div className="documents-grid">
      <div className="page-header">
        <div>
          <span className="eyebrow">Materiales</span>
          <h1>Documentos</h1>
          <p>Gestiona materiales y tareas para tus alumnos.</p>
        </div>
        <button type="button" className="btn btn-primary" disabled>
          Subir documento
        </button>
      </div>

      <div className="card">
        <h2>Documentos asignados</h2>
        <p className="muted">
          La subida de documentos estará disponible cuando el backend habilite almacenamiento de
          archivos.
        </p>
      </div>

      <div className="cards-grid">
        <article className="card">
          <h3>Sin documentos</h3>
          <p className="muted">Aquí aparecerán PDFs, enlaces y tareas compartidas.</p>
        </article>
      </div>
    </div>
  );
}
