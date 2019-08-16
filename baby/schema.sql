drop table if exists user;
create table user(
  id integer primary key autoincrement,
  user_name character(20)  unique not null,
  password character(100) not null,
  user_level integer default 1,
  phone character(11) default null,
  email character(50) unique not null,
  is_deleted integer   default 0 ,
  create_time datetime not null  default current_timestamp
);

insert into user(user_name,password,user_level,email)
values('admin','pbkdf2:sha256:150000$Zzo3GwXQ$ff03f92556feceecd5059f293f1048b57d995c2bc2d83d340577eb61c3a915b1',0,'admin@admin.com');


drop table if exists user_level;
create table user_level(
    id integer  primary key autoincrement ,
    name_en character not null ,
    name_cn character not null
);

insert into user_level (id,name_en,name_cn) values (0,'Administrator','管理员');
insert into user_level (id,name_en,name_cn) values (1,'Parent','家长');
insert into user_level (id,name_en,name_cn) values (2,'Baby','宝贝');

drop table if exists baby_info;
create table baby_info(
    id integer primary key autoincrement ,
    user_id not null ,
    baby_name not null ,
    baby_sex integer  default 0 ,
    birthday not null ,
    introduce text default null ,
    create_time datetime default current_timestamp
);

drop table if exists sex;
create table sex(
    id integer primary key autoincrement,
    sex_en character not null ,
    sex_cn character not null
);

insert into sex (sex_en,sex_cn) values ('boy','男');
insert into sex (sex_en,sex_cn) values ('girl','女');


drop table if exists manage_healthy;
create table manage_healthy(
    id integer primary key autoincrement ,
    baby_id not null,
    height float not null,
    weight float not null,
    remarks text default null ,
    record_date date not null,
    create_by integer not null ,
    create_time datetime default current_timestamp
);

drop table if exists manage_diary;
create table manage_diary(
    id integer  primary key autoincrement ,
    baby_id not null,
    diary text not null ,
    record_date date not null,
    create_by integer not null ,
    create_date datetime default current_timestamp ,
    is_deleted  integer  default 0
);


drop table if exists manage_album;
create table manage_album(
    id integer  primary key autoincrement ,
    baby_id not null,
    title character default null,
    body text default null ,
    footprint integer  default null,
    img_path character not null ,
    record_date date not null,
    create_date datetime default current_timestamp ,
    create_by integer not null ,
    is_deleted  integer  default 0
);

drop table if exists manage_footprint;
create table manage_footprint(
    id integer primary key autoincrement,
    user_id integer not null ,
    record_date varchar not null ,
    footprint_name character not null,
    footprint_desc character default  null,
    is_deleted integer default 0 ,
    create_time datetime default current_timestamp
);
