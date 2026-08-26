drop database if exists unblock;
create database unblock;
use unblock;

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