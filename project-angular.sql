-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 26 juin 2025 à 09:19
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `project-angular`
--

-- --------------------------------------------------------

--
-- Structure de la table `formation`
--

DROP TABLE IF EXISTS `formation`;
CREATE TABLE IF NOT EXISTS `formation` (
  `formation_id` int NOT NULL AUTO_INCREMENT,
  `formation_nom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `formation_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `formation_niveau` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `formation_nom_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `utilisateur_id` int NOT NULL,
  PRIMARY KEY (`formation_id`),
  UNIQUE KEY `formation_nom` (`formation_nom`),
  KEY `fk_3` (`utilisateur_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `formation`
--

INSERT INTO `formation` (`formation_id`, `formation_nom`, `formation_description`, `formation_niveau`, `formation_nom_image`, `utilisateur_id`) VALUES
(1, 'Remise à niveau dans les métiers du numérique', 'La formation « Mise à Niveau dans les Métiers du Numérique » de Metz Numeric School est une classe préparatoire intensive de 3 mois (380 heures)...', 'Sans le BAC', 'RAN.webp', 5),
(2, 'Développeur Web et Web Mobile', 'D\'une durée de 9 mois, cette formation à temps plein, incluant un stage de 8 semaines...', 'BAC+2', 'DEVWEB.jpeg', 4),
(3, 'Concepteur Développeur d\'Applications', 'Cette formation de 9 mois, incluant un stage de 6 semaines, prépare au titre RNCP...', 'BAC+3', 'CDA.jpeg', 4),
(4, 'Bachelor Développeur Full Stack en alternance (en 1 an)', 'La formation Bachelor Développeur Full Stack en alternance (1 an)...', 'BAC+3', 'DFS.jpg', 4);

-- --------------------------------------------------------

--
-- Structure de la table `retard`
--

DROP TABLE IF EXISTS `retard`;
CREATE TABLE IF NOT EXISTS `retard` (
  `retard_id` int NOT NULL AUTO_INCREMENT,
  `retard_date` date NOT NULL,
  `retard_heure_arrivee` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `retard_statut` tinyint(1) NOT NULL,
  `retard_motif` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `retard_date_declaration` date NOT NULL,
  `utilisateur_id` int NOT NULL,
  PRIMARY KEY (`retard_id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `retard`
--

INSERT INTO `retard` (`retard_id`, `retard_date`, `retard_heure_arrivee`, `retard_statut`, `retard_motif`, `retard_date_declaration`, `utilisateur_id`) VALUES
(1, '2025-05-05', '08:43', 0, 'Transport', '2025-05-05', 3),
(2, '2025-06-26', '08:52', 0, 'Panne réveil', '2025-06-26', 3),
(4, '2025-06-28', '10:25', 0, 'RDV médical', '2025-06-28', 4);

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE IF NOT EXISTS `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_nom` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`role_id`, `role_nom`) VALUES
(1, 'stagiaire'),
(2, 'responsable de formation');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `utilisateur_id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `utilisateur_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`utilisateur_id`),
  KEY `fk_1` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`utilisateur_id`, `utilisateur_email`, `utilisateur_password`, `role_id`) VALUES
(3, 'b@b', '$2b$10$btikwiNOPOCBdW2rfWLrLe.T50xgbS58fT2yfzpfPZlYpX/J9gRSi', 1),
(4, 'c@c', '$2b$10$btikwiNOPOCBdW2rfWLrLe.T50xgbS58fT2yfzpfPZlYpX/J9gRSi', 2),
(5, 'd@d', '$2b$10$btikwiNOPOCBdW2rfWLrLe.T50xgbS58fT2yfzpfPZlYpX/J9gRSi', 2);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `formation`
--
ALTER TABLE `formation`
  ADD CONSTRAINT `fk_3` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`utilisateur_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Contraintes pour la table `retard`
--
ALTER TABLE `retard`
  ADD CONSTRAINT `utilisateur_id` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`utilisateur_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD CONSTRAINT `fk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
