import psycopg2
import os
from psycopg2 import sql
from psycopg2.extras import execute_values
from placeholder_data import points_seed
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.
def seed_points(conn):
    try:
        with conn.cursor() as cur:
            # Drop the "points" table if it exists
            cur.execute("DROP TABLE IF EXISTS points;")
            
            # Create the "points" table if it doesn't exist
            create_table_query = """
            CREATE TABLE IF NOT EXISTS points (
                id SERIAL PRIMARY KEY,
                card_name VARCHAR(255),
                points DECIMAL(10, 2),    
                week INTEGER,
                UNIQUE (card_name, week)
            );
            """
            cur.execute(create_table_query)
            print("Created 'points' table")

            # Insert data into the "points" table
            insert_query = """
            INSERT INTO points (card_name, points, week)
            VALUES %s
            ON CONFLICT (card_name, week)
            DO UPDATE SET card_name = excluded.card_name, points = excluded.points, week = excluded.week;
            """
            data_tuples = [(point['card_name'], point['points'], point['week']) for point in points_seed]
            execute_values(cur, insert_query, data_tuples)
            print(f"Seeded {len(data_tuples)} points")

        conn.commit()
    except Exception as error:
        print('Error seeding points:', error)
        raise

def main():
    print("os.getenv('POSTGRES_URL')", os.getenv("POSTGRES_URL"))
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    seed_points(conn)
    conn.close()

if __name__ == "__main__":
    main()