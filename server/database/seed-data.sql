use unblock;
	
insert into user (username, password_hash) values
	('mallardmike', '$2a$10$uv9Tais/NKO0IBLj3HryEedbo6OnRrJm.FJL4FG/N6Etz9dQpzbFm'),
	('quackuistador', '$2a$10$uv9Tais/NKO0IBLj3HryEedbo6OnRrJm.FJL4FG/N6Etz9dQpzbFm'),
	('waddlewarden', '$2a$10$uv9Tais/NKO0IBLj3HryEedbo6OnRrJm.FJL4FG/N6Etz9dQpzbFm');

insert into board (name, owner_id) values
	('Roguelike prototype', 1);
	
insert into board_member (board_id, user_id, role) values
	(1, 1, 'OWNER'),
	(1, 2, 'EDITOR'),
	(1, 3, 'VIEWER');

insert into board_column (board_id, name, position) values
	(1, 'Backlog', 0),
	(1, 'In Progress', 1),
	(1, 'Done', 2);
	
insert into card_category (board_id, name, color) values
	(1, 'Programming', 'violet'),
	(1, 'Design', 'rose'),
	(1, 'Audio', 'amber');
	
insert into card (column_id, title, description, category_id, is_complete, position) values
    (3, 'Movement & jumping', 'Basic platformer controls.', 1, true, 0),
    (2, 'Combat system', 'Melee attack, hitboxes, damage.', 1, false, 0),
    (1, 'Boss fight mechanic', 'Final encounter.', 1, false, 0),
    (1, 'Concept art pass', 'Style exploration for level 2.', 2, true, 1);
	
insert into card_dependency (card_id, depends_on_card_id) values
    (2, 1),  -- Combat system depends on Movement & jumping
    (3, 2);  -- Boss fight depends on Combat system