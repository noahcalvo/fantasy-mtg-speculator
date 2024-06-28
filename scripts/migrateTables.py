import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def migrateTables(conn):
    try:
        with conn.cursor() as cur:
            # # Migrate Ownership table
            # migrate_ownership_table_query = """
            # INSERT INTO OwnershipV2 (player_id, card_id, league_id)
            # SELECT player_id, card_id, 1 FROM Ownership;
            # """
            # cur.execute(migrate_ownership_table_query)
            # print("Migrated 'ownership' table")

            # # Migrate Drafts table
            # migrate_drafts_table_query = """
            # INSERT INTO DraftsV2 (draft_id, league_id, participants, active, set, name, rounds)
            # SELECT draft_id, 1, participants, active, set, name, rounds FROM Drafts;
            # """
            # cur.execute(migrate_drafts_table_query)
            # print("Migrated 'drafts' table")

            # Migrate Picks table
            migrate_picks_table_query = """
            INSERT INTO PicksV3 (draft_id, player_id, pick_number, round, card_id)
            SELECT draft_id, player_id, pick_number, round, card_id FROM Picks;
            """
            cur.execute(migrate_picks_table_query)
            print("Migrated 'picks' table")

            # # Migrate Rosters table
            # migrate_rosters_table_query = """
            # INSERT INTO RostersV2 (roster_id, player_id, league_id, roster)
            # SELECT roster_id, player_id, 1, roster FROM Rosters;
            # """
            # cur.execute(migrate_rosters_table_query)
            # print("Migrated 'rosters' table")

            # # Migrate Trades table
            # migrate_trades_table_query = """
            # INSERT INTO TradesV2 (trade_id, league_id, offerer, recipient, offered, requested, state, expires)
            # SELECT trade_id, 1, offerer, recipient, offered, requested, state, expires FROM Trades;
            # """
            # cur.execute(migrate_trades_table_query)
            # print("Migrated 'trades' table")

        conn.commit()
    except Exception as error:
        print('Error creating tables:', error)
        raise

def main():
    print("os.getenv('POSTGRES_URL')", os.getenv("POSTGRES_URL"))
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    migrateTables(conn)
    conn.close()

if __name__ == "__main__":
    main()

