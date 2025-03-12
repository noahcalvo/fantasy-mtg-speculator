import psycopg2
import os
from psycopg2 import sql
from psycopg2.extras import execute_values
from placeholder_data import cards_seed, performances_seed, league_performance_seed, challenge_performance_seed
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.
def createTables(conn):
    try:
        with conn.cursor() as cur:
            # Drop the "points" table if it exists
            cur.execute("DROP TABLE IF EXISTS Cards CASCADE;")
            cur.execute("DROP TABLE IF EXISTS Performance CASCADE;")
            cur.execute("DROP TABLE IF EXISTS ModernChallengePerformance;")
            cur.execute("DROP TABLE IF EXISTS ModernLeaguePerformance;")
            cur.execute("DROP TABLE IF EXISTS Players CASCADE;")
            cur.execute("DROP TABLE IF EXISTS Ownership;")
            cur.execute("DROP TABLE IF EXISTS weeksPerformance;")
            print("Dropped all tables")
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
            price DECIMAL(10 , 2),
            FOREIGN KEY (card_id) REFERENCES Cards(card_id)
            );
            """
            cur.execute(create_performance_table_query)
            print("Created 'performance' table")

            # -- challenge table
            create_challenge_performance_table_query = """
            CREATE TABLE ModernChallengePerformance (
            performance_id INT,
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
            CREATE TABLE ModernLeaguePerformance (
            performance_id INT,
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

def seedData(conn):
    try:
        with conn.cursor() as cur:
            # Insert data into the "cards" table
            insert_query = """
            INSERT INTO Cards (name, origin)
            VALUES %s
            ON CONFLICT (name)
            DO UPDATE SET name = excluded.name, origin = excluded.origin;
            """
            card_data_tuples = [(card['card_name'], card['origin']) for card in cards_seed]
            execute_values(cur, insert_query, card_data_tuples)
            print(f"Seeded {len(card_data_tuples)} points")

            # Get the IDs of inserted cards.
            ids_and_names = {card['card_name']: None for card in cards_seed}
            cur.execute("SELECT card_id, name FROM Cards WHERE name IN %s;", (tuple(ids_and_names.keys()),))
            results = cur.fetchall()
            for result in results:
                ids_and_names[result[1]] = result[0]

            insert_performance_query = """
            INSERT INTO Performance (card_id, week, price /* other fields */)
            VALUES %s;
            """

            performance_data_tuples = []
            for perf in performances_seed:
                # Retrieve corresponding ID from previously fetched mapping.
                card_id = ids_and_names.get(perf["card_name"])
                if card_id is not None:
                    # Create tuple containing all info required for insertion into WeeksPerformance.
                    performance_data_tuples.append((card_id, perf["week"], perf["price"]))

            execute_values(cur, insert_performance_query, performance_data_tuples)
            print(f"Seeded {len(performance_data_tuples)} points")

            for league_entry in league_performance_seed:
                # This query will select 'performance_id' while joining on card name and week
                # Then it will use these details to insert into ModernLeaguePerformance table
                insert_league_query = """
                WITH perf_data AS (
                    SELECT p.performance_id FROM Performance p
                    INNER JOIN Cards c ON c.card_id = p.card_id AND c.name = %s WHERE p.week = %s
                )
                INSERT INTO ModernLeaguePerformance (performance_id, decks, copies)
                SELECT perf_data.performance_id, %s, %s FROM perf_data;
                """

                cur.execute(
                    insert_league_query,
                    (league_entry['card_name'], league_entry['week'], 
                    league_entry['decks'], league_entry['copies']))
            print(f"Seeded {len(league_performance_seed)} league performances")
            
            for challenge_entry in challenge_performance_seed:
                # This query will select 'performance_id' while joining on card name and week
                # Then it will use these details to insert into ModernChallengePerformance table
                insert_challenge_query = """
                WITH perf_data AS (
                    SELECT p.performance_id FROM Performance p
                    INNER JOIN Cards c ON c.card_id = p.card_id AND c.name = %s WHERE p.week = %s
                )
                INSERT INTO ModernChallengePerformance (performance_id, champs, decks, copies)
                SELECT perf_data.performance_id, %s, %s, %s FROM perf_data;
                """

                cur.execute(
                    insert_challenge_query,
                    (challenge_entry['card_name'], challenge_entry['week'], 
                    challenge_entry['champs'], challenge_entry['decks'], challenge_entry['copies']))
            print(f"Seeded {len(challenge_performance_seed)} challenge performances")

        conn.commit()
    except Exception as error:
        print('Error seeding data:', error)
        raise

def seed(conn):
    createTables(conn)
    seedData(conn)
def main():
    print("os.getenv('POSTGRES_URL')", os.getenv("POSTGRES_URL"))
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    seed(conn)
    conn.close()

if __name__ == "__main__":
    main()

