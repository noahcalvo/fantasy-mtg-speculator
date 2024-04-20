import psycopg2
from psycopg2 import Error
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

load_dotenv()  # take environment variables from .env.

# Function to connect to the PostgreSQL database
def connect_to_database():
    print(os.getenv("POSTGRES_URL"))
    try:
        connection = psycopg2.connect(os.getenv("POSTGRES_URL"))
        return connection
    except Error as e:
        print("Error while connecting to PostgreSQL", e)
        return None

# deprecated in favor of new db schema to track itemized stats
# def insert_points(connection, points_dict, week):
#     try:
#         with connection.cursor() as cursor:
#             insert_query = """
#             INSERT INTO points (card_name, points, week)
#             VALUES %s
#             ON CONFLICT (card_name, week)
#             DO UPDATE SET card_name = excluded.card_name, points = excluded.points, week = excluded.week;
#             """
#             # Convert the dictionary to a list of tuples
#             data_tuples = [(card, points, week) for card, points in points_dict.items()]
#             psycopg2.extras.execute_values(cursor, insert_query, data_tuples)
#         connection.commit()
#     except Error as e:
#         print("Error inserting points data:", e)

def insert_stats(db_connection, card_stats, week, price):
    with db_connection.cursor() as cur:
        # Insert cards into Cards table if they don't exist
        for card_name in card_stats.keys():
            cur.execute("""
                INSERT INTO Cards (name) VALUES (%s)
                ON CONFLICT (name) DO NOTHING;
            """, (card_name,))
        
        # Commit after inserting all cards to ensure they're available for subsequent queries.
        db_connection.commit()

        for card_name, stats in card_stats.items():
            # Get card_id for the current card
            cur.execute("SELECT card_id FROM Cards WHERE name = %s;", (card_name,))
            card_id = cur.fetchone()[0]
            
            # Insert a performance entry for this card and week
            cur.execute("""
                INSERT INTO Performance (card_id, week, price) VALUES (%s, %s, %s)
                ON CONFLICT (card_id, week)
                DO UPDATE SET price = EXCLUDED.price
                RETURNING performance_id;
            """, (card_id, week, price))
            
            performance_id = cur.fetchone()[0]

            # Insert corresponding challenge performance entry
            cur.execute("""
                INSERT INTO ChallengePerformance (performance_id, champs, decks, copies) VALUES (%s, %s, %s, %s)
                ON CONFLICT (performance_id)
                DO UPDATE SET champs = EXCLUDED.champs, decks = EXCLUDED.decks, copies = EXCLUDED.copies;
            """, (
                performance_id,
                stats.get('challenge_champs', 0),
                0,
                stats.get('challenge_copies', 0))
            )

            # Insert corresponding league performance entry 
            # Note: If stats['league_copies'] == 0 you might want to skip this.
            
            if stats.get('league_copies', 0) > 0:
                cur.execute("""
                    INSERT INTO LeaguePerformance(performance_id, decks ,copies) VALUES(%s,%s,%s)
                    ON CONFLICT (performance_id)
                    DO UPDATE SET decks = EXCLUDED.decks, copies = EXCLUDED.copies;
                """, (
                    performance_id,
                    0,
                    stats.get('league_copies')
                ))

    # Finally commit transactions after all inserts are complete.
    db_connection.commit()