/*
 * This script provides a simple client‑side implementation for generating
 * placeholder auspicious dates between a user‑selected date range. The
 * logic below does not implement true BaZi or Qi Men Dun Jia calculations;
 * instead it randomly selects a handful of dates within the requested
 * window to illustrate how results could be presented. Developers can
 * replace `generateGoodDates` with real metaphysics computations.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dateForm');
    const resultsSection = document.getElementById('results-section');
    const listContainer = document.getElementById('listResults');
    const calendarContainer = document.getElementById('calendarContainer');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Parse user inputs
        const dobStr = document.getElementById('dob').value;
        const timeStr = document.getElementById('birthTime').value;
        const gender = document.getElementById('gender').value;
        const location = document.getElementById('location').value.trim();
        const activitiesSelect = document.getElementById('activities');
        const selectedActivities = Array.from(activitiesSelect.selectedOptions).map(opt => opt.value);
        const startDateStr = document.getElementById('startDate').value;
        const endDateStr = document.getElementById('endDate').value;

        // Basic validation
        if (!dobStr || !timeStr || !gender || !location || selectedActivities.length === 0 || !startDateStr || !endDateStr) {
            alert('Please fill in all required fields and select at least one activity.');
            return;
        }
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        if (endDate < startDate) {
            alert('End date must be after the start date.');
            return;
        }
        // Enforce a maximum range of 3 months (~92 days). If exceeded, prompt the user.
        const maxRangeDays = 92;
        const rangeDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (rangeDays > maxRangeDays) {
            alert('Please limit your date range to no more than 3 months.');
            return;
        }

        // Generate placeholder good dates including suggested hours
        const goodDates = generateGoodDates(startDate, endDate, selectedActivities);

        // Render results
        renderListResults(goodDates, listContainer);
        renderCalendarRange(goodDates, calendarContainer, startDate, endDate);
        resultsSection.classList.remove('hidden');
        // Scroll to results
        resultsSection.scrollIntoView({behavior: 'smooth'});
    });
});

/**
 * Generate placeholder auspicious dates within the provided range. This
 * demonstration randomly picks up to six unique dates between the start
 * and end dates. Each selected date includes a generic reason based on
 * the user’s chosen activities.
 *
 * @param {Date} start
 * @param {Date} end
 * @param {string[]} activities
 * @returns {Array<{date: Date, reasons: string}>}
 */
function generateGoodDates(start, end, activities) {
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    // Determine how many suggestions to return: roughly one per week if range is long
    const maxSuggestions = 12;
    let numberOfSuggestions;
    if (diffDays <= 7) {
        numberOfSuggestions = Math.min(3, diffDays);
    } else if (diffDays <= 30) {
        numberOfSuggestions = Math.min(6, diffDays);
    } else {
        numberOfSuggestions = Math.min(maxSuggestions, diffDays);
    }

    const selectedDates = new Set();
    const results = [];

    // Predefined time slots for demonstration purposes
    const timeSlots = [
        '09:00–11:00',
        '13:00–15:00',
        '19:00–21:00'
    ];

    // Randomly select dates
    while (selectedDates.size < numberOfSuggestions) {
        const offset = Math.floor(Math.random() * diffDays);
        const candidate = new Date(start.getTime());
        candidate.setDate(candidate.getDate() + offset);
        const dateKey = candidate.toDateString();
        if (!selectedDates.has(dateKey)) {
            selectedDates.add(dateKey);
            // Build hour recommendations per activity
            const hourRecommendations = activities.map(act => {
                const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
                return { activity: act, time: slot };
            });
            results.push({
                date: new Date(candidate),
                reasons: generateReasonForDate(candidate, activities),
                hours: hourRecommendations
            });
        }
    }

    // Sort results chronologically
    results.sort((a, b) => a.date - b.date);
    return results;
}

/**
 * Produce a mock reason string for an auspicious date using activity names.
 * In a real implementation, this would refer to BaZi/Qi Men calculations.
 *
 * @param {Date} date
 * @param {string[]} activities
 * @returns {string}
 */
function generateReasonForDate(date, activities) {
    const activitiesList = activities.map(act => {
        switch (act) {
            case 'marriage': return 'marriage';
            case 'travel': return 'travel';
            case 'move': return 'moving house/office';
            case 'contract': return 'signing a contract';
            case 'business': return 'launching a new business';
            case 'trading': return 'trading or investment';
            case 'health': return 'health matters';
            default: return act;
        }
    });
    return `Favorable for ${activitiesList.join(', ')} activities based on hypothetical Qi Men and BaZi alignment.`;
}

