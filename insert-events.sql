-- Insert VRoR 2025 Events
-- IMPORTANT: Run add-time-columns.sql FIRST to add the time_from and time_to columns
-- Note: Times stored in database as 24-hour format but will display as 12-hour format in the app

-- Optional: Delete existing sample events (uncomment if you want to remove them)
-- DELETE FROM events WHERE name IN ('Veterans Race of Remembrance 2024', 'Spring Training Event');

-- Event 1: 2:00 PM - 6:00 PM
INSERT INTO events (name, date, time_from, time_to, description)
VALUES (
  'Beneficiaries arrive RDU, travel to AirBnB',
  '2025-11-02',
  '14:00',
  '18:00',
  'Cannot check-in to AirBnB until 4pm.'
);

-- Event 2: 7:00 PM
INSERT INTO events (name, date, time_from, description)
VALUES (
  'Team Dinner',
  '2025-11-02',
  '19:00',
  'OpMo AirBnB (Main House).'
);

-- Event 3: 7:00 AM
INSERT INTO events (name, date, time_from, description)
VALUES (
  'Team Breakfast',
  '2025-11-03',
  '07:00',
  'OpMo AirBnB (Main House).'
);

-- Event 4: 9:30 AM - 1:00 PM
INSERT INTO events (name, date, time_from, time_to, description)
VALUES (
  'Whitewater Center: Low Challenge Course',
  '2025-11-03',
  '09:30',
  '13:00',
  'Lunch onsite, OpMo Race Team & Photo.'
);

-- Event 5: 3:00 PM - 5:00 PM
INSERT INTO events (name, date, time_from, time_to, description)
VALUES (
  'eMotorsport Beneficiaries Arrive',
  '2025-11-03',
  '15:00',
  '17:00',
  'OpMo AirBnB #2.'
);

-- Event 6: 7:00 PM
INSERT INTO events (name, date, time_from, description)
VALUES (
  'Team Dinner',
  '2025-11-03',
  '19:00',
  'OpMo AirBnB (Main House).'
);

-- Event 7 (No times - TBD)
INSERT INTO events (name, date, description)
VALUES (
  'Foster Films Recordings',
  '2025-11-03',
  'OpMo AirBnB (Main House).'
);

-- Event 8: 10:00 AM
INSERT INTO events (name, date, time_from, description)
VALUES (
  'VRoR Car Prep – BMW F82',
  '2025-11-04',
  '10:00',
  'Random Vandals Shop, OpMo Race Team & Photo (1). End time: UTC'
);

-- Event 9: 8:00 AM - 11:00 AM
INSERT INTO events (name, date, time_from, time_to, description)
VALUES (
  'Ford Sim Experience',
  '2025-11-04',
  '08:00',
  '11:00',
  'Ford Racing Tech Center, eMotorsport Beneficiaries & Photo (1).'
);

-- Event 10 (No times - TBD)
INSERT INTO events (name, date, description)
VALUES (
  'Team Lunch',
  '2025-11-04',
  'OpMo Race Team eat at RVR, eMotorsports eat lunch enroute to RVR after Ford Experience.'
);

-- Event 11 (No times - TBD)
INSERT INTO events (name, date, description)
VALUES (
  'Team Dinner',
  '2025-11-04',
  'OpMo AirBnB (Main House).'
);

-- Event 12 (No times - TBD)
INSERT INTO events (name, date, description)
VALUES (
  'Foster Films Recordings',
  '2025-11-04',
  'OpMo AirBnB (Main House).'
);

-- Event 13: 9:00 AM - 10:30 AM
INSERT INTO events (name, date, time_from, time_to, description)
VALUES (
  'Richard''s Coffee Shop',
  '2025-11-05',
  '09:00',
  '10:30',
  'Late Breakfast; enroute to VIR.'
);

-- Event 14: 1:00 PM - 3:00 PM
INSERT INTO events (name, date, time_from, time_to, description)
VALUES (
  'Arrive VIR (OpMo, RVR, Powersports)',
  '2025-11-05',
  '13:00',
  '15:00',
  'Paddock Set-up (Random Vandals / Powersports Garage).'
);

-- Event 15: 6:00 PM
INSERT INTO events (name, date, time_from, description)
VALUES (
  'Heroes Dinner',
  '2025-11-07',
  '18:00',
  'VIR Gallery; OpMo Bens wear OpMo Polos. End time: UTC'
);

-- Event 16: 10:40 AM - 11:20 AM
INSERT INTO events (name, date, time_from, time_to, description)
VALUES (
  'VRoR Remembrance Ceremony',
  '2025-11-08',
  '10:40',
  '11:20',
  'Veterans: wearing of organizational headgear & medals/ribbons encouraged.'
);

-- Event 17 (No times - TBD)
INSERT INTO events (name, date, description)
VALUES (
  'VIR Karting',
  '2025-11-09',
  NULL
);
