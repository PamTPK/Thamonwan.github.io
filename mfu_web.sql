-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2023 at 08:10 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `web_mfu`
--

-- --------------------------------------------------------

--
-- Table structure for table `borrowing`
--

CREATE TABLE `borrowing` (
  `borrow_id` int(11) NOT NULL,
  `user_borrow` varchar(255) NOT NULL,
  `motorcycle_id` int(11) NOT NULL,
  `motorcycle_name` varchar(255) NOT NULL,
  `borrow_date` date NOT NULL,
  `return_date` date NOT NULL,
  `reason` varchar(255) NOT NULL,
  `status` enum('approved','disapproved','wating') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `motorcycles`
--

CREATE TABLE `motorcycles` (
  `motorcycle_id` int(11) NOT NULL,
  `motorcycle_name` varchar(255) NOT NULL,
  `motorcycle_detail` varchar(255) NOT NULL,
  `motorcycle_image` varchar(255) NOT NULL,
  `motorcycle_status` varchar(255) NOT NULL,
  `motorcycle_traffic` varchar(255) NOT NULL,
  `motorcycle_insurance` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `motorcycles`
--

INSERT INTO `motorcycles` (`motorcycle_id`, `motorcycle_name`, `motorcycle_detail`, `motorcycle_image`, `motorcycle_status`, `motorcycle_traffic`, `motorcycle_insurance`) VALUES
(1, 'Honda 123', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio architecto beatae reprehenderit sed earum, expedita facere. Sint reiciendis asperiores voluptatibus pariatur reprehenderit officiis magnam vitae omnis rem temporibus? Et, voluptate.', 'M4.png', 'borrowed', 'yes', 'yes'),
(2, 'Honda 555', 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cum optio fugiat quia illum exercitationem, sit nulla debitis velit maxime non voluptate iure, distinctio, dolor saepe perferendis sapiente vitae suscipit fuga.', 'M1.png', 'borrowed', 'yes', 'yes'),
(3, 'Honda 999', 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cum optio fugiat quia illum exercitationem, sit nulla debitis velit maxime non voluptate iure, distinctio, dolor saepe perferendis sapiente vitae suscipit fuga.', 'M2.png', 'waiting', 'yes', 'yes'),
(4, 'Honda 222', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio architecto beatae reprehenderit sed earum, expedita facere. Sint reiciendis asperiores voluptatibus pariatur reprehenderit officiis magnam vitae omnis rem temporibus? Et, voluptate.\r\n', 'M3.png', 'available', 'yes', 'yes'),
(5, 'Honda 444', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio architecto beatae reprehenderit sed earum, expedita facere. Sint reiciendis asperiores voluptatibus pariatur reprehenderit officiis magnam vitae omnis rem temporibus? Et, voluptate.', 'mo1.png', 'disable', 'yes', 'yes');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `urole` enum('user','staff','lender') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `firstname`, `lastname`, `phone`, `address`, `gender`, `urole`, `created_at`, `image`) VALUES
(1, 'Nini', 'staff@gmail.com', '12345678', 'Nini', 'Nana', '098782639', 'Regent', 'Female', 'staff', '2023-11-26 13:29:24', 'nini.png'),
(2, 'Leo', 'Leo@gmail.com', '12345678', 'Leo', 'Lion', '09734588', 'L3', 'Male', 'user', '2023-11-26 07:34:10', 'profile.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `borrowing`
--
ALTER TABLE `borrowing`
  ADD PRIMARY KEY (`borrow_id`),
  ADD KEY `motorcycle_id` (`motorcycle_id`);

--
-- Indexes for table `motorcycles`
--
ALTER TABLE `motorcycles`
  ADD PRIMARY KEY (`motorcycle_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `borrowing`
--
ALTER TABLE `borrowing`
  MODIFY `borrow_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `motorcycles`
--
ALTER TABLE `motorcycles`
  MODIFY `motorcycle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrowing`
--
ALTER TABLE `borrowing`
  ADD CONSTRAINT `borrowing_ibfk_1` FOREIGN KEY (`motorcycle_id`) REFERENCES `motorcycles` (`motorcycle_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
