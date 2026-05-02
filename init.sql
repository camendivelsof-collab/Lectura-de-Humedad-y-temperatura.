--aqui se pondrian las claves en otra carpeta para manejar las autorizaciones de conexión a la pagina web y la base de Datos.
-- ==============================================================================
-- Script de Inicialización de Base de Datos para EMQX (MariaDB)
-- Proyecto: Estación Meteorológica IoT / Panel de Control
-- ==============================================================================

-- 1. Creación de la tabla de usuarios para autenticar los dispositivos en EMQX
CREATE TABLE IF NOT EXISTS `mqtt_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `salt` varchar(35) DEFAULT NULL,
  `is_superuser` tinyint(1) DEFAULT 0,
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mqtt_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Creación de la tabla de Reglas de Acceso (ACL - Access Control List)
CREATE TABLE IF NOT EXISTS `mqtt_acl` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `allow` int(1) DEFAULT 1 COMMENT '0: deny, 1: allow',
  `ipaddr` varchar(60) DEFAULT NULL COMMENT 'IpAddress',
  `username` varchar(100) DEFAULT NULL COMMENT 'Username',
  `clientid` varchar(100) DEFAULT NULL COMMENT 'ClientId',
  `access` int(2) NOT NULL COMMENT '1: subscribe, 2: publish, 3: pubsub',
  `topic` varchar(100) NOT NULL DEFAULT '' COMMENT 'Topic Filter',
  PRIMARY KEY (`id`),
  INDEX (`ipaddr`),
  INDEX (`username`),
  INDEX (`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- Datos de Inicio (Seed Data)
-- ==============================================================================

-- 3. Insertar el usuario por defecto para los nodos sensores (ej. ESP32)
-- ¡IMPORTANTE!: Cambia 'TU_CONTRASEÑA_SEGURA_AQUI' antes de ejecutar este script o desplegar los contenedores.
-- Se asigna is_superuser=1 para facilitar las pruebas iniciales de desarrollo.
INSERT INTO `mqtt_user` (`username`, `password`, `is_superuser`) 
VALUES ('sensor', 'TU_CONTRASEÑA_SEGURA_AQUI', 1);

-- 4. Regla de ACL por defecto
-- Permite a las conexiones iniciales publicar y suscribirse a cualquier tema (Topic comodín '#').
-- Nota de seguridad: En un entorno de producción o despliegue real, ajusta esta regla 
-- para restringir el acceso únicamente a los temas específicos de tus dispositivos.
INSERT INTO `mqtt_acl` (`allow`, `ipaddr`, `username`, `clientid`, `access`, `topic`) 
VALUES (1, NULL, NULL, NULL, 3, '#');
