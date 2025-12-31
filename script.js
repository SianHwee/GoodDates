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

        // Generate placeholder good dates
        const goodDates = generateGoodDates(startDate, endDate, selectedActivities);

        // Render results
        renderListResults(goodDates, listContainer);
        renderCalendar(goodDates, calendarContainer, startDate);
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
    const numberOfSuggestions = Math.min(6, diffDays); // maximum suggestions equal to range length but not more than 6
    const selectedDates = new Set();
    const results = [];

    // Randomly select dates
    while (selectedDates.size < numberOfSuggestions) {
        const offset = Math.floor(Math.random() * diffDays);
        const candidate = new Date(start.getTime());
        candidate.setDate(candidate.getDate() + offset);
        const dateKey = candidate.toDateString();
        if (!selectedDates.has(dateKey)) {
            selectedDates.add(dateKey);
            results.push({
                date: new Date(candidate),
                reasons: generateReasonForDate(candidate, activities)
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
        li.innerHTML = `<strong>${dateStr}</strong>: ${item.reasons}`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
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