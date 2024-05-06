from placeholder_data import ownership_seed, players_seed
import psycopg2
import os
from psycopg2 import sql
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import bcrypt

load_dotenv()  # take environment variables from .env.

def seedOwnershipData(conn):
    try:
        with conn.cursor() as cur:
            # Seed player data if not already present
            for player in players_seed:
                hashed_password = bcrypt.hashpw(player['password'].encode(), bcrypt.gensalt(10)).decode('utf-8')
                print("player name:", player['name'])
                print("plaintext password:", player['password'])
                print("hashed password:", hashed_password)
                cur.execute(
                    "INSERT INTO Users (name, email, password) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING;",
                    (player['name'],player['email'], hashed_password)
                )

            # Retrieve player IDs
            player_ids = {}
            cur.execute("SELECT player_id, email FROM Users WHERE email IN %s;", 
                        (tuple(player['email'] for player in ownership_seed),))
            for player_id, email in cur.fetchall():
                player_ids[email] = player_id

            # Retrieve card IDs
            card_ids = {}
            cur.execute("SELECT card_id, name FROM Cards WHERE name IN %s;", 
                        (tuple(card for player in ownership_seed for card in player['cards']),))
            for card_id, name in cur.fetchall():
                card_ids[name] = card_id

            # Insert ownership data
            ownership_data = []
            for player in ownership_seed:
                player_id = player_ids[player['email']]
                for card_name in player['cards']:
                    card_id = card_ids[card_name]
                    ownership_data.append((player_id, card_id))

            insert_ownership_query = """
            INSERT INTO Ownership (player_id, card_id)
            VALUES %s
            ON CONFLICT (card_id)
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
