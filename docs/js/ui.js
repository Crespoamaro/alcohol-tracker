import { addDrinkToDb, removeLastDrinkFromDb } from './db.js';
import { DRINK_CATALOG, monthsNames, currentMonthIdx } from './config.js';

export function initTrackerUI() {
    const container = document.getElementById('tracker-container');
    if (!container) return;
    container.innerHTML = ''; 

    for (const [catKey, catData] of Object.entries(DRINK_CATALOG)) {
        const section = document.createElement('section');
        section.className = 'category-group';
        section.innerHTML = `
            <div class="group-header">
                <h3>${catData.title}</h3>
                <span class="material-symbols-rounded arrow">expand_more</span>
            </div>
            <div id="list-${catKey}" class="drink-list"></div>
        `;
        const header = section.querySelector('.group-header');
        const list = section.querySelector('.drink-list');
        header.onclick = () => {
            const isOpen = list.classList.toggle('expanded');
            header.classList.toggle('open', isOpen);
        };
        container.appendChild(section);
    }
}

export function updateTrackerList(currentMonthCounts) {
    for (const [catKey, catData] of Object.entries(DRINK_CATALOG)) {
        const listContainer = document.getElementById(`list-${catKey}`);
        if (!listContainer) continue;
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

export function renderStats(categorySums, grandTotal) {
    const container = document.getElementById('stats-container');
    if (!container) return;
    container.innerHTML = '';
    const stats = [
        { label: 'Cervezas', val: categorySums.beers, css: 'fill-beers' },
        { label: 'Cubatas', val: categorySums.spirits, css: 'fill-spirits' },
        { label: 'Chupitos', val: categorySums.shots, css: 'fill-shots' },
        { label: 'Vinos/Otros', val: categorySums.others, css: 'fill-others' }
    ];
    stats.forEach(s => {
        const pct = grandTotal > 0 ? (s.val / grandTotal) * 100 : 0;
        const div = document.createElement('div');
        div.className = 'stat-row';
        div.innerHTML = `
            <div class="stat-header"><span>${s.label}</span><span class="stat-val">${s.val.toFixed(2)} L</span></div>
            <div class="progress-bg"><div class="progress-fill ${s.css}" style="width: ${pct}%"></div></div>`;
        container.appendChild(div);
    });
}

export function renderHistory(monthlySums) {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = '';
    monthlySums.forEach((total, idx) => {
        if (total > 0 || idx <= currentMonthIdx) {
            const card = document.createElement('div');
            card.className = `history-card ${idx === currentMonthIdx ? 'current' : ''}`;
            card.innerHTML = `<span class="month-name">${monthsNames[idx]}</span><span class="month-total">${total.toFixed(3)} L</span>`;
            container.appendChild(card);
        }
    });
}

export function renderDailyChart(dailySums) {
    const container = document.getElementById('daily-chart');
    const label = document.getElementById('daily-month-name');
    if (!container || !label) return;
    container.innerHTML = '';
    label.textContent = monthsNames[currentMonthIdx];
    const max = Math.max(...dailySums, 0.5);
    dailySums.forEach((v, i) => {
        const bar = document.createElement('div');
        bar.className = 'bar-group';
        bar.innerHTML = `<span class="bar-val">${v > 0 ? v.toFixed(1) : ''}</span><div class="bar-visual ${v > 0 ? 'active' : ''}" style="height: ${(v/max)*100}%"></div><span class="bar-day">${i+1}</span>`;
        container.appendChild(bar);
    });
}

export function renderRecentLog(log) {
    const container = document.getElementById('recent-log-list');
    if (!container) return;
    container.innerHTML = log.map(l => `
        <div class="drink-row">
            <div>Día ${l.day} - ${l.hour}<br><small>${l.name}</small></div>
            <div style="color:var(--success); font-weight:bold;">${l.vol} L</div>
        </div>`).join('') || '<div class="empty-msg">No hay registros este mes.</div>';
}

export function initNavigation() {
    const btnT = document.getElementById('nav-tracker');
    const btnH = document.getElementById('nav-history');
    btnT.onclick = () => {
        document.getElementById('view-tracker').style.display = 'block';
        document.getElementById('view-history').style.display = 'none';
        btnT.classList.add('active'); btnH.classList.remove('active');
        document.getElementById('header-title').innerText = "CONTROL MENSUAL";
    };
    btnH.onclick = () => {
        document.getElementById('view-tracker').style.display = 'none';
        document.getElementById('view-history').style.display = 'block';
        btnT.classList.remove('active'); btnH.classList.add('active');
        document.getElementById('header-title').innerText = "HISTORIAL AÑO";
    };
    document.getElementById('btn-sub-year').onclick = () => {
        document.getElementById('subview-year').style.display = 'block';
        document.getElementById('subview-month').style.display = 'none';
        document.getElementById('btn-sub-year').classList.add('active');
        document.getElementById('btn-sub-month').classList.remove('active');
    };
    document.getElementById('btn-sub-month').onclick = () => {
        document.getElementById('subview-year').style.display = 'none';
        document.getElementById('subview-month').style.display = 'block';
        document.getElementById('btn-sub-year').classList.remove('active');
        document.getElementById('btn-sub-month').classList.add('active');
    };
}