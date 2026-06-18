import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../../services/studentService';
import { getMyClasses } from '../../services/classService';
import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from '../../services/documentService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatFileSize } from '../../utils/documentFormatters';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

function getDocumentClassName(doc) {
  return doc.class_title || doc.class_name || doc.classTitle || '—';
}

function getDocumentStudentName(doc) {
  return doc.student_name || doc.studentName || '—';
}

export default function TeacherDocuments() {
  const [documents, setDocuments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [file, setFile] = useState(null);

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  async function loadDocuments() {
    const data = await getDocuments();
    setDocuments(data);
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError('');
        const [docsData, studentsData, classesData] = await Promise.all([
          getDocuments(),
          getStudents(),
          getMyClasses(),
        ]);
        setDocuments(docsData);
        setStudents(studentsData.filter((s) => s.is_active !== false));
        setClasses(classesData);
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
    init();
  }, [logoutUser, navigate]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setStudentId('');
    setClassId('');
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    if (!file) {
      setError('Debes seleccionar un archivo.');
      return;
    }

    if (!studentId && !classId) {
      setError('Selecciona un alumno o una clase.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await uploadDocument({
        title: title.trim(),
        description: description.trim(),
        student_id: studentId || undefined,
        class_id: classId || undefined,
        file,
      });
      resetForm();
      await loadDocuments();
      setSuccess(response.message || 'Documento subido correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

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

  async function handleDelete(doc) {
    const confirmed = window.confirm(`¿Eliminar el documento "${doc.title}"?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      await loadDocuments();
      setSuccess('Documento eliminado correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="documents-grid">
      <div className="page-header">
        <div>
          <span className="eyebrow">Materiales</span>
          <h1>Documentos</h1>
          <p>Gestiona materiales y tareas para tus alumnos.</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card card">
        <h2>Subir documento</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="doc-title">Título</label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Unit 4 · Vocabulary"
            />
          </div>

          <div className="form-group">
            <label htmlFor="doc-description">Descripción</label>
            <textarea
              id="doc-description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas sobre el material..."
            />
          </div>

          <div className="documents-form__row">
            <div className="form-group">
              <label htmlFor="doc-student">Alumno</label>
              <select
                id="doc-student"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Selecciona alumno (opcional si hay clase)</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="doc-class">Clase</label>
              <select
                id="doc-class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">Selecciona clase (opcional)</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.title} · {classItem.student_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="doc-file">Archivo</label>
            <input
              id="doc-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Subiendo...' : 'Subir documento'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Documentos asignados</h2>

        {documents.length === 0 ? (
          <EmptyState
            title="Sin documentos"
            message="Sube tu primer material para compartirlo con tus alumnos."
          />
        ) : (
          <div className="documents-list">
            {documents.map((doc) => (
              <article key={doc.id} className="document-item">
                <div className="document-item__main">
                  <h3>{doc.title}</h3>
                  {doc.description && <p className="document-item__desc">{doc.description}</p>}
                  <div className="document-item__meta">
                    <span>Alumno: {getDocumentStudentName(doc)}</span>
                    <span>Clase: {getDocumentClassName(doc)}</span>
                    <span>Archivo: {doc.original_filename || doc.originalFilename || '—'}</span>
                    <span>Tipo: {doc.mime_type || doc.mimeType || '—'}</span>
                    <span>Tamaño: {formatFileSize(doc.file_size || doc.fileSize)}</span>
                    <span>Fecha: {formatDate(doc.created_at || doc.createdAt)}</span>
                  </div>
                </div>
                <div className="document-item__actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                  >
                    {downloadingId === doc.id ? 'Descargando...' : 'Descargar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? 'Eliminando...' : 'Borrar'}
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
