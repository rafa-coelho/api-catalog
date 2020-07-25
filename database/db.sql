SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `catalog` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `catalog`;

CREATE TABLE `domain_type` (
  `id` varchar(45) NOT NULL,
  `name` varchar(30) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `domain_value` (
  `id` varchar(45) NOT NULL,
  `value` varchar(100) NOT NULL,
  `type` varchar(45) DEFAULT NULL,
  `parent` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `offering` (
  `id` varchar(45) NOT NULL,
  `name` varchar(50) NOT NULL,
  `external_id` varchar(30) NOT NULL,
  `deleted` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE `offering_field` (
  `id` varchar(45) NOT NULL,
  `name` varchar(30) NOT NULL,
  `label` varchar(30) NOT NULL,
  `automatic` int(1) NOT NULL DEFAULT 0,
  `multiple` int(1) NOT NULL DEFAULT 0,
  `type` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `offering`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `offering_field`
  ADD PRIMARY KEY (`id`);
COMMIT;
