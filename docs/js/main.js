import { currentYear, currentMonthIdx, monthsNames } from './config.js';
import { subscribeToData } from './db.js';
import { initTrackerUI, updateTrackerList, renderStats, renderHistory, renderDailyChart, renderRecentLog, initNavigation } from './ui.js';
import { initAuth, logoutUser } from './auth.js';

const viewAuth = document.getElementById('view-auth');
const appView = document.getElementById('app-view');
const mainNav = document.getElementById('main-nav');
const headerTitle = document.getElementById('header-title');

initTrackerUI();
initNavigation();

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.onclick = async () => {
        await logoutUser();
        window.location.reload(); 
    };
}

initAuth(
    (user) => {
        if (user && user.uid) {
            if (viewAuth) viewAuth.style.display = 'none';
            if (appView) appView.style.display = 'flex';
            if (mainNav) mainNav.style.display = 'flex';

            if (headerTitle) {
                const firstName = user.displayName ? user.displayName.split(' ')[0] : "USUARIO";
                headerTitle.textContent = `HOLA, ${firstName.toUpperCase()}`;
            }

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
        if (viewAuth) viewAuth.style.display = 'flex';
        if (appView) appView.style.display = 'none';
        if (mainNav) mainNav.style.display = 'none';
    }
);