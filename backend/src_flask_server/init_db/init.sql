CREATE TABLE IF NOT EXISTS vm_users (
    id serial PRIMARY KEY,
    username varchar(80) UNIQUE NOT NULL,
    password varchar(150) NOT NULL,
    user_money numeric(7,2) DEFAULT 1000 NOT NULL,
    created_on TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS vm_os (
    os_id serial PRIMARY KEY,
    os_name VARCHAR(50) NOT NULL,
    os_displayname VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS vm_cpu (
    cpu_id serial PRIMARY KEY,
    cpu_name VARCHAR(50),
    cpu_displayname VARCHAR(100),
    cpu_power INT NOT NULL, --ghz,
    cpu_cores INT NOT NULL
);

CREATE TABLE IF NOT EXISTS vm_memory (
    mem_id serial PRIMARY KEY,
    mem_name VARCHAR(50) UNIQUE NOT NULL,
    mem_displayname VARCHAR(100),
    mem_size INT NOT NULL 
);

CREATE TABLE IF NOT EXISTS vm_computer (
    comp_id serial PRIMARY KEY,
    os_id INT,
    cpu_id INT,
    mem_id INT,
    hd_size REAL NOT NULL,
    usu_id INT NOT NULL,
    FOREIGN KEY (os_id)
        REFERENCES vm_os,
    FOREIGN KEY (cpu_id)
        REFERENCES vm_cpu,
    FOREIGN KEY (mem_id)
        REFERENCES vm_memory
);