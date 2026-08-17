function downloadIcsFile(icsText) {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'schedule.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeIcs(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r/g, '')
    .replace(/\n/g, ' ')
    .trim();
}

function toIcsDateTimeLocal(date) {
  // Format local time as ICS datetime (no UTC conversion, no Z suffix)
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function toIcsUntilLocal(date) {
  // Format UNTIL date in local time with end-of-day timestamp to include classes on final day
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}T235959`;
}

function buildIcsCalendar(events, semesterStart, semesterEnd) {
  const now = new Date();
  const startDate = semesterStart || new Date();
  const endDate = semesterEnd || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 4);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cal Schedule ICS//EN',
    'CALSCALE:GREGORIAN',
  ];

  events.forEach((event, index) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${Date.now()}-${index}@cal-schedule-ics`);
    lines.push(`DTSTAMP:${toIcsDateTimeLocal(now)}`);
    lines.push(`DTSTART:${toIcsDateTimeLocal(eventStart)}`);
    lines.push(`DTEND:${toIcsDateTimeLocal(eventEnd)}`);

    if (event.byday && event.byday.length) {
      lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${event.byday.join(',')};UNTIL=${toIcsUntilLocal(endDate)}`);
    }

    if (event.summary) lines.push(`SUMMARY:${escapeIcs(event.summary)}`);
    if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function extractScheduleEvents(semesterStartInput) {
  const semesterAnchor = new Date(semesterStartInput || Date.now());
  semesterAnchor.setHours(0, 0, 0, 0);

  function normalizeDayCode(dayToken) {
    const value = String(dayToken || '').trim().toLowerCase();
    const map = {
      m: 'MO',
      w: 'WE',
      f: 'FR',
      t: 'TU',      // standalone T
      tu: 'TU',     // Tuesday (2-letter)
      th: 'TH',     // Thursday (2-letter)
    };

    return map[value] || '';
  }

  function extractDayCodes(text) {
    const sanitized = String(text || '').toLowerCase().replace(/[^a-z]/g, '');
    const codes = [];
    let i = 0;

    while (i < sanitized.length) {
      // Check two-letter patterns first: Th and Tu
      if (sanitized.substr(i, 2) === 'th') {
        if (!codes.includes('TH')) codes.push('TH');
        i += 2;
      } else if (sanitized.substr(i, 2) === 'tu') {
        if (!codes.includes('TU')) codes.push('TU');
        i += 2;
      }
      // Check single-letter patterns: M, W, F, T
      else if (sanitized[i] === 'm') {
        if (!codes.includes('MO')) codes.push('MO');
        i += 1;
      } else if (sanitized[i] === 'w') {
        if (!codes.includes('WE')) codes.push('WE');
        i += 1;
      } else if (sanitized[i] === 'f') {
        if (!codes.includes('FR')) codes.push('FR');
        i += 1;
      } else if (sanitized[i] === 't') {
        // Check if this T follows W (meaning it's Thursday in MTWTF pattern)
        if (i > 0 && sanitized[i - 1] === 'w') {
          if (!codes.includes('TH')) codes.push('TH');
        } else {
          // Otherwise, it's Tuesday
          if (!codes.includes('TU')) codes.push('TU');
        }
        i += 1;
      } else {
        // Skip any other character
        i += 1;
      }
    }

    return codes;
  }

  function parseDayLabel(label) {
    const map = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
      su: 0,
      m: 1,
      tu: 2,
      w: 3,
      th: 4,
      f: 5,
      sa: 6,
    };

    const normalized = String(label || '').trim().toLowerCase();
    const first = normalized.slice(0, 3);
    return map[first] ?? 1;
  }

  function parseTime24(timeText) {
    const match = String(timeText || '').match(/(\d{1,2}):(\d{2})(am|pm)/i);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3].toLowerCase();

    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    return { hour, minute };
  }

  function getVisibleText(node) {
    if (!node) return '';

    const visible = node.querySelector('[aria-hidden="true"]');
    if (visible) {
      return visible.innerText || visible.textContent || '';
    }

    const clone = node.cloneNode(true);
    clone.querySelectorAll('.sr-only').forEach((el) => el.remove());
    return clone.innerText || clone.textContent || '';
  }

  const table = document.querySelector('table[aria-labelledby="Registered-table-caption"]');
  if (!table) return [];

  const rows = Array.from(table.querySelectorAll('tbody'))
    .map((tbody) => tbody.querySelector('tr'))
    .filter(Boolean);

  const events = rows
    .map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 10) return null;

      const status = cells[2]?.innerText?.trim() || '';
      const subject = cells[3]?.innerText?.trim() || '';
      const course = cells[4]?.innerText?.trim() || '';
      const component = cells[5]?.innerText?.trim() || '';
      const instructor = cells[7]?.innerText?.trim() || '';

      const scheduleCellRaw = getVisibleText(cells[8]);
      const scheduleCell = scheduleCellRaw
        .replace(/\s+/g, ' ')
        .replace(/\s*[-–]\s*/g, ' - ')
        .trim();

      const locationMatch = scheduleCellRaw.match(/(?:at|in)\s+(.+)$/i) || scheduleCellRaw.match(/-\s*([^\-]+)$/);
      const locationCell = (locationMatch ? locationMatch[1] : 'Berkeley').trim();

      const timeMatch = scheduleCell.match(/(\d{1,2}:\d{2}(?:am|pm))\s*(?:-|to)\s*(\d{1,2}:\d{2}(?:am|pm))/i);
      
      // Extract days only from the portion BEFORE the first time (to avoid location text)
      const daysPortion = timeMatch ? scheduleCell.substring(0, timeMatch.index) : scheduleCell;
      const dayCodes = extractDayCodes(daysPortion);
      
      if (!timeMatch || !dayCodes.length) return null;

      const startTime = parseTime24(timeMatch[1]);
      const endTime = parseTime24(timeMatch[2]);
      if (!startTime || !endTime) return null;

      // Find the earliest occurrence of any class day within the semester
      const dayIndexMap = {
        SU: 0,
        MO: 1,
        TU: 2,
        WE: 3,
        TH: 4,
        FR: 5,
        SA: 6,
      };

      const startDate = new Date(semesterAnchor);
      const endDate = new Date(semesterAnchor);
      const currentDay = startDate.getDay();

      // Calculate days to each class day, pick the minimum (earliest)
      const daysToClass = dayCodes.map((dayCode) => {
        const dayIndex = dayIndexMap[dayCode] ?? 1;
        return (dayIndex - currentDay + 7) % 7;
      });

      const minDays = Math.min(...daysToClass);
      startDate.setDate(startDate.getDate() + minDays);
      endDate.setDate(endDate.getDate() + minDays);
      startDate.setHours(startTime.hour, startTime.minute, 0, 0);
      endDate.setHours(endTime.hour, endTime.minute, 0, 0);

      const title = [subject, course, component].filter(Boolean).join(' ').trim();
      const location = (locationCell.split('-').slice(-1)[0] || 'Berkeley').trim();

      return {
        summary: title || 'Berkeley class',
        location,
        description: [
          `Status: ${status}`,
          `Instructor: ${instructor || 'N/A'}`,
          `Schedule: ${scheduleCell}`,
          `Course: ${subject} ${course}`,
        ].join('\n'),
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        byday: dayCodes,
      };
    })
    .filter(Boolean);

  return events;
}

document.getElementById('runBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // if (!tab?.url || !tab.url.includes('berkeley')) {
  //   alert('Please open the Berkeley schedule page first.');
  //   return;
  // }

  const startInput = document.getElementById('semesterStart');
  const endInput = document.getElementById('semesterEnd');

  if (!startInput.value || !endInput.value) {
    alert('Please choose both a semester start and end date.');
    return;
  }

  const semesterStart = new Date(`${startInput.value}T00:00:00`);
  const semesterEnd = new Date(`${endInput.value}T23:59:59`);

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [semesterStart.toISOString()],
      func: extractScheduleEvents,
    });

    const events = results?.[0]?.result || [];
    if (!events.length) {
      alert('No class rows matched the current schedule table. Check the selectors or the row structure in the page.');
      return;
    }

    const icsContent = buildIcsCalendar(events, semesterStart, semesterEnd);
    downloadIcsFile(icsContent);
  } catch (error) {
    console.error(error);
    alert('Could not parse the schedule. Check the browser console and the row structure.');
  }
});