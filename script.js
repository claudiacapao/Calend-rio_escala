document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt',
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '07:30',
      endTime: '18:30',
    },
    events: loadEvents(),
    editable: true,
    eventClick: function (info) {
      const newName = prompt('Trocar com quem?', 'Sónia, Rafael ou André');
      if (newName) {
        info.event.setProp('title', `Remoto - ${newName}`);
        saveEvents(calendar.getEvents());
      }
    }
  });

  calendar.render();

  document.getElementById('remoteRequestForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('remoteName').value;
    const date = document.getElementById('remoteDate').value;
    calendar.addEvent({
      title: `Remoto - ${name}`,
      start: date,
      allDay: true
    });
    saveEvents(calendar.getEvents());
  });

  function saveEvents(events) {
    const saved = events.map(e => ({
      title: e.title,
      start: e.startStr,
      allDay: e.allDay
    }));
    localStorage.setItem('calendarEvents', JSON.stringify(saved));
  }

  function loadEvents() {
    const saved = localStorage.getItem('calendarEvents');
    if (saved) return JSON.parse(saved);
    return generateRemoteDays();
  }

  function generateRemoteDays() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const members = ['Sónia', 'Rafael', 'André'];
    const events = [];

    let memberIndex = 0;
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        if (day % 5 === 0) {
          events.push({
            title: `Remoto - ${members[memberIndex % 3]}`,
            start: date.toISOString().split('T')[0],
            allDay: true
          });
          memberIndex++;
        }
      }
    }

    return events;
  }
});

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Calendário da Equipa', 10, 10);
  const events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  events.forEach((e, i) => {
    doc.text(`${e.start}: ${e.title}`, 10, 20 + i * 10);
  });
  doc.save('calendario-equipa.pdf');
}

function printCalendarAsPDF() {
  html2canvas(document.getElementById('calendar')).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('calendario-visual.pdf');
  });
}
