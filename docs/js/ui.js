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
                <div class="drink-info"><span class="drink-name">${item.name}</span><span class="drink-vol-total"> ${count > 0 ? totalLitersItem + ' L' : ''}</span></div>
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

// ESTADÍSTICAS GLOBALES (Resumen Año)
export function renderStats(categorySums, grandTotal) {
    const container = document.getElementById('stats-container');
    if (!container) return;
    container.innerHTML = '';
    const stats = [
        { label: 'Cervezas', val: categorySums.beers || 0, css: 'fill-beers' },
        { label: 'Cubatas', val: categorySums.spirits || 0, css: 'fill-spirits' },
        { label: 'Chupitos', val: categorySums.shots || 0, css: 'fill-shots' },
        { label: 'Vinos/Otros', val: categorySums.others || 0, css: 'fill-others' }
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

// EVOLUCIÓN DIARIA (Hasta el día de hoy con barras horizontales)
export function renderDailyChart(dailySums) {
    const container = document.getElementById('daily-chart');
    const label = document.getElementById('daily-month-name');
    if (!container || !label) return;
    
    container.innerHTML = '';
    label.textContent = monthsNames[currentMonthIdx];

    const today = new Date().getDate();
    const maxVal = Math.max(...dailySums.slice(0, today), 0.1);

    for (let i = 0; i < today; i++) {
        const v = dailySums[i] || 0;
        const pct = (v / maxVal) * 100;
        const isToday = (i + 1) === today;
        
        const div = document.createElement('div');
        div.className = 'stat-row';
        div.innerHTML = `
            <div class="stat-header">
                <span style="${isToday ? 'color:var(--success); font-weight:bold;' : ''}">Día ${i + 1} ${isToday ? '(Hoy)' : ''}</span>
                <span class="stat-val">${v.toFixed(2)} L</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill ${isToday ? 'fill-today' : 'fill-daily'}" style="width: ${pct}%"></div>
            </div>`;
        container.appendChild(div);
    }
}

// HISTORIAL CON DESGLOSE Y BORDES REDONDEADOS
export function renderHistory(monthlySums) {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = '';
    const sortedIdx = Object.keys(monthlySums).sort((a, b) => b - a);

    sortedIdx.forEach(idx => {
        const data = monthlySums[idx];
        const totalL = data.total || 0;
        const isCurrentMonth = parseInt(idx) === currentMonthIdx;

        if (totalL > 0 || parseInt(idx) <= currentMonthIdx) {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            item.style.borderRadius = "12px";
            item.style.border = "1px solid var(--border)";
            item.style.marginBottom = "10px";
            item.style.overflow = "hidden";

            const breakdownHtml = Object.entries(data.breakdown || {})
                .filter(([_, qty]) => qty > 0)
                .map(([name, qty]) => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 20px; font-size: 0.85rem; border-bottom: 1px solid #222; color: var(--text-dim);">
                        <span>${name}</span>
                        <span>${qty} uds</span>
                    </div>`).join('');

            item.innerHTML = `
                <div class="history-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; cursor: pointer; background: #1a1a1a; border-radius: 12px;">
                    <span class="month-name">${monthsNames[idx]} ${isCurrentMonth ? '(Actual)' : ''}</span>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="month-total" style="font-weight: bold; color: var(--accent);"> ${totalL.toFixed(3)} L</span>
                        <span class="material-symbols-rounded arrow" style="font-size:18px; transition: transform 0.3s;">expand_more</span>
                    </div>
                </div>
                <div class="history-details" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; background: #121212;">
                    ${breakdownHtml || '<div style="padding:15px; text-align:center; font-size:0.8rem; color:#666;">Sin registros detallados</div>'}
                </div>`;

            const header = item.querySelector('.history-header');
            const details = item.querySelector('.history-details');
            const arrow = item.querySelector('.arrow');

            header.onclick = () => {
                const isOpen = details.style.maxHeight !== "0px" && details.style.maxHeight !== "";
                details.style.maxHeight = isOpen ? "0px" : "600px";
                arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
                // Ajuste dinámico del radio inferior al abrir/cerrar
                header.style.borderRadius = isOpen ? "12px" : "12px 12px 0 0";
            };
            container.appendChild(item);
        }
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