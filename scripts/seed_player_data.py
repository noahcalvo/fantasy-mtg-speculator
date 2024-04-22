from placeholder_data import ownership_seed
import psycopg2
import os
from psycopg2 import sql
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def seedOwnershipData(conn):
    try:
        with conn.cursor() as cur:
            # Seed player data if not already present
            for player in ownership_seed:
                cur.execute(
                    "INSERT INTO Players (name) VALUES (%s) ON CONFLICT DO NOTHING;",
                    (player['name'],)
                )

            # Retrieve player IDs
            player_ids = {}
            cur.execute("SELECT player_id, name FROM Players WHERE name IN %s;", 
                        (tuple(player['name'] for player in ownership_seed),))
            for player_id, name in cur.fetchall():
                player_ids[name] = player_id

            # Retrieve card IDs
            card_ids = {}
            cur.execute("SELECT card_id, name FROM Cards WHERE name IN %s;", 
                        (tuple(card for player in ownership_seed for card in player['cards']),))
            for card_id, name in cur.fetchall():
                card_ids[name] = card_id

            # Insert ownership data
            ownership_data = []
            for player in ownership_seed:
                player_id = player_ids[player['name']]
                for card_name in player['cards']:
                    card_id = card_ids[card_name]
                    ownership_data.append((player_id, card_id))

            insert_ownership_query = """
            INSERT INTO Ownership (player_id, card_id)
            VALUES %s
            ON CONFLICT (player_id, card_id)
            DO NOTHING;
            """
            execute_values(cur, insert_ownership_query, ownership_data)
            print(f"Seeded {len(ownership_data)} ownership records")

        conn.commit()
    except Exception as error:
        print('Error seeding ownership data:', error)
        raise

def main():
    print("os.getenv('POSTGRES_URL')", os.getenv("POSTGRES_URL"))
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    seedOwnershipData(conn)
    conn.close()

if __name__ == "__main__":
    main()
