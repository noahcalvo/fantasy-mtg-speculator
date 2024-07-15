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

            # # Migrate Picks table
            # migrate_picks_table_query = """
            # INSERT INTO PicksV3 (draft_id, player_id, pick_number, round, card_id)
            # SELECT draft_id, player_id, pick_number, round, card_id FROM Picks;
            # """
            # cur.execute(migrate_picks_table_query)
            # print("Migrated 'picks' table")

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

            # # Migrate Picks table
            # migrate_leagues_table_query = """
            # INSERT INTO LeaguesV3 (league_id, name, participants, commissioners, open)
            # SELECT league_id, name, participants, comissioners, open FROM LeaguesV2;
            # """
            # cur.execute(migrate_leagues_table_query)
            # print("Migrated 'leagues' table")

            # # Migrate TeamPerformances table
            # migrate_team_performances_table_query = """ 
            # INSERT INTO TeamPerformancesV3 (league_id, player_id, week, points, roster)
            # SELECT league_id, player_id, week, points, roster FROM TeamPerformancesV2;
            # """
            # cur.execute(migrate_team_performances_table_query)
            # print("Migrated 'team_performances' table")

            # Migrate card data from double sided to single sided
            get_double_sided_cards_query = """
            SELECT * FROM Cards WHERE name LIKE '%//%';
            """
            cur.execute(get_double_sided_cards_query)
            double_sided_cards = cur.fetchall()
            # for each card, check if frontside has entry in Cards table
            for card in double_sided_cards:
                frontside_name = card[1].split(" //")[0].replace("'", "''")  # Escape single quotes
                get_frontside_card_query = f"""
                SELECT * FROM Cards WHERE name = '{frontside_name}';
                """
                cur.execute(get_frontside_card_query)
                frontside_card = cur.fetchone()
                if frontside_card:
                    # update card_id in picks table
                    update_picks_table_query = f"""
                    UPDATE PicksV3 SET card_id = {frontside_card[0]} WHERE card_id = {card[0]};
                    """
                    cur.execute(update_picks_table_query)
                    # update card_id in ownership table
                    update_ownership_table_query = f"""
                    UPDATE OwnershipV2 SET card_id = {frontside_card[0]} WHERE card_id = {card[0]};
                    """
                    cur.execute(update_ownership_table_query)
                    # update card_id in team_performances table
                    # since it is a jsonb column, we need to update the roster field
                    
                    # Assuming 'card' is the current double-sided card being migrated and 'frontside_card' is its corresponding single-sided card
                    positions = ['Creature', 'Instant/Sorcery', 'Artifact/Enchantment', 'Land', 'Flex']
                    for position in positions:
                        update_team_performances_table_query = f"""
                        UPDATE TeamPerformancesV3
                        SET roster = CASE
                        WHEN roster->>'{position}' = '{card[0]}' THEN jsonb_set(roster, '{{{position}}}', '"{frontside_card[0]}"')
                        ELSE roster
                        END;
                        """
                        cur.execute(update_team_performances_table_query)                    

                        update_team_performances_table_query = f"""
                        UPDATE RostersV2
                        SET roster = CASE
                        WHEN roster->>'{position}' = '{card[0]}' THEN jsonb_set(roster, '{{{position}}}', '"{frontside_card[0]}"')
                        ELSE roster
                        END;
                        """
                        cur.execute(update_team_performances_table_query)                    

                    # delete double sided card
                    delete_double_sided_card_query = f"""
                    DELETE FROM Cards WHERE card_id = {card[0]};
                    """
                    cur.execute(delete_double_sided_card_query)
                    print("Migrated card", card[0])

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

