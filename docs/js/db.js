import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, where, Timestamp, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { currentYear, currentMonthIdx } from './config.js';

let unsubscribe = null;
let currentUserName = null;

const getConsumoRef = (userName) => collection(db, "usuarios", userName, "consumo");

export async function addDrinkToDb(typeId, name, volume, category) {
    if (!currentUserName) return;
    try {
        await addDoc(getConsumoRef(currentUserName), {
            typeId, name, category, litros: volume,
            fecha: Timestamp.now(), year: currentYear, month: currentMonthIdx
        });
    } catch (e) { console.error(e); }
}

export async function removeLastDrinkFromDb(typeId) {
    if (!currentUserName) return;
    try {
        const q = query(getConsumoRef(currentUserName), 
            where("year", "==", currentYear), 
            where("month", "==", currentMonthIdx), 
            where("typeId", "==", typeId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docs = snapshot.docs.sort((a, b) => b.data().fecha.toMillis() - a.data().fecha.toMillis());
            await deleteDoc(doc(db, "usuarios", currentUserName, "consumo", docs[0].id));
        }
    } catch (e) { console.error(e); }
}

export async function subscribeToData(user, onDataUpdate) {
    if (!user || !user.uid) return;

    // Buscamos el nombre asociado al UID
    const qUser = query(collection(db, "usuarios"), where("uid", "==", user.uid));
    const userSnap = await getDocs(qUser);
    
    if (!userSnap.empty) {
        currentUserName = userSnap.docs[0].id;
    } else {
        currentUserName = user.uid;
    }

    if (unsubscribe) unsubscribe();

    const q = query(getConsumoRef(currentUserName), where("year", "==", currentYear));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
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
            if (data.month === currentMonthIdx) {
                if (!currentMonthCounts[data.typeId]) currentMonthCounts[data.typeId] = 0;
                currentMonthCounts[data.typeId]++;
                const day = dateObj.getDate();
                dailySums[day - 1] += data.litros;
                recentLog.push({ id: doc.id, day, hour: dateObj.getHours().toString().padStart(2, '0') + ':' + dateObj.getMinutes().toString().padStart(2, '0'), name: data.name, vol: data.litros });
            }
        });
        recentLog.sort((a, b) => (a.day !== b.day) ? b.day - a.day : b.hour.localeCompare(a.hour));
        onDataUpdate({ grandTotal, currentMonthCounts, monthlySums, categorySums, dailySums, recentLog });
    });
}