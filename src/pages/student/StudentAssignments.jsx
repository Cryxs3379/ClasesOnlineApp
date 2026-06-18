import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAssignments,
  submitAssignment,
  downloadSubmissionFile,
  downloadAttachmentFile,
} from '../../services/assignmentService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatFileSize } from '../../utils/documentFormatters';
import { formatDateTimeEs } from '../../utils/dateTimeUtils';
import { getAssignmentDisplayStatus } from '../../utils/assignmentStatus';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

function AssignmentStatusBadge({ assignment }) {
  const displayStatus = getAssignmentDisplayStatus(assignment);

  return (
    <div className="assignment-status-wrap">
      <span className={`assignment-status assignment-status--${displayStatus.key}`}>
        {displayStatus.label}
      </span>
      {displayStatus.warning && (
        <p className="assignment-warning">⚠️ {displayStatus.warning}</p>
      )}
    </div>
  );
}

function getTeacherName(assignment) {
  return assignment.teacher_name || assignment.teacherName || '—';
}

function getClassName(assignment) {
  return assignment.class_title || assignment.class_name || assignment.classTitle || '—';
}

function getSubmissionFilename(assignment) {
  return (
    assignment.submission_original_filename ||
    assignment.submissionOriginalFilename ||
    ''
  );
}

function getAttachmentFilename(assignment) {
  return (
    assignment.attachment_original_filename ||
    assignment.attachmentOriginalFilename ||
    ''
  );
}

