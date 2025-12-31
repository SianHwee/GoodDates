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
    const overrideBtn = document.getElementById('overrideBtn');
    const overrideContainer = document.getElementById('overrideContainer');
    const applyOverrideBtn = document.getElementById('applyOverrideBtn');

    // Define global arrays for stems and branches for override dropdowns
    const stemsList = ['Jia','Yi','Bing','Ding','Wu','Ji','Geng','Xin','Ren','Gui'];
    const branchesList = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'];

    // Populate override select options on load
    function populateOverrideOptions() {
        const pillars = ['Year','Month','Day','Hour'];
        pillars.forEach(pillar => {
            const stemSelect = document.getElementById(`override${pillar}Stem`);
            const branchSelect = document.getElementById(`override${pillar}Branch`);
            stemsList.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                stemSelect.appendChild(opt);
            });
            branchesList.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b;
                opt.textContent = b;
                branchSelect.appendChild(opt);
            });
        });
    }

    // Toggle override container visibility
    overrideBtn.addEventListener('click', () => {
        overrideContainer.classList.toggle('hidden');
    });

    // Handle applying override
    applyOverrideBtn.addEventListener('click', () => {
        // Gather override values
        const overrideChart = [
            { pillar: 'Year', stem: document.getElementById('overrideYearStem').value, branch: document.getElementById('overrideYearBranch').value },
            { pillar: 'Month', stem: document.getElementById('overrideMonthStem').value, branch: document.getElementById('overrideMonthBranch').value },
            { pillar: 'Day', stem: document.getElementById('overrideDayStem').value, branch: document.getElementById('overrideDayBranch').value },
            { pillar: 'Hour', stem: document.getElementById('overrideHourStem').value, branch: document.getElementById('overrideHourBranch').value }
        ];
        // Save override chart to localStorage
        try {
            localStorage.setItem('baziOverride', JSON.stringify(overrideChart));
        } catch (e) {
            console.warn('Could not save override chart', e);
        }
        // Render override chart
        renderBaZiChart(overrideChart);
        document.getElementById('bazi-section').classList.remove('hidden');
        // Recalculate good dates with same range and activities using override (still placeholder logic)
        // Fetch current form values
        const startDateStr = document.getElementById('startDate').value;
        const endDateStr = document.getElementById('endDate').value;
        const activitiesSelect = document.getElementById('activities');
        const selectedActivities = Array.from(activitiesSelect.selectedOptions).map(opt => opt.value);
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        // Validate dates
        if (!startDateStr || !endDateStr || endDate < startDate) {
            alert('Please ensure start and end dates are selected correctly.');
            return;
        }
        const rangeDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (rangeDays > 92) {
            alert('Please limit your date range to no more than 3 months.');
            return;
        }
        // Generate new placeholder good dates
        const goodDates = generateGoodDates(startDate, endDate, selectedActivities);
        // Update results and explanations
        renderListResults(goodDates, listContainer);
        renderExplanations(goodDates);
        renderCalendarRange(goodDates, calendarContainer, startDate, endDate);
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({behavior:'smooth'});
    });

    // Call population of override options on load
    populateOverrideOptions();

    // ----------------------------------------------------------------------
    // Define metaphysical influences used in the explanation generator. These
    // arrays are referenced by generateReasonForDate() when constructing
    // auspicious or inauspicious reasoning for each date. In a real
    // implementation you would derive these from the Qi Men Dun Jia and BaZi
    // charts. Here we list common terms for demonstration purposes.
    window.qiMenDoors = [
        'Open Door',      // 開門 – brings opportunities and successful ventures
        'Rest Door',      // 休門 – promotes relaxation and recuperation
        'Life Door',      // 生門 – favors growth and prosperity
        'Harm Door',      // 傷門 – associated with minor obstacles
        'Delusion Door',  // 杜門 – may cause confusion or delays
        'Scene Door',     // 景門 – tied to fame and visibility
        'Death Door',     // 死門 – connected to endings or closures
        'Fear Door'       // 驚門 – denotes shocks or disruptions
    ];
    window.qiMenStars = [
        'Chief Star',     // 天蓬 – leadership and authority
        'Surprise Star',  // 天任 – unexpected luck and responsibility
        'Snake Star',     // 天冲 – cunning and strategy
        'Tiger Star',     // 天輔 – bravery and support
        'Pheasant Star',  // 天英 – recognition and honor
        'Tortoise Star',  // 天禽 – hidden or mysterious influences
        'Dragon Star',    // 天心 – intellect and planning
        'Earth Star'      // 天芮 – grounding and stability
    ];
    window.qiMenDeities = [
        'Chief Deity',    // 值符 – order and authority
        'Surprise Deity', // 螣蛇 – surprise and unpredictability
        'Snake Deity',    // 太陰 – introspection and secrets
        'Tiger Deity',    // 白虎 – aggression and caution
        'Pheasant Deity', // 玄武 – communication and networking
        'Tortoise Deity', // 九地 – long term projects and patience
        'Dragon Deity',   // 九天 – ambition and vision
        'Earth Deity'     // 天乙 – protection and blessings
    ];
    window.baziElements = [
        'Wood', 'Fire', 'Earth', 'Metal', 'Water'
    ];

    // Load previously saved profile if available
    loadProfile();

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

        // Save profile information for future visits
        saveProfile({ dob: dobStr, time: timeStr, gender, location });

        // Calculate and render BaZi chart
        const baziChart = calculateBaZi(dobStr, timeStr);
        renderBaZiChart(baziChart);
        document.getElementById('bazi-section').classList.remove('hidden');

        // Generate explanations for each good date/time
        renderExplanations(goodDates);

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
    const results = [];

    // Determine whether trading is among the activities. If so, we will
    // produce entries for every day in the range. Otherwise we will
    // generate a limited number of random dates like before.
    const tradingSelected = activities.includes('trading');
    let numberOfSuggestions;
    if (tradingSelected) {
        numberOfSuggestions = diffDays;
    } else {
        const maxSuggestions = 12;
        if (diffDays <= 7) {
            numberOfSuggestions = Math.min(3, diffDays);
        } else if (diffDays <= 30) {
            numberOfSuggestions = Math.min(6, diffDays);
        } else {
            numberOfSuggestions = Math.min(maxSuggestions, diffDays);
        }
    }
    const selectedDates = new Set();

    // Predefined time slots for demonstration purposes.
    const timeSlots = [
        '05:00–06:30',
        '07:00–08:30',
        '09:00–10:30',
        '11:00–12:30',
        '13:00–14:30',
        '15:00–16:30',
        '17:00–18:30',
        '19:00–20:30',
        '21:00–22:30'
    ];

    // Helper to build hour recommendations for a particular day and set of activities
    function buildHourRecommendations() {
        const hours = [];
        activities.forEach(act => {
            const usedSlots = new Set();
            const slotsNeeded = 3;
            let picks = 0;
            while (picks < slotsNeeded) {
                const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
                if (!usedSlots.has(slot)) {
                    usedSlots.add(slot);
                    hours.push({ activity: act, time: slot });
                    picks++;
                }
            }
        });
        return hours;
    }

    if (tradingSelected) {
        // Provide a suggestion for every day in the range. We also mark
        // certain days as "bad" (to be avoided) at random (10% chance).
        for (let i = 0; i < diffDays; i++) {
            const currentDate = new Date(start.getTime());
            currentDate.setDate(currentDate.getDate() + i);
            const isBad = Math.random() < 0.1;
            results.push({
                date: currentDate,
                reasons: generateReasonForDate(currentDate, activities, isBad),
                hours: buildHourRecommendations(),
                bad: isBad
            });
        }
    } else {
        // Generate a random subset of dates like the original logic
        while (selectedDates.size < numberOfSuggestions) {
            const offset = Math.floor(Math.random() * diffDays);
            const candidate = new Date(start.getTime());
            candidate.setDate(candidate.getDate() + offset);
            const dateKey = candidate.toDateString();
            if (!selectedDates.has(dateKey)) {
                selectedDates.add(dateKey);
                results.push({
                    date: new Date(candidate),
                    reasons: generateReasonForDate(candidate, activities, false),
                    hours: buildHourRecommendations(),
                    bad: false
                });
            }
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
function generateReasonForDate(date, activities, isBad = false) {
    // Convert activity codes to human-readable phrases for inclusion in the message
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
    // Select random metaphysical influences for explanation
    const door = qiMenDoors[Math.floor(Math.random() * qiMenDoors.length)];
    const star = qiMenStars[Math.floor(Math.random() * qiMenStars.length)];
    const deity = qiMenDeities[Math.floor(Math.random() * qiMenDeities.length)];
    const element = baziElements[Math.floor(Math.random() * baziElements.length)];
    if (isBad) {
        // Negative day: caution message. We explicitly tell the user to avoid the selected activities.
        return `Unfavorable influences for ${activitiesList.join(', ')}. Avoid these activities on this day because the ${door} together with the ${star} star and ${deity} clash with your ${element} element.`;
    } else {
        return `Auspicious influences for ${activitiesList.join(', ')} thanks to the ${door}, supported by the ${star} star and ${deity}, all harmonizing with your ${element} element energies.`;
    }
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
        // Add a CSS class for bad days to visually differentiate them
        if (item.bad) {
            li.classList.add('bad-day');
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
 * Save user profile information in localStorage.
 *
 * @param {Object} data - Object containing dob, time, gender and location
 */
function saveProfile(data) {
    try {
        localStorage.setItem('baziProfile', JSON.stringify(data));
        document.getElementById('profileNotice').textContent = 'Profile saved for future visits.';
    } catch (e) {
        console.warn('Could not save profile', e);
    }
}

/**
 * Load user profile information from localStorage and prefill the form.
 */
function loadProfile() {
    const notice = document.getElementById('profileNotice');
    try {
        const data = localStorage.getItem('baziProfile');
        if (data) {
            const profile = JSON.parse(data);
            if (profile.dob) document.getElementById('dob').value = profile.dob;
            if (profile.time) document.getElementById('birthTime').value = profile.time;
            if (profile.gender) document.getElementById('gender').value = profile.gender;
            if (profile.location) document.getElementById('location').value = profile.location;
            notice.textContent = 'Loaded your saved profile. You can update any field if needed.';
        }
        // Load override chart if present
        const override = localStorage.getItem('baziOverride');
        if (override) {
            const chart = JSON.parse(override);
            // Prefill override selects
            chart.forEach(item => {
                const stemSelect = document.getElementById(`override${item.pillar}Stem`);
                const branchSelect = document.getElementById(`override${item.pillar}Branch`);
                if (stemSelect && branchSelect) {
                    stemSelect.value = item.stem;
                    branchSelect.value = item.branch;
                }
            });
            // Display override chart in BaZi section
            renderBaZiChart(chart);
            document.getElementById('bazi-section').classList.remove('hidden');
            document.getElementById('overrideContainer').classList.remove('hidden');
        }
    } catch (e) {
        console.warn('Could not load profile', e);
    }
}

/**
 * Calculate a simplified BaZi (Four Pillars) chart based on date and time of birth.
 * This implementation uses basic modular arithmetic to map date/time to
 * Heavenly stems and Earthly branches. It is for demonstration only.
 *
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @param {string} time - Birth time in HH:MM format
 * @returns {Array<{pillar: string, stem: string, branch: string}>}
 */
function calculateBaZi(dob, time) {
    const stems = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
    const branches = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
    const dateParts = dob.split('-').map(Number);
    const timeParts = time.split(':').map(Number);
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const hour = timeParts[0];
    // Compute indices using offsets (the year 4 corresponds to Jia Zi cycle start of 1984)
    const yearStemIndex = (year - 4) % 10;
    const yearBranchIndex = (year - 4) % 12;
    const monthStemIndex = (month + yearStemIndex) % 10;
    const monthBranchIndex = (month + 1) % 12;
    const dayStemIndex = (day + monthStemIndex) % 10;
    const dayBranchIndex = (day + monthBranchIndex) % 12;
    // Hour pillar: determine branch by two-hour block; stems cycle every 10 hours
    const hourBlock = Math.floor((hour + 1) / 2) % 12;
    const hourStemIndex = (dayStemIndex + hourBlock) % 10;
    const hourBranchIndex = hourBlock;
    return [
        { pillar: 'Year', stem: stems[(yearStemIndex + 10) % 10], branch: branches[(yearBranchIndex + 12) % 12] },
        { pillar: 'Month', stem: stems[(monthStemIndex + 10) % 10], branch: branches[(monthBranchIndex + 12) % 12] },
        { pillar: 'Day', stem: stems[(dayStemIndex + 10) % 10], branch: branches[(dayBranchIndex + 12) % 12] },
        { pillar: 'Hour', stem: stems[(hourStemIndex + 10) % 10], branch: branches[(hourBranchIndex + 12) % 12] }
    ];
}

/**
 * Render the BaZi chart into the designated container.
 *
 * @param {Array<{pillar: string, stem: string, branch: string}>} chart
 */
function renderBaZiChart(chart) {
    const container = document.getElementById('baziChartContainer');
    container.innerHTML = '';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Pillar', 'Heavenly Stem', 'Earthly Branch'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    chart.forEach(item => {
        const row = document.createElement('tr');
        ['pillar', 'stem', 'branch'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = item[key];
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

/**
 * Generate simple explanations for each good date/time and render them in a list.
 *
 * @param {Array<{date: Date, reasons: string, hours: Array<{activity: string, time: string}>}>} goodDates
 */
function renderExplanations(goodDates) {
    const container = document.getElementById('explanations');
    container.innerHTML = '';
    const ul = document.createElement('ul');
    goodDates.forEach(item => {
        const dateStr = item.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        // Build a descriptive explanation. If the day is marked bad, we
        // emphasize avoidance and do not list hours. Otherwise we include
        // recommended time slots for each activity.
        let explanation;
        if (item.bad) {
            explanation = `On ${dateStr}, this is an unfavorable day: ${item.reasons}`;
        } else {
            explanation = `On ${dateStr}, ${item.reasons} Recommended times:`;
            item.hours.forEach(hr => {
                const activityName = generateActivityName(hr.activity);
                explanation += ` ${activityName} between ${hr.time};`;
            });
        }
        const li = document.createElement('li');
        li.textContent = explanation;
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
    // Create sets for good and bad dates for quick lookup. A date is
    // considered bad if it has the `bad` flag; otherwise it is good. When
    // trading is selected, every day will be represented, but only bad
    // days should be highlighted specially in the calendar.
    const goodDateSet = new Set();
    const badDateSet = new Set();
    goodDates.forEach(item => {
        const key = item.date.toDateString();
        if (item.bad) {
            badDateSet.add(key);
        } else {
            goodDateSet.add(key);
        }
    });
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
                    const dateKey = currentDate.toDateString();
                    if (badDateSet.has(dateKey)) {
                        cell.classList.add('bad-date');
                        cell.title = 'Unfavorable day to avoid';
                    } else if (goodDateSet.has(dateKey)) {
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

    // Loop through each month until we surpass end month
    while (current <= last) {
        renderMonth(current);
        // Move to the next month
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
}