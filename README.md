# Lectura-de-Humedad-y-temperatura.
Se hace dearrollo de una API Full REST aplicada a IOT tomando lecturas de Humedad y temperatura, la idea es hacer que las personas interesadas en realizar proyectos de IoT tenga una forma facil de implementar desde la lectura de datos en Arduino hasta la visualización en una Pagina Webb, el acceso a una base de datos y puedan descargar sus archivos.

🛰️ Estación Climática IoT Arbeláez

Este proyecto consiste en un sistema de monitoreo meteorológico que captura temperatura y humedad mediante un sensor DHT11 conectado a un ESP32, almacena los datos en una base de datos MariaDB y los visualiza en un Dashboard Web dinámico en tiempo real.

🚀 Características principales

Monitoreo Dual: Visualización de temperatura y humedad en gráficas independientes.

Historial Persistente: Recuperación automática de las últimas 15 lecturas desde la base de datos al cargar la página.

Tiempo Real: Actualización instantánea vía MQTT (WebSockets).

Reportes: Botones de descarga para exportar el historial completo a formato CSV (Excel).

Arquitectura Robusta: Basada en contenedores Docker para facilitar el despliegue.

🏗️ Arquitectura del Sistema

El sistema se divide en cuatro capas principales:

Hardware (ESP32): Envía datos formateados en JSON cada 10 segundos al broker.

Broker (EMQX): Recibe los mensajes y activa reglas para enviarlos a la base de datos y al cliente web.

Backend (PHP):

save_data.php: Procesa la entrada de datos del broker hacia MariaDB.

get_data.php: Alimenta las gráficas iniciales del dashboard.

export_csv.php: Genera los reportes descargables.

Frontend (Dashboard): Interfaz responsiva construida con HTML5, CSS3, Chart.js y Paho MQTT Client.

🛠️ Requisitos e Instalación

1. Clonar el repositorio

git clone [https://github.com/tu-usuario/iot-arbelaez.git](https://github.com/tu-usuario/iot-arbelaez.git)
cd iot-arbelaez


2. Despliegue con Docker

Asegúrate de tener Docker instalado y ejecuta:

docker-compose up -d


3. Configuración Inicial

Accede a phpMyAdmin (http://localhost:4001) con el usuario sensor y crea la tabla datos_estacion (el esquema está en el archivo db_setup.sql o el tutorial).

Configura el Broker EMQX (http://localhost:18083) creando la regla de Webhook hacia http://dashboard_host/save_data.php.

📁 Estructura del Repositorio

/www: Archivos del servidor web (HTML, JS, CSS, PHP).

docker-compose.yml: Definición de los servicios del sistema.

tutorial_iot_arbelaez.md: Guía detallada paso a paso.

.gitignore: Archivos excluidos del control de versiones.

🛡️ Lecciones Aprendidas (Troubleshooting)

Durante el desarrollo se resolvieron desafíos clave:

Permisos de Servidor: Solución de errores 403 mediante ajustes de propiedad en el contenedor Nginx.

Sincronización de Datos: Implementación de array_reverse en el backend para corregir la línea de tiempo de las gráficas.

Conectividad: Configuración de reglas de Webhook en EMQX para la persistencia automática de datos.

Desarrollado por Camilo - Proyecto IoT Arbeláez v3.1