function canSubmit(status) {
  return status === 'pending' || status === 'submitted';
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [downloadingSubmissionId, setDownloadingSubmissionId] = useState(null);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitTexts, setSubmitTexts] = useState({});
  const [submitFiles, setSubmitFiles] = useState({});

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  async function loadAssignments() {
    const data = await getAssignments();
    setAssignments(data);
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError('');
        const data = await getAssignments();
        setAssignments(data);
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

  async function handleSubmit(assignment) {
    const text = (submitTexts[assignment.id] ?? assignment.submission_text ?? '').trim();
    const file = submitFiles[assignment.id] || null;

    if (!text && !file) {
      setError('Escribe un texto o adjunta un archivo para entregar la tarea.');
      return;
    }

    if (!canSubmit(assignment.status)) {
      setError('Esta tarea ya no admite entregas.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmittingId(assignment.id);
    try {
      await submitAssignment(assignment.id, {
        submission_text: text || undefined,
        file: file || undefined,
      });
      setSubmitTexts((prev) => {
        const next = { ...prev };
        delete next[assignment.id];
        return next;
      });
      setSubmitFiles((prev) => {
        const next = { ...prev };
        delete next[assignment.id];
        return next;
      });
      await loadAssignments();
      setSuccess('Tarea entregada correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleDownloadSubmission(assignment) {
    const filename = getSubmissionFilename(assignment);
    if (!assignment?.id || !filename) return;

    setError('');
    setDownloadingSubmissionId(assignment.id);
    try {
      await downloadSubmissionFile(assignment.id, filename);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDownloadingSubmissionId(null);
    }
  }

  async function handleDownloadAttachment(assignment) {
    const filename = getAttachmentFilename(assignment);
    if (!assignment?.id || !filename) return;

    setError('');
    setDownloadingAttachmentId(assignment.id);
    try {
      await downloadAttachmentFile(assignment.id, filename);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDownloadingAttachmentId(null);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="assignments-page assignments-grid">
      <div className="page-header">
        <div>
          <span className="eyebrow">Deberes</span>
          <h1>Tareas</h1>
          <p>Consulta y entrega las tareas asignadas por tu profesor.</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h2>Mis tareas</h2>

        {assignments.length === 0 ? (
          <EmptyState
            title="Sin tareas"
            message="Cuando tu profesor te asigne tareas, aparecerán aquí."
          />
        ) : (
          <div className="assignments-grid">
            {assignments.map((assignment) => {
              const submissionFilename = getSubmissionFilename(assignment);
              const attachmentFilename = getAttachmentFilename(assignment);
              const showSubmitForm = canSubmit(assignment.status);

              return (
                <article key={assignment.id} className="assignment-card card">
                  <div className="assignment-card__header">
                    <h3>{assignment.title}</h3>
                    <AssignmentStatusBadge assignment={assignment} />
                  </div>

                  {assignment.description && (
                    <p className="assignment-card__desc">{assignment.description}</p>
                  )}

                  <div className="assignment-meta">
                    <span>Profesor: {getTeacherName(assignment)}</span>
                    <span>Clase: {getClassName(assignment)}</span>
                    <span>Fecha límite: {formatDateTimeEs(assignment.due_date)}</span>
                    <span>Creada: {formatDate(assignment.created_at)}</span>
                    <span>Entregada: {formatDateTimeEs(assignment.submitted_at)}</span>
                    {assignment.teacher_feedback && (
                      <span>Feedback: {assignment.teacher_feedback}</span>
                    )}
                  </div>

                  {attachmentFilename && (
                    <div className="assignment-file-block assignment-material">
                      <strong>Material de la tarea</strong>
                      <p className="assignment-file-name">{attachmentFilename}</p>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownloadAttachment(assignment)}
                        disabled={downloadingAttachmentId === assignment.id}
                      >
                        {downloadingAttachmentId === assignment.id
                          ? 'Descargando...'
                          : 'Descargar material'}
                      </button>
                    </div>
                  )}

                  {(assignment.submission_text || submissionFilename) && (
                    <div className="assignment-file-block assignment-submission">
                      <strong>Entrega del alumno</strong>
                      {assignment.submission_text && (
                        <p className="assignment-file-name">{assignment.submission_text}</p>
                      )}
                      {submissionFilename && (
                        <p className="assignment-file-name">
                          {submissionFilename}
                          {assignment.submission_file_size || assignment.submissionFileSize
                            ? ` (${formatFileSize(
                                assignment.submission_file_size || assignment.submissionFileSize
                              )})`
                            : ''}
                        </p>
                      )}
                      {submissionFilename && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDownloadSubmission(assignment)}
                          disabled={downloadingSubmissionId === assignment.id}
                        >
                          {downloadingSubmissionId === assignment.id
                            ? 'Descargando...'
                            : 'Descargar entrega'}
                        </button>
                      )}
                    </div>
                  )}

                  {showSubmitForm ? (
                    <form
                      className="assignment-submit-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(assignment);
                      }}
                    >
                      <div className="form-group">
                        <label htmlFor={`submit-text-${assignment.id}`}>Tu entrega</label>
                        <textarea
                          id={`submit-text-${assignment.id}`}
                          rows="4"
                          value={
                            submitTexts[assignment.id] ??
                            assignment.submission_text ??
                            ''
                          }
                          onChange={(e) =>
                            setSubmitTexts((prev) => ({
                              ...prev,
                              [assignment.id]: e.target.value,
                            }))
                          }
                          placeholder="Escribe tu respuesta..."
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`submit-file-${assignment.id}`}>
                          Archivo (opcional)
                        </label>
                        <input
                          id={`submit-file-${assignment.id}`}
                          type="file"
                          onChange={(e) =>
                            setSubmitFiles((prev) => ({
                              ...prev,
                              [assignment.id]: e.target.files?.[0] || null,
                            }))
                          }
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={submittingId === assignment.id}
                      >
                        {submittingId === assignment.id
                          ? 'Entregando...'
                          : assignment.status === 'submitted'
                            ? 'Actualizar entrega'
                            : 'Entregar tarea'}
                      </button>
                    </form>
                  ) : (
                    <p className="assignment-card__notice muted">
                      {assignment.status === 'reviewed'
                        ? 'Esta tarea ya fue revisada por tu profesor.'
                        : 'Esta tarea está cancelada y no admite entregas.'}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
