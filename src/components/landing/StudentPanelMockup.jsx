export default function StudentPanelMockup() {
  return (
    <div className="amb-mockup" aria-hidden="true">
      <div className="amb-mockup__topbar">
        <span className="amb-mockup__dot amb-mockup__dot--red" />
        <span className="amb-mockup__dot amb-mockup__dot--yellow" />
        <span className="amb-mockup__dot amb-mockup__dot--green" />
        <span className="amb-mockup__title">Panel del alumno</span>
      </div>

      <div className="amb-mockup__body">
        <p className="amb-mockup__label">Próxima clase</p>
        <h3 className="amb-mockup__class">English B1 · Speaking practice</h3>

        <div className="amb-mockup__row">
          <span>Profesor</span>
          <strong>Sarah M.</strong>
        </div>
        <div className="amb-mockup__row">
          <span>Fecha</span>
          <strong>Mar 18 · 18:30</strong>
        </div>

        <button type="button" className="amb-btn amb-btn--primary amb-btn--block">
          Entrar a clase
        </button>

        <div className="amb-mockup__materials">
          <p>Materiales de hoy</p>
          <ul>
            <li>Unit 4 · Vocabulary</li>
            <li>Listening worksheet</li>
            <li>Homework PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
