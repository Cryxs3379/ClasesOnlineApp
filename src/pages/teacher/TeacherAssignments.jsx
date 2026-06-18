import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../../services/studentService';
import { getMyClasses } from '../../services/classService';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  reviewAssignment,
  deleteAssignment,
  downloadSubmissionFile,
  downloadAttachmentFile,
} from '../../services/assignmentService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import { formatFileSize } from '../../utils/documentFormatters';
import { localDateTimeToUtcIso, formatDateTimeEs } from '../../utils/dateTimeUtils';
import { getAssignmentDisplayStatus, isAssignmentOverdue } from '../../utils/assignmentStatus';
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

function getStudentName(assignment) {
  return assignment.student_name || assignment.studentName || '—';
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

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingSubmissionId, setDownloadingSubmissionId] = useState(null);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const attachmentInputRef = useRef(null);

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
        const [assignmentsData, studentsData, classesData] = await Promise.all([
          getAssignments(),
          getStudents(),
          getMyClasses(),
        ]);
        setAssignments(assignmentsData);
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
    setDueDate('');
    setAttachment(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  }

  function handleClassChange(value) {
    setClassId(value);

    if (!value) return;

    const classItem = classes.find((item) => item.id === value);
    const linkedStudentId = classItem?.student_id || classItem?.studentId;

    if (linkedStudentId) {
      setStudentId(String(linkedStudentId));
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    const selectedStudentId = studentId.trim();
    const selectedClassId = classId.trim();

    if (!selectedStudentId && !selectedClassId) {
      setError('Selecciona un alumno o una clase.');
      return;
    }

    const dueDateIso = dueDate ? localDateTimeToUtcIso(dueDate) : null;

    if (dueDate && !dueDateIso) {
      setError('La fecha límite no es válida.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDateIso || undefined,
    };

    if (selectedStudentId) {
      payload.student_id = selectedStudentId;
    }

    if (selectedClassId) {
      payload.class_id = selectedClassId;
    }

    if (attachment) {
      payload.attachment = attachment;
    }

    setSubmitting(true);
    try {
      const response = await createAssignment(payload);
      resetForm();
      await loadAssignments();
      setSuccess(response.message || 'Tarea creada correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(assignment) {
    const feedback = (reviewDrafts[assignment.id] || '').trim();
    if (!feedback) {
      setError('Escribe un feedback antes de revisar la tarea.');
      return;
    }

    setError('');
    setSuccess('');
    setReviewingId(assignment.id);
    try {
      await reviewAssignment(assignment.id, { teacher_feedback: feedback });
      setReviewDrafts((prev) => {
        const next = { ...prev };
        delete next[assignment.id];
        return next;
      });
      await loadAssignments();
      setSuccess('Tarea revisada correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  }

  async function handleCancel(assignment) {
    const confirmed = window.confirm(`¿Cancelar la tarea "${assignment.title}"?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setCancellingId(assignment.id);
    try {
      await updateAssignment(assignment.id, { status: 'cancelled' });
      await loadAssignments();
      setSuccess('Tarea cancelada correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  async function handleDelete(assignment) {
    const confirmed = window.confirm(`¿Eliminar la tarea "${assignment.title}"?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setDeletingId(assignment.id);
    try {
      await deleteAssignment(assignment.id);
      await loadAssignments();
      setSuccess('Tarea eliminada correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDeletingId(null);
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
    <div className="workspace-page assignments-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Deberes</span>
          <h1>Tareas</h1>
          <p>Crea y revisa tareas para tus alumnos.</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card card upload-card assignment-form">
        <h2 className="workspace-section-title">Nueva tarea</h2>
        <form onSubmit={handleCreate} className="form">
          <fieldset className="form-section">
            <legend className="form-section__title">Datos de la tarea</legend>
            <div className="form-group">
              <label htmlFor="assignment-title" className="form-label">
                Título
              </label>
              <input
                id="assignment-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Unit 4 · Writing exercise"
              />
            </div>

            <div className="form-group">
              <label htmlFor="assignment-description" className="form-label">
                Descripción
              </label>
              <textarea
                id="assignment-description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instrucciones para el alumno..."
              />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend className="form-section__title">Asignación</legend>
            <div className="form-grid documents-form__row">
              <div className="form-group">
                <label htmlFor="assignment-student" className="form-label">
                  Alumno
                </label>
                <select
                  id="assignment-student"
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
                <label htmlFor="assignment-class" className="form-label">
                  Clase
                </label>
                <select
                  id="assignment-class"
                  value={classId}
                  onChange={(e) => handleClassChange(e.target.value)}
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
          </fieldset>

          <fieldset className="form-section">
            <legend className="form-section__title">Plazo y material</legend>
            <div className="form-group">
              <label htmlFor="assignment-due-date" className="form-label">
                Fecha límite
              </label>
              <input
                id="assignment-due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group input-shell">
              <label htmlFor="assignment-attachment" className="form-label">
                Material adjunto (opcional)
              </label>
              <input
                ref={attachmentInputRef}
                id="assignment-attachment"
                name="attachment"
                type="file"
                className="file-input"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear tarea'}
          </button>
        </form>
      </div>

      <section className="dashboard-section-card card">
        <div className="dashboard-section-card__header">
          <h2 className="workspace-section-title">Tareas asignadas</h2>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Sin tareas"
            message="Crea tu primera tarea para asignarla a un alumno o clase."
          />
        ) : (
          <div className="assignment-board">
            {assignments.map((assignment) => {
              const submissionFilename = getSubmissionFilename(assignment);
              const attachmentFilename = getAttachmentFilename(assignment);
              const canReview = assignment.status === 'submitted';
              const canCancel = assignment.status !== 'reviewed';
              const displayStatus = getAssignmentDisplayStatus(assignment);
              const cardClasses = [
                'assignment-card',
                'card',
                canReview ? 'assignment-card--submitted' : '',
                displayStatus.key === 'overdue' ? 'assignment-card--overdue' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <article key={assignment.id} className={cardClasses}>
                  {canReview ? (
                    <p className="assignment-card__review-banner">Pendiente de revisar</p>
                  ) : null}

                  <div className="assignment-card__header">
                    <h3>{assignment.title}</h3>
                    <AssignmentStatusBadge assignment={assignment} />
                  </div>

                  {assignment.description ? (
                    <p className="assignment-card__desc">{assignment.description}</p>
                  ) : null}

                  <div className="assignment-meta">
                    <span>Alumno: {getStudentName(assignment)}</span>
                    <span>Clase: {getClassName(assignment)}</span>
                    <span>Fecha límite: {formatDateTimeEs(assignment.due_date)}</span>
                    <span>Creada: {formatDateTimeEs(assignment.created_at)}</span>
                    <span>Entregada: {formatDateTimeEs(assignment.submitted_at)}</span>
                  </div>

                  {assignment.teacher_feedback ? (
                    <div className="assignment-feedback">
                      <strong>Feedback enviado</strong>
                      <p>{assignment.teacher_feedback}</p>
                    </div>
                  ) : null}

                  {attachmentFilename ? (
                    <div className="assignment-file-block assignment-material">
                      <strong>Material adjunto</strong>
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
                  ) : null}

                  {(assignment.submission_text || submissionFilename) ? (
                    <div className="assignment-file-block assignment-submission">
                      <strong>Entrega del alumno</strong>
                      {assignment.submission_text ? (
                        <p className="assignment-file-name">{assignment.submission_text}</p>
                      ) : null}
                      {submissionFilename ? (
                        <p className="assignment-file-name">
                          {submissionFilename}
                          {assignment.submission_file_size || assignment.submissionFileSize
                            ? ` (${formatFileSize(
                                assignment.submission_file_size || assignment.submissionFileSize
                              )})`
                            : ''}
                        </p>
                      ) : null}
                      {submissionFilename ? (
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
                      ) : null}
                    </div>
                  ) : null}

                  <div className="assignment-card__actions">
                    {canCancel ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCancel(assignment)}
                        disabled={cancellingId === assignment.id}
                      >
                        {cancellingId === assignment.id ? 'Cancelando...' : 'Cancelar tarea'}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(assignment)}
                      disabled={deletingId === assignment.id}
                    >
                      {deletingId === assignment.id ? 'Eliminando...' : 'Borrar'}
                    </button>
                  </div>

                  {canReview ? (
                    <form
                      className="assignment-review-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleReview(assignment);
                      }}
                    >
                      <div className="form-group">
                        <label htmlFor={`review-${assignment.id}`} className="form-label">
                          Feedback para el alumno
                        </label>
                        <textarea
                          id={`review-${assignment.id}`}
                          rows="3"
                          value={reviewDrafts[assignment.id] || ''}
                          onChange={(e) =>
                            setReviewDrafts((prev) => ({
                              ...prev,
                              [assignment.id]: e.target.value,
                            }))
                          }
                          placeholder="Comentarios sobre la entrega..."
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm btn-block"
                        disabled={reviewingId === assignment.id}
                      >
                        {reviewingId === assignment.id ? 'Revisando...' : 'Revisar entrega'}
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
