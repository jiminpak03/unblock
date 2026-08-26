drop database if exists unblock_test;
create database unblock_test;
use unblock_test;

create table user (
    id int primary key auto_increment,
    username varchar(30) unique not null,
    password_hash text not null,
    created_date datetime not null default current_timestamp
);

create table board (
    id int primary key auto_increment,
    name varchar(100) not null,
    owner_id int not null,
    created_date datetime not null default current_timestamp,
    constraint fk_board_owner foreign key (owner_id) references user(id)
);

create table board_member (
    board_id int not null,
    user_id int not null,
    role varchar(10) not null,
    primary key (board_id, user_id),
    constraint fk_bm_board foreign key (board_id) references board(id) on delete cascade,
    constraint fk_bm_user  foreign key (user_id)  references user(id)
);

create table board_column (
    id int primary key auto_increment,
    board_id int not null,
    name varchar(50) not null,
    position int not null,
    constraint fk_column_board foreign key (board_id) references board(id) on delete cascade
);

create table card_category (
    id int primary key auto_increment,
    board_id int not null,
    name varchar(30) not null,
    color varchar(20) not null,
    constraint fk_category_board foreign key (board_id) references board(id) on delete cascade
);

create table card (
    id int primary key auto_increment,
    column_id int not null,
    title varchar(150) not null,
    description text,
    category_id int null,
    is_complete boolean not null default false,
    position int not null,
    image_url varchar(500),
    created_date datetime not null default current_timestamp,
    edit_date datetime null,
    constraint fk_card_column foreign key (column_id) references board_column(id) on delete cascade,
    constraint fk_card_category foreign key (category_id) references card_category(id)
);

create table card_dependency (
    card_id int not null,
    depends_on_card_id int not null,
    primary key (card_id, depends_on_card_id),
    constraint fk_dep_card       foreign key (card_id)            references card(id) on delete cascade,
    constraint fk_dep_depends_on foreign key (depends_on_card_id) references card(id) on delete cascade
);

delimiter //
create procedure set_known_good_state()
begin
	delete from card_dependency;
	delete from card;
	delete from card_category;
	delete from board_column;
	delete from board_member;
	delete from board;
	delete from user;
	alter table card auto_increment = 1;
	alter table card_category auto_increment = 1;
	alter table board_column auto_increment = 1;
	alter table board auto_increment = 1;
	alter table user auto_increment = 1;
	
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
	
end //
delimiter ;
