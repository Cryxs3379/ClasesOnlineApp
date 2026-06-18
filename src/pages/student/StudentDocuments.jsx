import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, downloadDocument } from '../../services/documentService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/documentFormatters';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

function getDocumentClassName(doc) {
  return doc.class_title || doc.class_name || doc.classTitle || '—';
}

function getDocumentTeacherName(doc) {
  return doc.teacher_name || doc.teacherName || '—';
}

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError('');
        const data = await getDocuments();
        setDocuments(data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          logoutUser();
          navigate('/login');
          return;
        }
        setError(getAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, [logoutUser, navigate]);

  async function handleDownload(doc) {
    setError('');
    setDownloadingId(doc.id);
    try {
      await downloadDocument(
        doc.id,
        doc.original_filename || doc.originalFilename || doc.title
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="workspace-page documents-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Materiales</span>
          <h1>Documentos</h1>
          <p>Materiales y recursos compartidos por tu profesor.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <section className="dashboard-section-card card">
        <div className="dashboard-section-card__header">
          <h2 className="workspace-section-title">Documentos asignados</h2>
          <span className="badge badge-muted">{documents.length}</span>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Todavía no hay materiales"
            message="Cuando tu profesor comparta materiales aparecerán aquí."
          />
        ) : (
          <div className="documents-grid">
            {documents.map((doc) => (
              <article key={doc.id} className="document-card card">
                <span className="document-card__icon" aria-hidden="true">
                  📄
                </span>
                <h3>{doc.title}</h3>
                {doc.description ? <p className="document-card__desc">{doc.description}</p> : null}
                <div className="document-card__meta">
                  <span>Profesor: {getDocumentTeacherName(doc)}</span>
                  <span>Clase: {getDocumentClassName(doc)}</span>
                  <span>{doc.original_filename || doc.originalFilename || '—'}</span>
                  <span>{formatDate(doc.created_at || doc.createdAt)}</span>
                </div>
                <div className="document-card__actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm btn-block"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                  >
                    {downloadingId === doc.id ? 'Descargando...' : 'Descargar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
