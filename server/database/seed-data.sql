use unblock;

-- password for every seeded user: password
insert into user (username, password_hash) values
	('testuser1', '$2a$10$YfhIpdTMTF9E3GU8mpIIwOd7uYTvKjLt2BfTQV.rOB/tXTjc/l37K'),
	('testuser2', '$2a$10$YfhIpdTMTF9E3GU8mpIIwOd7uYTvKjLt2BfTQV.rOB/tXTjc/l37K'),
	('testuser3', '$2a$10$YfhIpdTMTF9E3GU8mpIIwOd7uYTvKjLt2BfTQV.rOB/tXTjc/l37K'),
	('testuser4', '$2a$10$YfhIpdTMTF9E3GU8mpIIwOd7uYTvKjLt2BfTQV.rOB/tXTjc/l37K'),
	('testuser5', '$2a$10$YfhIpdTMTF9E3GU8mpIIwOd7uYTvKjLt2BfTQV.rOB/tXTjc/l37K'),
	('testuser6', '$2a$10$YfhIpdTMTF9E3GU8mpIIwOd7uYTvKjLt2BfTQV.rOB/tXTjc/l37K');

-- Three boards showing different kinds of projects: a game dev board, a
-- household project, and a community/nonprofit event board. Users overlap
-- across boards with different roles to show what multi-board membership
-- looks like.
insert into board (name, owner_id) values
	('Indie platformer prototype', 1),
	('Apartment move', 5),
	('Fall Fundraiser Gala', 4);

insert into board_member (board_id, user_id, role) values
	-- Indie platformer prototype
	(1, 1, 'OWNER'),
	(1, 2, 'EDITOR'),
	(1, 3, 'VIEWER'),
	-- Apartment move
	(2, 5, 'OWNER'),
	(2, 6, 'EDITOR'),
	(2, 1, 'VIEWER'),
	-- Fall Fundraiser Gala
	(3, 4, 'OWNER'),
	(3, 5, 'EDITOR'),
	(3, 2, 'EDITOR'),
	(3, 3, 'VIEWER');

insert into board_column (board_id, name, position) values
	-- Indie platformer prototype (columns 1-3)
	(1, 'Backlog', 0),
	(1, 'In Progress', 1),
	(1, 'Done', 2),
	-- Apartment move (columns 4-6)
	(2, 'Before the Move', 0),
	(2, 'Move Week', 1),
	(2, 'Unpacked & Done', 2),
	-- Fall Fundraiser Gala (columns 7-10)
	(3, 'Planning', 0),
	(3, 'In Progress', 1),
	(3, 'Final Review', 2),
	(3, 'Complete', 3);

insert into card_category (board_id, name, color) values
	-- Indie platformer prototype (categories 1-3)
	(1, 'Programming', '#6366f1'),
	(1, 'Design', '#f43f5e'),
	(1, 'Audio', '#f59e0b'),
	-- Apartment move (categories 4-6)
	(2, 'Logistics', '#0ea5e9'),
	(2, 'Packing', '#8b5cf6'),
	(2, 'Cleaning', '#22c55e'),
	-- Fall Fundraiser Gala (categories 7-10)
	(3, 'Venue', '#ec4899'),
	(3, 'Marketing', '#3b82f6'),
	(3, 'Volunteers', '#10b981'),
	(3, 'Budget', '#eab308');

insert into card (column_id, title, description, category_id, is_complete, position) values
	-- Indie platformer prototype (cards 1-6)
	(3, 'Movement & jumping', 'Core run/jump/wall-slide controls, tuned with coyote time and jump buffering.', 1, true, 0),
	(2, 'Combat system', 'Melee combo, i-frames on dodge, and hit-stop on landed hits.', 1, false, 0),
	(1, 'Boss fight mechanic', 'Three-phase encounter for the end of world 1, gated behind the combat system.', 1, false, 0),
	(3, 'Concept art pass', 'Mood boards and palette studies for the world 2 forest biome.', 2, true, 1),
	(2, 'Level 2 tileset', 'Modular tile set built from the approved concept art, ready for the level editor.', 2, false, 1),
	(1, 'Original soundtrack demo', 'Rough instrumental for the title screen theme, looking for feedback on tempo.', 3, false, 1),
	-- Apartment move (cards 7-12)
	(4, 'Book moving truck', 'Reserved a 15ft truck for Saturday 8am pickup.', 4, true, 0),
	(4, 'Change address with post office', 'Submit mail forwarding and update it with the bank and DMV.', 4, false, 1),
	(4, 'Pack kitchen boxes', 'Wrap dishes in newspaper, label boxes by room and fragility.', 5, false, 2),
	(5, 'Load the truck', 'Coordinate with the moving crew once the truck is booked and boxes are packed.', 4, false, 0),
	(5, 'Deep clean old apartment', 'Full clean for the security deposit walkthrough after everything is out.', 6, false, 1),
	(6, 'Unpack & set up bedroom', 'Assemble the bed frame and get the closet organized first.', 5, false, 0),
	-- Fall Fundraiser Gala (cards 13-19)
	(10, 'Book event venue', 'Reserved the community hall for October 18th, capacity 150.', 7, true, 0),
	(10, 'Design save-the-date flyer', 'Flyer approved by the committee and sent to the printer.', 8, true, 1),
	(8, 'Recruit volunteer coordinators', 'Need team leads for check-in, catering, and cleanup shifts.', 9, false, 0),
	(8, 'Finalize catering budget', 'Compare quotes from two local caterers against the venue kitchen rules.', 10, false, 1),
	(7, 'Print and mail invitations', 'Mail formal invitations once the flyer and volunteer team are locked in.', 8, false, 0),
	(7, 'Confirm final headcount', 'Lock the RSVP count so catering can place their final order.', 10, false, 1),
	(9, 'Day-of run sheet', 'Draft the volunteer schedule and timeline for event day.', 9, false, 0);

insert into card_dependency (card_id, depends_on_card_id) values
	-- Indie platformer prototype
	(2, 1),   -- Combat system depends on Movement & jumping
	(3, 2),   -- Boss fight mechanic depends on Combat system
	(5, 4),   -- Level 2 tileset depends on Concept art pass
	-- Apartment move
	(10, 7),  -- Load the truck depends on Book moving truck
	(10, 9),  -- Load the truck depends on Pack kitchen boxes
	(11, 10), -- Deep clean old apartment depends on Load the truck
	(12, 10), -- Unpack & set up bedroom depends on Load the truck
	-- Fall Fundraiser Gala
	(16, 13), -- Finalize catering budget depends on Book event venue
	(17, 14), -- Print and mail invitations depends on Design save-the-date flyer
	(17, 15), -- Print and mail invitations depends on Recruit volunteer coordinators
	(18, 17), -- Confirm final headcount depends on Print and mail invitations
	(19, 15); -- Day-of run sheet depends on Recruit volunteer coordinators
