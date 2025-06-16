-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: gestion_seguros
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `beneficiario`
--

DROP TABLE IF EXISTS `beneficiario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beneficiario` (
  `id_beneficiario` int NOT NULL AUTO_INCREMENT,
  `id_usuario_seguro` int DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `cedula` varchar(10) DEFAULT NULL,
  `parentesco` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  PRIMARY KEY (`id_beneficiario`),
  KEY `id_usuario_seguro` (`id_usuario_seguro`),
  CONSTRAINT `beneficiario_ibfk_1` FOREIGN KEY (`id_usuario_seguro`) REFERENCES `usuario_seguro` (`id_usuario_seguro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beneficiario`
--

LOCK TABLES `beneficiario` WRITE;
/*!40000 ALTER TABLE `beneficiario` DISABLE KEYS */;
/*!40000 ALTER TABLE `beneficiario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beneficio`
--

DROP TABLE IF EXISTS `beneficio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beneficio` (
  `id_beneficio` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `detalle` text,
  PRIMARY KEY (`id_beneficio`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beneficio`
--

LOCK TABLES `beneficio` WRITE;
/*!40000 ALTER TABLE `beneficio` DISABLE KEYS */;
INSERT INTO `beneficio` VALUES (6,'Revisión dental','-');
/*!40000 ALTER TABLE `beneficio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago_seguro`
--

DROP TABLE IF EXISTS `pago_seguro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago_seguro` (
  `id_pago_seguro` int NOT NULL AUTO_INCREMENT,
  `id_usuario_seguro_per` int DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `cantidad` double DEFAULT NULL,
  `comprobante_pago` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_pago_seguro`),
  KEY `id_usuario_seguro_per` (`id_usuario_seguro_per`),
  CONSTRAINT `pago_seguro_ibfk_1` FOREIGN KEY (`id_usuario_seguro_per`) REFERENCES `usuario_seguro` (`id_usuario_seguro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago_seguro`
--

LOCK TABLES `pago_seguro` WRITE;
/*!40000 ALTER TABLE `pago_seguro` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago_seguro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requisito`
--

DROP TABLE IF EXISTS `requisito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requisito` (
  `id_requisito` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `detalle` text,
  PRIMARY KEY (`id_requisito`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requisito`
--

LOCK TABLES `requisito` WRITE;
/*!40000 ALTER TABLE `requisito` DISABLE KEYS */;
INSERT INTO `requisito` VALUES (3,'Cédula de identidad','-'),(4,'Papeleta de votación ','-');
/*!40000 ALTER TABLE `requisito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requisito_seguro`
--

DROP TABLE IF EXISTS `requisito_seguro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requisito_seguro` (
  `id_requisito_seguro` int NOT NULL AUTO_INCREMENT,
  `id_usuario_seguro_per` int DEFAULT NULL,
  `id_requisito_per` int DEFAULT NULL,
  `informacion` text,
  `validado` tinyint DEFAULT NULL,
  PRIMARY KEY (`id_requisito_seguro`),
  KEY `id_usuario_seguro_per` (`id_usuario_seguro_per`),
  KEY `id_requisito_per` (`id_requisito_per`),
  CONSTRAINT `requisito_seguro_ibfk_1` FOREIGN KEY (`id_usuario_seguro_per`) REFERENCES `usuario_seguro` (`id_usuario_seguro`),
  CONSTRAINT `requisito_seguro_ibfk_2` FOREIGN KEY (`id_requisito_per`) REFERENCES `requisito` (`id_requisito`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requisito_seguro`
--

LOCK TABLES `requisito_seguro` WRITE;
/*!40000 ALTER TABLE `requisito_seguro` DISABLE KEYS */;
/*!40000 ALTER TABLE `requisito_seguro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguro`
--

DROP TABLE IF EXISTS `seguro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguro` (
  `id_seguro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `tiempo_pago` varchar(50) DEFAULT NULL,
  `descripcion` text,
  `tipo` varchar(50) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1' COMMENT '1 = Activo, 0 = Inactivo',
  `cobertura` decimal(10,2) DEFAULT NULL,
  `num_beneficiarios` int DEFAULT NULL,
  PRIMARY KEY (`id_seguro`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguro`
--

LOCK TABLES `seguro` WRITE;
/*!40000 ALTER TABLE `seguro` DISABLE KEYS */;
INSERT INTO `seguro` VALUES (1,'Oro',250.00,'Mensual','Seguro de prueba','Salud',1,10000.00,2),(2,'Plata',300.00,'Trimestral','Seguro de Salud','Salud',0,10000.00,1),(3,'Bronce',300.00,'Anual','Seguro preuba','Vida',1,10000.00,2);
/*!40000 ALTER TABLE `seguro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguro_beneficio`
--

DROP TABLE IF EXISTS `seguro_beneficio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguro_beneficio` (
  `id_seguro_beneficio` int NOT NULL AUTO_INCREMENT,
  `id_seguro_per` int DEFAULT NULL,
  `id_beneficio_per` int DEFAULT NULL,
  PRIMARY KEY (`id_seguro_beneficio`),
  KEY `id_seguro_per` (`id_seguro_per`),
  KEY `id_beneficio_per` (`id_beneficio_per`),
  CONSTRAINT `seguro_beneficio_ibfk_1` FOREIGN KEY (`id_seguro_per`) REFERENCES `seguro` (`id_seguro`),
  CONSTRAINT `seguro_beneficio_ibfk_2` FOREIGN KEY (`id_beneficio_per`) REFERENCES `beneficio` (`id_beneficio`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguro_beneficio`
--

LOCK TABLES `seguro_beneficio` WRITE;
/*!40000 ALTER TABLE `seguro_beneficio` DISABLE KEYS */;
INSERT INTO `seguro_beneficio` VALUES (1,1,6),(2,2,6),(3,3,6);
/*!40000 ALTER TABLE `seguro_beneficio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguro_requisito`
--

DROP TABLE IF EXISTS `seguro_requisito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguro_requisito` (
  `id_seguro_requisito` int NOT NULL AUTO_INCREMENT,
  `id_seguro_per` int DEFAULT NULL,
  `id_requisito_per` int DEFAULT NULL,
  PRIMARY KEY (`id_seguro_requisito`),
  KEY `id_seguro_per` (`id_seguro_per`),
  KEY `id_requisito_per` (`id_requisito_per`),
  CONSTRAINT `seguro_requisito_ibfk_1` FOREIGN KEY (`id_seguro_per`) REFERENCES `seguro` (`id_seguro`),
  CONSTRAINT `seguro_requisito_ibfk_2` FOREIGN KEY (`id_requisito_per`) REFERENCES `requisito` (`id_requisito`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguro_requisito`
--

LOCK TABLES `seguro_requisito` WRITE;
/*!40000 ALTER TABLE `seguro_requisito` DISABLE KEYS */;
INSERT INTO `seguro_requisito` VALUES (1,1,3),(2,2,3),(3,2,4),(4,3,3),(5,3,4);
/*!40000 ALTER TABLE `seguro_requisito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `correo` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `tipo` tinyint DEFAULT NULL,
  `activo` tinyint DEFAULT NULL,
  `cedula` varchar(10) DEFAULT NULL,
  `telefono` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `cedula` (`cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (9,'teoauz@gmail.com','MateoAuz','$2b$10$lO2QhhVNf43Vs2rD0n59TOgJlUXgt7ln7C7nrlvwEOfd7ZRab5kje','Mateo','Auz',0,1,'1234567890','0987654321'),(10,'mauricioGuevara@gmail.com','MauricioGuevara','$2b$10$PBzPfwtO1QqZCuHA42YGIujARqnges6xWzpKzE/h0vtn6NynmGb4e','Maurico','Guevara',1,0,'1808647634','0987714718'),(11,'santiagoMora@gmail.com','SantioMora','$2b$10$iUHf.z9aEdBLv3bGQzgoLOmNPzfg7WwBCoOMDMoGlZfaq3PcSuFXe','Santiago','Mora',1,1,'1808123634','0983507919'),(12,'holasboring@gmail.com','BorisRex','$2b$10$V/Vf0kHo62ZQpKQbHGFRkevr0TcZiyy2jvsVkQ0FUaRtsvk71FUKK','Boris','Vinces',2,1,'1808647693','0982414718');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_seguro`
--

DROP TABLE IF EXISTS `usuario_seguro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_seguro` (
  `id_usuario_seguro` int NOT NULL AUTO_INCREMENT,
  `id_usuario_per` int DEFAULT NULL,
  `id_seguro_per` int DEFAULT NULL,
  `fecha_contrato` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` int DEFAULT NULL,
  `estado_pago` int DEFAULT NULL,
  `modalidad_pago` varchar(20) DEFAULT NULL,
  `firma` varchar(255) DEFAULT NULL,
  `hora` time DEFAULT NULL,
  PRIMARY KEY (`id_usuario_seguro`),
  KEY `id_usuario_per` (`id_usuario_per`),
  KEY `id_seguro_per` (`id_seguro_per`),
  CONSTRAINT `usuario_seguro_ibfk_1` FOREIGN KEY (`id_usuario_per`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `usuario_seguro_ibfk_2` FOREIGN KEY (`id_seguro_per`) REFERENCES `seguro` (`id_seguro`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_seguro`
--

CREATE TABLE IF NOT EXISTS usuario_requisito (
  id_usuario_requisito INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario_seguro INT NOT NULL,
  id_requisito INT NOT NULL,
  nombre_archivo VARCHAR(255),
  path_archivo VARCHAR(255),
  validado TINYINT DEFAULT 0,
  FOREIGN KEY (id_usuario_seguro) REFERENCES usuario_seguro(id_usuario_seguro),
  FOREIGN KEY (id_requisito) REFERENCES requisito(id_requisito)
);





LOCK TABLES `usuario_seguro` WRITE;
/*!40000 ALTER TABLE `usuario_seguro` DISABLE KEYS */;
INSERT INTO `usuario_seguro` VALUES (8,12,3,'2025-06-02',NULL,0,NULL,'Anual','uploads/../routes/uploads/contratos/1748840136242-Taller1Modelamiento.pdf','23:55:36');
/*!40000 ALTER TABLE `usuario_seguro` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

DROP TABLE IF EXISTS `reembolso`;
-- Tabla principal de reembolsos
CREATE TABLE `reembolso` (
  id_reembolso INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario_seguro INT NOT NULL,
  fecha_solicitud DATE NOT NULL,
  hora_solicitud TIME NOT NULL,
  motivo TEXT NOT NULL,
  monto_solicitado DECIMAL(10,2) NOT NULL,
  estado ENUM('PENDIENTE','DEVUELTO','RECHAZADO','PAGADO') DEFAULT 'PENDIENTE',
  fecha_actualizacion DATETIME,
  FOREIGN KEY (id_usuario_seguro) REFERENCES usuario_seguro(id_usuario_seguro)
);

-- Tabla de documentos asociados a cada reembolso
CREATE TABLE IF NOT EXISTS documento_reembolso (
  id_documento INT AUTO_INCREMENT PRIMARY KEY,
  id_reembolso INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  path_archivo   VARCHAR(255) NOT NULL,
  FOREIGN KEY (id_reembolso) REFERENCES reembolso(id_reembolso)
);

LOCK TABLES `reembolso` WRITE;
/*!40000 ALTER TABLE `reembolso` DISABLE KEYS */;
/*!40000 ALTER TABLE `reembolso` ENABLE KEYS */;
UNLOCK TABLES;

-- 1) Agrega motivo_rechazo a la tabla reembolso
ALTER TABLE reembolso
  ADD COLUMN motivo_rechazo TEXT NULL
  AFTER monto_solicitado;

DROP TABLE IF EXISTS `notificacion`;
-- 2) Crea la tabla notificacion para guardar mensajes al cliente
CREATE TABLE `notificacion` (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT             NOT NULL,
  mensaje         TEXT            NOT NULL,
  fecha           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-02 13:39:37
