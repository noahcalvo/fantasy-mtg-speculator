import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def createTables(conn):
    try:
        with conn.cursor() as cur:
            create_cards_table_query = """
            ALTER TABLE DraftsV4
            ADD COLUMN qstash_message_id TEXT;
            """
            cur.execute(create_cards_table_query)
            print("updated 'DraftsV4' table")
        conn.commit()
    except Exception as error:
        print('Error creating tables:', error)
        raise

def main():
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    print("Connected to the database")
    createTables(conn)
    conn.close()

if __name__ == "__main__":
    main()

