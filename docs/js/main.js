import { currentYear, currentMonthIdx, monthsNames } from './config.js';
import { subscribeToData } from './db.js';
import { initTrackerUI, updateTrackerList, renderStats, renderHistory, renderDailyChart, renderRecentLog, initNavigation } from './ui.js';
import { initAuth, logoutUser } from './auth.js'; // Importamos la nueva función de logout

const viewAuth = document.getElementById('view-auth');
const appView = document.getElementById('app-view');
const mainNav = document.getElementById('main-nav');

initTrackerUI();
initNavigation();

// CONFIGURAR BOTÓN LOGOUT (Solo una vez aquí)
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.onclick = async () => {
        try {
            await logoutUser();
            // El observador de initAuth detectará el cambio y ocultará la app automáticamente
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };
}

initAuth(
    (user) => {
        if (user && user.uid) {
            if (viewAuth) viewAuth.style.display = 'none';
            if (appView) appView.style.display = 'flex';
            if (mainNav) mainNav.style.display = 'flex';

            if (document.getElementById('month-display')) {
                document.getElementById('month-display').textContent = monthsNames[currentMonthIdx] + " " + currentYear;
            }

            subscribeToData(user, (data) => {
                const gt = document.getElementById('grand-total');
                if (gt) gt.textContent = data.grandTotal.toFixed(3) + " L";
                updateTrackerList(data.currentMonthCounts);
                renderStats(data.categorySums, data.grandTotal);
                renderHistory(data.monthlySums);
                renderDailyChart(data.dailySums);
                renderRecentLog(data.recentLog);
            });
        }
    },
    () => {
        // Al cerrar sesión, reseteamos la vista
        if (viewAuth) viewAuth.style.display = 'flex';
        if (appView) appView.style.display = 'none';
        if (mainNav) mainNav.style.display = 'none';
        
        // Limpiamos los datos visuales
        const gt = document.getElementById('grand-total');
        if (gt) gt.textContent = "0.000 L";
    }
);