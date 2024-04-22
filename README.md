## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

Here are the db tables constituting my schema
```
CREATE TABLE IF NOT EXISTS Cards (
card_id SERIAL PRIMARY KEY,
name VARCHAR(255) UNIQUE,
origin VARCHAR(255)
);

CREATE TABLE Performance (
performance_id SERIAL PRIMARY KEY,
card_id INT,
week INT,
price DECIMAL(10, 2),
FOREIGN KEY (card_id) REFERENCES Cards(card_id),
UNIQUE (card_id, week)
);

CREATE TABLE ChallengePerformance (
performance_id INT PRIMARY KEY,
champs INT,
decks INT,
copies INT,
FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
);

CREATE TABLE LeaguePerformance (
performance_id INT PRIMARY KEY,
decks INT,
copies INT,
FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
);

CREATE TABLE Players (
player_id SERIAL PRIMARY KEY,
name VARCHAR(255)
);

CREATE TABLE Ownership (
player_id INT,
card_id INT,
FOREIGN KEY (player_id) REFERENCES Players(player_id),
FOREIGN KEY (card_id) REFERENCES Cards(card_id),
PRIMARY KEY(player_id, card_id)
);
```
