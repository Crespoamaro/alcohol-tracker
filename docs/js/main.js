import { currentYear, currentMonthIdx, monthsNames } from './config.js';
import { subscribeToData } from './db.js';
import { initTrackerUI, updateTrackerList, renderStats, renderHistory, renderDailyChart, renderRecentLog, initNavigation } from './ui.js';

document.getElementById('month-display').textContent = monthsNames[currentMonthIdx] + " " + currentYear;

initTrackerUI();
initNavigation();

// Conectar DB
subscribeToData((data) => {
    // 1. Cabecera
    document.getElementById('grand-total').textContent = data.grandTotal.toFixed(3) + " L";
    
    // 2. Tracker
    updateTrackerList(data.currentMonthCounts);
    
    // 3. Historial (Anual)
    renderStats(data.categorySums, data.grandTotal);
    renderHistory(data.monthlySums);

    // 4. Historial (Mensual Diario)
    renderDailyChart(data.dailySums);
    renderRecentLog(data.recentLog);
});