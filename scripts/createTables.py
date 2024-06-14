import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def createTables(conn):
    try:
        with conn.cursor() as cur:
            # Create Cards table
            create_cards_table_query = """
            CREATE TABLE IF NOT EXISTS Cards (
            card_id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE,
            origin VARCHAR(255)
            );
            """
            cur.execute(create_cards_table_query)
            print("Created 'cards' table")

            create_performance_table_query = """
            CREATE TABLE IF NOT EXISTS Performance (
            performance_id SERIAL PRIMARY KEY,
            card_id INT,
            week INT,
            price DECIMAL(10, 2),
            FOREIGN KEY (card_id) REFERENCES Cards(card_id),
            UNIQUE (card_id, week)
            );
            """
            cur.execute(create_performance_table_query)
            print("Created 'performance' table")

            # -- challenge performance table
            create_challenge_performance_table_query = """
            CREATE TABLE IF NOT EXISTS ChallengePerformance (
            performance_id INT PRIMARY KEY,
            champs INT,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_challenge_performance_table_query)
            print("Created 'challenge performance' table")

            # -- league performance table
            create_league_performance_table_query = """
            CREATE TABLE IF NOT EXISTS LeaguePerformance (
            performance_id INT PRIMARY KEY,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_league_performance_table_query)
            print("Created 'league performance' table")

            # -- Users
            # create Users table query
            create_users_table_query = """
            CREATE TABLE IF NOT EXISTS Users (
            player_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
            );
            """
            cur.execute(create_users_table_query)
            print("Created 'users' table")

            # -- Ownership
            create_ownership_table_query = """
            CREATE TABLE IF NOT EXISTS Ownership (
            player_id INT,
            card_id INT,
            FOREIGN KEY (player_id) REFERENCES Users(player_id),
            FOREIGN KEY (card_id) REFERENCES Cards(card_id),
            PRIMARY KEY(card_id)
            );
            """
            cur.execute(create_ownership_table_query)
            print("Created 'ownership' table")

            create_drafts_table_query = """
            CREATE TABLE IF NOT EXISTS Drafts (
            draft_id SERIAL PRIMARY KEY,
            participants INT[],
            active boolean NOT NULL,
            set VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            rounds INT NOT NULL
            );
            """
            cur.execute(create_drafts_table_query)
            print("Created 'drafts' table")

            create_picks_table_query = """
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
            """
            cur.execute(create_picks_table_query)
            print("Created 'picks' table")

            create_rosters_table_query = """
            CREATE TABLE IF NOT EXISTS Rosters (
            roster_id SERIAL PRIMARY KEY,
            player_id INT,
            roster JSONB
            );
            """
            cur.execute(create_rosters_table_query)
            print("Created 'rosters' table")

            create_league_table_query = """
            CREATE TABLE IF NOT EXISTS Leagues (
            league_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            participants INT[]
            );
            """
            cur.execute(create_league_table_query)
            print("Created 'leagues' table")

        conn.commit()
    except Exception as error:
        print('Error creating tables:', error)
        raise

def main():
    print("os.getenv('POSTGRES_URL')", os.getenv("POSTGRES_URL"))
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    createTables(conn)
    conn.close()

if __name__ == "__main__":
    main()

