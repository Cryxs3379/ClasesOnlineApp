import { useMemo, useState } from 'react';

function toDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default function MiniCalendar({ classes = [] }) {
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const days = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 30; i += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      result.push({
        key: toDateKey(date),
        label: date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
        }),
      });
    }
    return result;
  }, []);

  const classesByDay = useMemo(() => {
    return classes.reduce((acc, item) => {
      const key = toDateKey(item.start_time);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [classes]);

  const selectedClasses = classesByDay[selectedDate] || [];

  return (
    <div className="mini-calendar card">
      <div className="mini-calendar__days">
        {days.map((day) => {
          const hasClass = Boolean(classesByDay[day.key]?.length);
          return (
            <button
              key={day.key}
              type="button"
              className={`mini-calendar__day ${selectedDate === day.key ? 'active' : ''} ${hasClass ? 'has-class' : ''}`}
              onClick={() => setSelectedDate(day.key)}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <div className="mini-calendar__list">
        <h3>Clases del día</h3>
        {selectedClasses.length === 0 ? (
          <p className="muted">No hay clases este día.</p>
        ) : (
          selectedClasses.map((item) => (
            <div key={item.id} className="mini-calendar__item">
              <strong>{item.title}</strong>
              <span>
                {new Date(item.start_time).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
