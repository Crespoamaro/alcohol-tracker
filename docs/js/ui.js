import { addDrinkToDb, removeLastDrinkFromDb } from './db.js';
import { DRINK_CATALOG, monthsNames, currentMonthIdx } from './config.js';

// 1. PINTAR TRACKER (Botones + -)
export function initTrackerUI() {
    const container = document.getElementById('tracker-container');
    container.innerHTML = ''; 
    for (const [catKey, catData] of Object.entries(DRINK_CATALOG)) {
        const section = document.createElement('section');
        section.className = 'category-group';
        section.innerHTML = `
            <div class="group-header" onclick="this.nextElementSibling.classList.toggle('expanded'); this.classList.toggle('open');">
                <h3>${catData.title}</h3><span class="material-symbols-rounded arrow">expand_more</span>
            </div>
            <div id="list-${catKey}" class="drink-list"></div>`;
        container.appendChild(section);
    }
}

export function updateTrackerList(currentMonthCounts) {
    for (const [catKey, catData] of Object.entries(DRINK_CATALOG)) {
        const listContainer = document.getElementById(`list-${catKey}`);
        listContainer.innerHTML = '';
        catData.items.forEach(item => {
            const count = currentMonthCounts[item.id] || 0;
            const totalLitersItem = (count * item.vol).toFixed(2);
            const row = document.createElement('div');
            row.className = 'drink-row';
            row.innerHTML = `
                <div class="drink-info"><span class="drink-name">${item.name}</span><span class="drink-vol-total">${count > 0 ? totalLitersItem + ' L' : ''}</span></div>
                <div class="drink-controls">
                    <button class="btn-ctrl btn-minus"><span class="material-symbols-rounded">remove</span></button>
                    <span class="count-display ${count > 0 ? 'has-items' : ''}">${count}</span>
                    <button class="btn-ctrl btn-plus"><span class="material-symbols-rounded">add</span></button>
                </div>`;
            row.querySelector('.btn-plus').onclick = (e) => { e.stopPropagation(); addDrinkToDb(item.id, item.name, item.vol, catKey); };
            row.querySelector('.btn-minus').onclick = (e) => { e.stopPropagation(); removeLastDrinkFromDb(item.id); };
            listContainer.appendChild(row);
        });
    }
}

// 2. HISTORIAL: ANUAL
export function renderStats(categorySums, grandTotal) {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';
    const cats = [
        { label: 'Cervezas', val: categorySums.beers, css: 'fill-beers' },
        { label: 'Cubatas', val: categorySums.spirits, css: 'fill-spirits' },
        { label: 'Chupitos', val: categorySums.shots, css: 'fill-shots' },
        { label: 'Vinos/Otros', val: categorySums.others, css: 'fill-others' }
    ];
    cats.forEach(cat => {
        const percent = grandTotal > 0 ? (cat.val / grandTotal) * 100 : 0;
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `<div class="stat-header"><span>${cat.label}</span><span class="stat-val">${cat.val.toFixed(2)} L (${Math.round(percent)}%)</span></div><div class="progress-bg"><div class="progress-fill ${cat.css}" style="width: ${percent}%"></div></div>`;
        container.appendChild(row);
    });
}

export function renderHistory(monthlySums) {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    monthlySums.forEach((total, index) => {
        if (total > 0 || index <= currentMonthIdx) {
            const card = document.createElement('div');
            card.className = `history-card ${index === currentMonthIdx ? 'current' : ''}`;
            card.innerHTML = `<div class="month-name">${monthsNames[index]}</div><div class="month-total">${total.toFixed(3)} L</div>`;
            container.appendChild(card);
        }
    });
}

// 3. HISTORIAL: DIARIO (GRÁFICA Y LOG)
export function renderDailyChart(dailySums) {
    const container = document.getElementById('daily-chart');
    container.innerHTML = '';
    document.getElementById('daily-month-name').textContent = monthsNames[currentMonthIdx];

    const maxVal = Math.max(...dailySums, 0.5); 
    const today = new Date().getDate();
    
    dailySums.slice(0, today).forEach((val, index) => {
        const heightPercent = (val / maxVal) * 100;
        const bar = document.createElement('div');
        bar.className = 'bar-group';
        bar.innerHTML = `
            <span class="bar-val">${val > 0 ? val.toFixed(1) : ''}</span>
            <div class="bar-visual ${val > 0 ? 'active' : ''}" style="height: ${Math.max(heightPercent, 5)}%"></div>
            <span class="bar-day">${index + 1}</span>
        `;
        container.appendChild(bar);
    });
    setTimeout(() => { container.scrollLeft = container.scrollWidth; }, 100);
}

export function renderRecentLog(recentLog) {
    const container = document.getElementById('recent-log-list');
    container.innerHTML = '';
    if (recentLog.length === 0) {
        container.innerHTML = '<div class="empty-msg">Sin tragos este mes.</div>';
        return;
    }
    recentLog.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
            <div class="log-date">Día ${log.day}<br><small>${log.hour}</small></div>
            <div class="log-desc">${log.name}</div>
            <div class="log-vol">${log.vol} L</div>
        `;
        container.appendChild(item);
    });
}

// 4. GESTIÓN DE PESTAÑAS
export function initNavigation() {
    const btnTracker = document.getElementById('nav-tracker');
    const btnHistory = document.getElementById('nav-history');
    
    btnTracker.onclick = () => {
        document.getElementById('view-tracker').style.display = 'block';
        document.getElementById('view-history').style.display = 'none';
        btnTracker.classList.add('active'); btnHistory.classList.remove('active');
        document.getElementById('header-title').innerText = "CONTROL MENSUAL";
    };

    btnHistory.onclick = () => {
        document.getElementById('view-tracker').style.display = 'none';
        document.getElementById('view-history').style.display = 'block';
        btnTracker.classList.remove('active'); btnHistory.classList.add('active');
        document.getElementById('header-title').innerText = "HISTORIAL AÑO";
    };

    const btnSubYear = document.getElementById('btn-sub-year');
    const btnSubMonth = document.getElementById('btn-sub-month');
    const viewSubYear = document.getElementById('subview-year');
    const viewSubMonth = document.getElementById('subview-month');

    btnSubYear.onclick = () => {
        viewSubYear.style.display = 'block'; viewSubMonth.style.display = 'none';
        btnSubYear.classList.add('active'); btnSubMonth.classList.remove('active');
    };
    btnSubMonth.onclick = () => {
        viewSubYear.style.display = 'none'; viewSubMonth.style.display = 'block';
        btnSubYear.classList.remove('active'); btnSubMonth.classList.add('active');
        setTimeout(() => { 
            const chart = document.getElementById('daily-chart');
            chart.scrollLeft = chart.scrollWidth; 
        }, 50);
    };
}