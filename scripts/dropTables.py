import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def dropTables(conn):
    try:
        with conn.cursor() as cur:
            # Drop the "points" table if it exists
            # cur.execute("DROP TABLE IF EXISTS Cards CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS Performance CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS ModernChallengePerformance;")
            # cur.execute("DROP TABLE IF EXISTS ModernLeaguePerformance;")
            # # cur.execute("DROP TABLE IF EXISTS Players CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS Ownership;")
            # cur.execute("DROP TABLE IF EXISTS Users CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS Points CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS Drafts CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS Picks CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS Rosters CASCADE;")
            # cur.execute("DROP TABLE IF EXISTS Leagues CASCADE;")
            print("Dropped all tables")
        conn.commit()
    except Exception as error:
        print('Error dropping tables:', error)
        raise


def main():
    print("os.getenv('POSTGRES_URL')", os.getenv("POSTGRES_URL"))
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    dropTables(conn)
    conn.close()

if __name__ == "__main__":
    main()

