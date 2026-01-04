export const currentYear = new Date().getFullYear();
export const currentMonthIdx = new Date().getMonth(); // 0 = Enero
export const monthsNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// CATÁLOGO DE BEBIDAS
export const DRINK_CATALOG = {
    beers: {
        title: "🍺 Cervezas",
        items: [
            { id: 'litrona', name: 'Litrona', vol: 1.00 },
            { id: 'jarra', name: 'Jarra', vol: 0.50 },
            { id: 'tercio', name: 'Tercio', vol: 0.33 },
            { id: 'lata', name: 'Lata', vol: 0.33 },
            { id: 'botellin', name: 'Botellín', vol: 0.25 }
        ]
    },
    spirits: {
        title: "🥃 Cubatas (50ml)",
        items: [
            { id: 'ron', name: 'Ron', vol: 0.05 },
            { id: 'whisky', name: 'Whisky', vol: 0.05 },
            { id: 'copa_jager', name: 'Copa Jäger', vol: 0.05 },
            { id: 'vodka', name: 'Vodka', vol: 0.05 },
            { id: 'ginebra', name: 'Ginebra', vol: 0.05 },
            { id: 'cubata_otro', name: 'Otros', vol: 0.05 }
        ]
    },
    shots: {
        title: "🧪 Chupitos (25ml)",
        items: [
            { id: 'jager', name: 'Jägermeister', vol: 0.025 },
            { id: 'tequila', name: 'Tequila', vol: 0.025 },
            { id: 'vodka_shot', name: 'Vodka', vol: 0.025 },
            { id: 'fireball', name: 'Fireball', vol: 0.025 },
            { id: 'pacharan', name: 'Pacharán', vol: 0.025 },
            { id: 'hierbas', name: 'Hierbas', vol: 0.025 },
            { id: 'crema_orujo', name: 'Crema Orujo', vol: 0.025 },
            { id: 'anis', name: 'Anís', vol: 0.025 },
            { id: 'ron_miel', name: 'Ron Miel', vol: 0.025 },
            { id: 'chupito_otro', name: 'Otros', vol: 0.025 }
        ]
    },
    others: {
        title: "🍷 Vinos y Cócteles",
        items: [
            { id: 'vino', name: 'Vino (Copa)', vol: 0.15 },
            { id: 'coctel', name: 'Cóctel', vol: 0.25 }
        ]
    }
};