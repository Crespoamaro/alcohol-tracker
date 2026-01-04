import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, where, Timestamp, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { currentYear, currentMonthIdx } from './config.js';

// AÑADIR BEBIDA
export async function addDrinkToDb(typeId, name, volume, category) {
    try {
        await addDoc(collection(db, "consumo"), {
            typeId, name, category, litros: volume,
            fecha: Timestamp.now(), year: currentYear, month: currentMonthIdx
        });
    } catch (e) { console.error(e); }
}

// BORRAR ÚLTIMA
export async function removeLastDrinkFromDb(typeId) {
    try {
        const q = query(collection(db, "consumo"), where("year", "==", currentYear), where("month", "==", currentMonthIdx), where("typeId", "==", typeId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docs = snapshot.docs.sort((a, b) => b.data().fecha.toMillis() - a.data().fecha.toMillis());
            await deleteDoc(doc(db, "consumo", docs[0].id));
        } else { alert("No hay registros para borrar."); }
    } catch (e) { console.error(e); }
}

export function subscribeToData(onDataUpdate) {
    const q = query(collection(db, "consumo"), where("year", "==", currentYear));

    return onSnapshot(q, (snapshot) => {
        let grandTotal = 0;
        let currentMonthCounts = {}; 
        let monthlySums = new Array(12).fill(0);
        let categorySums = { beers: 0, spirits: 0, shots: 0, others: 0 };
        
        let dailySums = new Array(31).fill(0);
        let recentLog = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            const dateObj = data.fecha.toDate();
            
            grandTotal += data.litros;
            if (data.month >= 0 && data.month <= 11) monthlySums[data.month] += data.litros;
            if (categorySums[data.category] !== undefined) categorySums[data.category] += data.litros;

            // Procesar solo si es del MES ACTUAL
            if (data.month === currentMonthIdx) {
                // 1. Botones Tracker
                if (!currentMonthCounts[data.typeId]) currentMonthCounts[data.typeId] = 0;
                currentMonthCounts[data.typeId]++;
                
                // 2. Gráfica Diaria
                const day = dateObj.getDate();
                dailySums[day - 1] += data.litros;

                // 3. Log Detallado (Formato hora HH:MM)
                recentLog.push({
                    id: doc.id,
                    day: day,
                    hour: dateObj.getHours().toString().padStart(2, '0') + ':' + dateObj.getMinutes().toString().padStart(2, '0'),
                    name: data.name,
                    vol: data.litros
                });
            }
        });

        // Ordenar log: Primero por día (desc), luego por hora (desc)
        recentLog.sort((a, b) => {
            if (a.day !== b.day) return b.day - a.day;
            return b.hour.localeCompare(a.hour);
        });

        onDataUpdate({ grandTotal, currentMonthCounts, monthlySums, categorySums, dailySums, recentLog });
    });
}