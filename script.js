/**
 * Dashboard Arbeláez v3.1 - Sincronización Total
 */

// --- 1. CONFIGURACIÓN DE GRÁFICAS ---
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { 
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 11 } }
        },
        x: { 
            grid: { display: false },
            ticks: { font: { size: 11 } }
        }
    },
    plugins: { 
        legend: { display: false } 
    }
};

// Gráfica Temperatura
const tempCtx = document.getElementById('tempChart').getContext('2d');
const chartT = new Chart(tempCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temp °C',
            data: [],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 2
        }]
    },
    options: commonOptions
});

// Gráfica Humedad
const humCtx = document.getElementById('humChart').getContext('2d');
const chartH = new Chart(humCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Hum %',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 2
        }]
    },
    options: commonOptions
});

// --- 2. FUNCIÓN CARGAR HISTORIAL (DB) ---
async function cargarHistorial() {
    console.log("Intentando leer MariaDB...");
    try {
        const response = await fetch('get_data.php');
        const result = await response.json();

        if (result.status === "success") {
            // Limpiar datos previos antes de cargar el historial
            chartT.data.labels = []; chartT.data.datasets[0].data = [];
            chartH.data.labels = []; chartH.data.datasets[0].data = [];

            // Llenar Temperatura
            result.temp_history.forEach(item => {
                const hora = new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                chartT.data.labels.push(hora);
                chartT.data.datasets[0].data.push(item.valor);
            });

            // Llenar Humedad
            result.hum_history.forEach(item => {
                const hora = new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                chartH.data.labels.push(hora);
                chartH.data.datasets[0].data.push(item.valor);
            });

            // Actualizar textos informativos
            if (chartT.data.datasets[0].data.length > 0) {
                const ultimaT = chartT.data.datasets[0].data[chartT.data.datasets[0].data.length - 1];
                document.getElementById('temp-value').innerText = ultimaT.toFixed(1) + '°C';
            }
            if (chartH.data.datasets[0].data.length > 0) {
                const ultimaH = chartH.data.datasets[0].data[chartH.data.datasets[0].data.length - 1];
                document.getElementById('hum-value').innerText = ultimaH.toFixed(0) + '%';
            }

            chartT.update();
            chartH.update();
            console.log("✅ Historial cargado de MariaDB");
        }
    } catch (error) {
        console.error("❌ Error en get_data.php:", error);
    }
}

// --- 3. CONEXIÓN MQTT (TIEMPO REAL) ---
const brokerIP = "192.168.101.12"; 
const brokerPort = 8073;
const client = new Paho.MQTT.Client(brokerIP, brokerPort, "web_v3_" + Math.random().toString(16).substr(2, 4));

client.onMessageArrived = (message) => {
    const topic = message.destinationName;
    let valor;
    
    // Intentar parsear el JSON del ESP32
    try {
        const json = JSON.parse(message.payloadString);
        valor = json.val;
    } catch(e) {
        valor = parseFloat(message.payloadString);
    }

    if (isNaN(valor)) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Lógica para el tópico de temperatura
    if (topic === "esp32/temperatura") {
        document.getElementById('temp-value').innerText = valor.toFixed(1) + '°C';
        chartT.data.labels.push(now);
        chartT.data.datasets[0].data.push(valor);
        
        // Mantener solo los últimos 15 puntos para fluidez
        if (chartT.data.labels.length > 15) {
            chartT.data.labels.shift();
            chartT.data.datasets[0].data.shift();
        }
        chartT.update();
    }
    
    // Lógica para el tópico de humedad
    if (topic === "esp32/humedad") {
        document.getElementById('hum-value').innerText = valor.toFixed(0) + '%';
        chartH.data.labels.push(now);
        chartH.data.datasets[0].data.push(valor);
        
        if (chartH.data.labels.length > 15) {
            chartH.data.labels.shift();
            chartH.data.datasets[0].data.shift();
        }
        chartH.update();
    }
};

client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
        console.log("Conexión MQTT perdida: " + responseObject.errorMessage);
        document.getElementById('mqtt-dot').style.background = "#ef4444";
        document.getElementById('mqtt-text').innerText = "Desconectado";
    }
};

client.connect({
    userName: "sensor",
    password: "sensor123",
    onSuccess: () => {
        console.log("🚀 MQTT Conectado");
        client.subscribe("esp32/temperatura");
        client.subscribe("esp32/humedad");
        document.getElementById('mqtt-dot').style.background = "#10b981";
        document.getElementById('mqtt-text').innerText = "Tiempo Real Activo";
    },
    onFailure: (e) => {
        console.error("Fallo conexión MQTT:", e);
        document.getElementById('mqtt-dot').style.background = "#ef4444";
        document.getElementById('mqtt-text').innerText = "Error MQTT";
    }
});

// Ejecutar carga de base de datos al iniciar
cargarHistorial();
