import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def createTables(conn):
    try:
        with conn.cursor() as cur:
            # Create the "points" table if it doesn't exist
            create_points_table_query = """
            CREATE TABLE IF NOT EXISTS Cards (
            card_id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE,
            origin VARCHAR(255)
            );
            """
            cur.execute(create_points_table_query)
            print("Created 'points' table")

            create_performance_table_query = """
            CREATE TABLE Performance (
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

            # -- challenge table
            create_challenge_performance_table_query = """
            CREATE TABLE ChallengePerformance (
            performance_id INT PRIMARY KEY,
            champs INT,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_challenge_performance_table_query)
            print("Created 'challenge performance' table")

            # create league performance table query
            create_league_performance_table_query = """
            CREATE TABLE LeaguePerformance (
            performance_id INT PRIMARY KEY,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_league_performance_table_query)
            print("Created 'league performance' table")

            # -- Players
            # create players table query
            create_players_table_query = """
            CREATE TABLE Players (
            player_id SERIAL PRIMARY KEY,
            name VARCHAR(255)
            );
            """
            cur.execute(create_players_table_query)
            print("Created 'players' table")

            # -- Library / Ownership
            create_ownership_table_query = """
            CREATE TABLE Ownership (
            player_id INT,
            card_id INT,
            FOREIGN KEY (player_id) REFERENCES Players(player_id),
            FOREIGN KEY (card_id) REFERENCES Cards(card_id),
            PRIMARY KEY(player_id, card_id)
            );
            """
            cur.execute(create_ownership_table_query)
            print("Created 'ownership' table")

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

