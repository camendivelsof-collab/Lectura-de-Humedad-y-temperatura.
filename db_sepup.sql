-- Script de configuración para Estación Arbeláez
-- Ejecuta este código en la pestaña SQL de phpMyAdmin (localhost:4001)

-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `mqtt`;
USE `mqtt`;

-- 2. Crear la tabla de registros
CREATE TABLE IF NOT EXISTS `datos_estacion` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sensor` VARCHAR(100) NOT NULL,     -- Almacena el tópico (ej: esp32/temperatura)
  `valor` FLOAT NOT NULL,            -- Valor numérico recibido
  `unidad` VARCHAR(10) NOT NULL,      -- Unidad de medida (°C o %)
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora automática
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Crear el usuario del sistema (opcional, si no se creó por entorno)
-- GRANT ALL PRIVILEGES ON mqtt.* TO 'sensor'@'%' IDENTIFIED BY 'sensor123';
-- FLUSH PRIVILEGES;

-- Nota: Los datos serán insertados automáticamente por EMQX 
-- mediante el Webhook configurado hacia save_data.php.
