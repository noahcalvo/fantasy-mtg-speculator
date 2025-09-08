import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def migrate_drafts_v4(conn):
    """
    Migrate DraftsV4 table to:
    1. Add paused_at column
    2. Rename last_pick_timestamp to current_pick_deadline_at
    """
    try:
        with conn.cursor() as cur:
            # Add the new paused_at column if it doesn't exist
            add_paused_at_query = """
            ALTER TABLE DraftsV4
            ADD COLUMN IF NOT EXISTS paused_at timestamptz;
            """
            cur.execute(add_paused_at_query)
            print("Added 'paused_at' column to DraftsV4 table")

            # Check if the old column exists before trying to rename it
            check_column_query = """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'draftsv4' 
            AND column_name = 'last_pick_timestamp';
            """
            cur.execute(check_column_query)
            old_column_exists = cur.fetchone() is not None

            if old_column_exists:
                # Rename last_pick_timestamp to current_pick_deadline_at
                rename_column_query = """
                ALTER TABLE DraftsV4
                RENAME COLUMN last_pick_timestamp TO current_pick_deadline_at;
                """
                cur.execute(rename_column_query)
                print("Renamed 'last_pick_timestamp' to 'current_pick_deadline_at' in DraftsV4 table")
            else:
                # Check if the new column already exists
                check_new_column_query = """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'draftsv4' 
                AND column_name = 'current_pick_deadline_at';
                """
                cur.execute(check_new_column_query)
                new_column_exists = cur.fetchone() is not None
                
                if not new_column_exists:
                    # Add the new column if neither old nor new exists
                    add_deadline_column_query = """
                    ALTER TABLE DraftsV4
                    ADD COLUMN current_pick_deadline_at timestamptz;
                    """
                    cur.execute(add_deadline_column_query)
                    print("Added 'current_pick_deadline_at' column to DraftsV4 table")
                else:
                    print("Column 'current_pick_deadline_at' already exists in DraftsV4 table")

        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as error:
        print('Error during migration:', error)
        conn.rollback()
        raise

def main():
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    print("Connected to the database")
    migrate_drafts_v4(conn)
    conn.close()

if __name__ == "__main__":
    main()
