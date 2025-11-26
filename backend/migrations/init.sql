CREATE TABLE users (
    userId INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(255),
    password TEXT NOT NULL,
    private_key TEXT ,
    deposit_address TEXT ,
    balance NUMERIC 
);
