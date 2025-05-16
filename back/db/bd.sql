-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: gestion_seguros
-- ------------------------------------------------------
-- Server version	8.0.39

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `seguro`
--

DROP TABLE IF EXISTS `seguro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguro` (
  `id_seguro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `precio` varchar(20) DEFAULT NULL,
  `tiempo_pago` varchar(50) DEFAULT NULL,
  `descripcion` text,
  `tipo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_seguro`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  PRIMARY KEY (`id_usuario_seguro`),
  KEY `id_usuario_per` (`id_usuario_per`),
  KEY `id_seguro_per` (`id_seguro_per`),
  CONSTRAINT `usuario_seguro_ibfk_1` FOREIGN KEY (`id_usuario_per`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `usuario_seguro_ibfk_2` FOREIGN KEY (`id_seguro_per`) REFERENCES `seguro` (`id_seguro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-16  2:03:03
