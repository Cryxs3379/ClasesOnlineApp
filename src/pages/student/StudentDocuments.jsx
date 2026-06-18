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
    <div className="documents-grid">
      <div className="page-header">
        <div>
          <span className="eyebrow">Materiales</span>
          <h1>Documentos</h1>
          <p>Materiales y tareas compartidos por tu profesor.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="card">
        <h2>Documentos asignados</h2>

        {documents.length === 0 ? (
          <EmptyState
            title="Sin documentos"
            message="Cuando tu profesor comparta materiales, aparecerán aquí."
          />
        ) : (
          <div className="documents-list">
            {documents.map((doc) => (
              <article key={doc.id} className="document-item">
                <div className="document-item__main">
                  <h3>{doc.title}</h3>
                  {doc.description && <p className="document-item__desc">{doc.description}</p>}
                  <div className="document-item__meta">
                    <span>Profesor: {getDocumentTeacherName(doc)}</span>
                    <span>Clase: {getDocumentClassName(doc)}</span>
                    <span>Archivo: {doc.original_filename || doc.originalFilename || '—'}</span>
                    <span>Fecha: {formatDate(doc.created_at || doc.createdAt)}</span>
                  </div>
                </div>
                <div className="document-item__actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
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
      </div>
    </div>
  );
}
