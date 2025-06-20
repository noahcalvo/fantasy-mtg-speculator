## Next.js App Router Course - Starter

start the app with

`yarn dev`

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

CREATE TABLE ModernChallengePerformance (
performance_id INT PRIMARY KEY,
champs INT,
decks INT,
copies INT,
FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
);

CREATE TABLE ModernLeaguePerformance (
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

CREATE TABLE IF NOT EXISTS Drafts (
draft_id SERIAL PRIMARY KEY,
participants INT[],
active boolean NOT NULL,
set VARCHAR(255) NOT NULL,
name VARCHAR(255) NOT NULL,
rounds INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Picks (
pick_id SERIAL PRIMARY KEY,
draft_id INT,
player_id INT,
pick_number INT,
round INT,
card_id INT,
FOREIGN KEY (draft_id) REFERENCES Drafts(draft_id),
FOREIGN KEY (player_id) REFERENCES Users(player_id),
FOREIGN KEY (card_id) REFERENCES Cards(card_id),
UNIQUE (draft_id, pick_number, round),
UNIQUE (draft_id, card_id)
);

```

To scrape and seed weekly data run

`python main.py {space seperated week numbers}`
i.e. `python main.py 5 6 7`

To drop the tables (start from scratch):
`python3 scripts/dropTables.py`
`python3 scripts/createTables.py`

To create seed users
`python3 scripts/seed_player_data.py`
This will create a user

```
noah.calvo@gmail.com password
```
