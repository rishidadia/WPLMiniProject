CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    college VARCHAR(255),
    location VARCHAR(255),
    stats TEXT,
    sports JSONB,
    image TEXT
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    sport VARCHAR(100),
    outcome VARCHAR(50),
    notes TEXT,
    date DATE DEFAULT CURRENT_DATE
);

-- Insert a default profile row since it's a single user system
INSERT INTO profiles (id, name, age, college, location, stats, sports, image)
VALUES (1, 'Your Name', 20, '', 'Location', '', '[]', '');
