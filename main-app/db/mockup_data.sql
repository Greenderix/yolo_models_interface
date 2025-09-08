INSERT INTO Driver (name, email, password_hash, created_at) VALUES
('Ivan Petrov', 'ivan.petrov@example.com', 'hashed_pw_1', NOW()),
('Maria Smirnova', 'maria.smirnova@example.com', 'hashed_pw_2', NOW()),
('Dmitry Ivanov', 'dmitry.ivanov@example.com', 'hashed_pw_3', NOW());
INSERT INTO Car (number, model, is_active, lat, lon, speed, updated_at) VALUES
('A123BC77', 'Toyota Camry', TRUE, 55.75, 37.61, 43, NOW()),
('B456DE77', 'Hyundai Solaris', TRUE, 55.76, 37.62, 55, NOW()),
('C789FG77', 'Kia Rio', FALSE, 55.77, 37.63, 0, NOW());
INSERT INTO DriverCarAssignment (driver_id, car_id, start_time, end_time, active) VALUES
(1, 1, NOW() - INTERVAL '2 days', NULL, TRUE),
(2, 2, NOW() - INTERVAL '1 day', NULL, TRUE),
(3, 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', FALSE);
INSERT INTO ViolationType (code, label, icon) VALUES
('seatbelt', 'Seatbelt not fastened', '🚌'),
('smoking', 'Smoking in vehicle', '🚬'),
('phone', 'Phone usage while driving', '📱');
INSERT INTO Violation (driver_id, car_id, violation_type_id, confidence, time, location, lat, lon, speed, photo_url, passengers) VALUES
(1, 1, 1, 92.5, NOW() - INTERVAL '1 hour', 'Lenina St, 10', 55.7512, 37.6184, 44, 'https://via.placeholder.com/140x100.png?text=Seatbelt', 1),
(2, 2, 2, 87.0, NOW() - INTERVAL '3 hours', 'Tverskaya St, 7', 55.7601, 37.6013, 50, 'https://via.placeholder.com/140x100.png?text=Smoking', 1),
(2, 2, 3, 90.0, NOW() - INTERVAL '6 hours', 'Kutuzovsky Ave, 18', 55.7543, 37.5651, 52, 'https://via.placeholder.com/140x100.png?text=Phone', 1),
(1, 1, 3, 81.5, NOW() - INTERVAL '2 days', 'Prospekt Mira, 5', 55.7680, 37.6530, 40, 'https://via.placeholder.com/140x100.png?text=Phone', 1),
(3, 3, 2, 88.3, NOW() - INTERVAL '6 days', 'Leningradsky Ave, 28', 55.7930, 37.5734, 0, 'https://via.placeholder.com/140x100.png?text=Smoking', 1);