/**
 * Render the list of good dates into the provided container.
 *
 * @param {Array<{date: Date, reasons: string}>} goodDates
 * @param {HTMLElement} container
 */
function renderListResults(goodDates, container) {
    container.innerHTML = '';
    const ul = document.createElement('ul');
    goodDates.forEach(item => {
        const li = document.createElement('li');
        const dateStr = item.date.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
        // Build hours string
        let hoursHtml = '';
        if (item.hours && item.hours.length > 0) {
            hoursHtml = '<ul class="hours-list">';
            item.hours.forEach(hr => {
                const activityName = generateActivityName(hr.activity);
                hoursHtml += `<li><em>${activityName}</em>: ${hr.time}</li>`;
            });
            hoursHtml += '</ul>';
        }
        li.innerHTML = `<strong>${dateStr}</strong>: ${item.reasons}${hoursHtml}`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

/**
 * Convert activity codes to human-readable names matching those in the select list.
 *
 * @param {string} code
 * @returns {string}
 */
function generateActivityName(code) {
    switch (code) {
        case 'marriage': return 'Marriage';
        case 'travel': return 'Travel';
        case 'move': return 'Move House/Office';
        case 'contract': return 'Signing Contract';
        case 'business': return 'Launching New Business';
        case 'trading': return 'Trading/Investment';
        case 'health': return 'Health & Medical';
        default: return code;
    }
}

/**
 * Build a simple calendar for the month of the start date and highlight good dates.
 * Only the month of the start date is shown for simplicity. Good dates outside
 * this month will not appear on the calendar view.
 *
 * @param {Array<{date: Date, reasons: string}>} goodDates
 * @param {HTMLElement} container
 * @param {Date} startDate
 */
function renderCalendar(goodDates, container, startDate) {
    container.innerHTML = '';

    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay(); // 0 = Sunday, ... 6 = Saturday
    const totalDays = lastDay.getDate();

    // Map good dates for quick lookup
    const goodDateMap = {};
    goodDates.forEach(item => {
        const key = item.date.toDateString();
        goodDateMap[key] = true;
    });

    // Create table
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    let dateCounter = 1;
    for (let i = 0; i < 6; i++) { // up to 6 weeks
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (i === 0 && j < firstDayIndex) {
                cell.textContent = '';
            } else if (dateCounter > totalDays) {
                cell.textContent = '';
            } else {
                const currentDate = new Date(year, month, dateCounter);
                cell.textContent = dateCounter;
                const key = currentDate.toDateString();
                if (goodDateMap[key]) {
                    cell.classList.add('good-date');
                    cell.title = 'Favorable day';
                }
                dateCounter++;
            }
            row.appendChild(cell);
        }
        tbody.appendChild(row);
        if (dateCounter > totalDays) {
            break;
        }
    }
    table.appendChild(tbody);
    container.appendChild(table);
}

/**
 * Render calendars for all months within the range [startDate, endDate]. Good dates
 * are highlighted across all months. This replaces the original renderCalendar
 * for multi‑month support.
 *
 * @param {Array<{date: Date}>} goodDates
 * @param {HTMLElement} container
 * @param {Date} startDate
 * @param {Date} endDate
 */
function renderCalendarRange(goodDates, container, startDate, endDate) {
    container.innerHTML = '';
    // Map of date strings for quick lookup
    const goodDateSet = new Set(goodDates.map(item => item.date.toDateString()));
    // Clone start and end to avoid modifying originals
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    // Helper to render one month
    function renderMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayIndex = firstDay.getDay();
        const totalDays = lastDay.getDate();
        const table = document.createElement('table');
        // Month label
        const caption = document.createElement('caption');
        caption.textContent = firstDay.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
        table.appendChild(caption);
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        dayNames.forEach(d => {
            const th = document.createElement('th');
            th.textContent = d;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        let dateCounter = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < firstDayIndex) {
                    cell.textContent = '';
                } else if (dateCounter > totalDays) {
                    cell.textContent = '';
                } else {
                    const currentDate = new Date(year, month, dateCounter);
                    cell.textContent = dateCounter;
                    if (goodDateSet.has(currentDate.toDateString())) {
                        cell.classList.add('good-date');
                        // Optionally add a tooltip indicating there are recommended hours
                        cell.title = 'Favorable day';
                    }
                    dateCounter++;
                }
                row.appendChild(cell);
            }
            tbody.appendChild(row);
            if (dateCounter > totalDays) {
                break;
            }
        }
        table.appendChild(tbody);
        container.appendChild(table);
    }

    // Loop through each month until we surpass end month
    while (current <= last) {
        renderMonth(current);
        // Move to the next month
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
}