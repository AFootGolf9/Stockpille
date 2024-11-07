-- database
create database stockpille;


-- tables

create sequence item_seq;

create table item(
    sku integer primary key default nextval('item_seq'),
    name varchar(255),
    description varchar(255),
    status varchar(255) default 'new'
);

create sequence location_seq;

create table location(
    id integer primary key default nextval('location_seq'),
    name varchar(255),
    status varchar(255) default 'new'
);

create sequence user_seq;

create table user_data(
    id integer primary key default nextval('user_seq'),
    name varchar(255),
    role varchar(255),
    password varchar(255),
    status varchar(255) default 'new'
);

create sequence allocate;

create table allocation(
    id integer primary key default nextval('allocate'),
    item_sku integer references item(sku),
    location_id integer references location(id),
    user_id integer references user_data(id),
    status varchar(255) default 'new'
);

create table token(
    token varchar(255) not null unique,
    user_id int references user_data(id),
    time timestamp default now()
);