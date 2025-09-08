import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def createTables(conn):
    try:
        with conn.cursor() as cur:
            # Create Cards table
            create_cards_table_query = """
            CREATE TABLE IF NOT EXISTS Cards (
            card_id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE,
            origin VARCHAR(255)
            );
            """
            cur.execute(create_cards_table_query)
            print("Created 'cards' table")

            create_performance_table_query = """
            CREATE TABLE IF NOT EXISTS PerformanceV2 (
            performance_id SERIAL PRIMARY KEY,
            card_id INT NOT NULL,
            week INT,
            price DECIMAL(10, 2),
            FOREIGN KEY (card_id) REFERENCES Cards(card_id),
            UNIQUE (card_id, week)
            );
            """
            cur.execute(create_performance_table_query)
            print("Created 'performance' table")

            # -- performance tables
            create_modern_challenge_performance_table_query = """
            CREATE TABLE IF NOT EXISTS ModernChallengePerformance (
            performance_id INT PRIMARY KEY,
            champs INT,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_modern_challenge_performance_table_query)
            print("Created 'modern challenge performance' table")

            create_standard_challenge_performance_table_query = """
            CREATE TABLE IF NOT EXISTS StandardChallengePerformance (
            performance_id INT PRIMARY KEY,
            champs INT,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_standard_challenge_performance_table_query)
            print("Created 'standard challenge performance' table")

            create_modern_league_performance_table_query = """
            CREATE TABLE IF NOT EXISTS ModernLeaguePerformance (
            performance_id INT PRIMARY KEY,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_modern_league_performance_table_query)
            print("Created 'modern league performance' table")

            create_standard_league_performance_table_query = """
            CREATE TABLE IF NOT EXISTS StandardLeaguePerformance (
            performance_id INT PRIMARY KEY,
            decks INT,
            copies INT,
            FOREIGN KEY (performance_id) REFERENCES Performance(performance_id)
            );
            """
            cur.execute(create_standard_league_performance_table_query)
            print("Created 'standard league performance' table")

            # -- Users
            # create Users table query
            create_users_table_query = """
            CREATE TABLE IF NOT EXISTS Users (
            player_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
            );
            """
            cur.execute(create_users_table_query)
            print("Created 'users' table")

            # -- Ownership
            create_ownership_table_query = """
            CREATE TABLE IF NOT EXISTS OwnershipV3 (
            player_id INT NOT NULL,
            card_id INT NOT NULL,
            league_id INT NOT NULL,
            FOREIGN KEY (player_id) REFERENCES Users(player_id),
            FOREIGN KEY (card_id) REFERENCES Cards(card_id),
            PRIMARY KEY(card_id, league_id)
            );
            """
            cur.execute(create_ownership_table_query)
            print("Created 'ownership' table")

            create_drafts_table_query = """
            CREATE TABLE IF NOT EXISTS DraftsV4 (
            draft_id SERIAL PRIMARY KEY,
            league_id INT NOT NULL,
            participants INT[],
            active boolean NOT NULL,
            set VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            rounds INT NOT NULL,
            auto_draft BOOLEAN NOT NULL,
            pick_time_seconds INT,
            current_pick_deadline_at timestamp with time zone,
            paused_at timestamptz,
            FOREIGN KEY (league_id) REFERENCES LeaguesV3(league_id)
            );
            """
            cur.execute(create_drafts_table_query)
            print("Created 'drafts' table")

            create_picks_table_query = """
            CREATE TABLE IF NOT EXISTS PicksV5 (
            pick_id SERIAL PRIMARY KEY,
            draft_id INT NOT NULL,
            player_id INT,
            pick_number INT NOT NULL,
            round INT NOT NULL,
            card_id INT,
            FOREIGN KEY (draft_id) REFERENCES DraftsV4(draft_id),
            FOREIGN KEY (player_id) REFERENCES Users(player_id),
            FOREIGN KEY (card_id) REFERENCES Cards(card_id),
            UNIQUE (draft_id, pick_number, round),
            UNIQUE (draft_id, card_id)
            );
            """
            cur.execute(create_picks_table_query)
            print("Created 'picks' table")

            create_rosters_table_query = """
            CREATE TABLE IF NOT EXISTS RostersV2 (
            roster_id SERIAL PRIMARY KEY,
            player_id INT NOT NULL,
            league_id INT NOT NULL,
            roster JSONB
            );
            """
            cur.execute(create_rosters_table_query)
            print("Created 'rosters' table")

            create_league_table_query = """
            CREATE TABLE IF NOT EXISTS LeaguesV3 (
            league_id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            participants INT[],
            commissioners INT[],
            open BOOLEAN NOT NULL
            );
            """
            cur.execute(create_league_table_query)
            print("Created 'leagues' table")

            create_scoring_types_table_query = """
            CREATE TABLE IF NOT EXISTS ScoringOptions (
            scoring_id SERIAL PRIMARY KEY,
            format VARCHAR(50) NOT NULL,
            tournament_type VARCHAR(100) NOT NULL,
            is_per_copy BOOLEAN NOT NULL,
            points DECIMAL(10,2) NOT NULL,
            league_id INT NOT NULL,
            FOREIGN KEY (league_id) REFERENCES LeaguesV3(league_id)
            );
            """
            cur.execute(create_scoring_types_table_query)
            print("Created 'scoring types' table")

            create_trade_table_query = """
            CREATE TABLE IF NOT EXISTS TradesV2 (
            trade_id SERIAL PRIMARY KEY,
            league_id INT NOT NULL,
            offerer INT NOT NULL,
            recipient INT NOT NULL,
            offered INT[] NOT NULL,
            requested INT[] NOT NULL,
            state VARCHAR(255) NOT NULL,
            expires TIMESTAMP,
            FOREIGN KEY (offerer) REFERENCES Users(player_id),
            FOREIGN KEY (recipient) REFERENCES Users(player_id)
            );
            """
            cur.execute(create_trade_table_query)
            print("Created 'trades' table")

            create_bulletin_table_query = """
            CREATE TABLE IF NOT EXISTS BulletinItemsV2 (
            item_id SERIAL PRIMARY KEY,
            league_id INT NOT NULL,
            player_id INT NOT NULL,
            message TEXT NOT NULL,
            created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (league_id) REFERENCES LeaguesV3(league_id),
            FOREIGN KEY (player_id) REFERENCES Users(player_id)
            );
            """
            cur.execute(create_bulletin_table_query)
            print("Created 'bulletin items' table")

            create_team_performance_table_query = """
            CREATE TABLE IF NOT EXISTS TeamPerformancesV3 (
            performance_id SERIAL PRIMARY KEY,
            roster jsonb NOT NULL,
            league_id INT NOT NULL,
            player_id INT NOT NULL,
            week INT NOT NULL,
            points INT NOT NULL,
            FOREIGN KEY (league_id) REFERENCES LeaguesV3(league_id),
            FOREIGN KEY (player_id) REFERENCES Users(player_id),
            UNIQUE (league_id, player_id, week)
            );
            """
            cur.execute(create_team_performance_table_query)
            print("Created 'team performance' table")

            create_invites_table_query = """
            CREATE TABLE IF NOT EXISTS Invites (
            invite_id SERIAL PRIMARY KEY,
            league_id INT NOT NULL,
            code VARCHAR(10) NOT NULL UNIQUE,
            expires TIMESTAMP NOT NULL,
            FOREIGN KEY (league_id) REFERENCES LeaguesV3(league_id)
            );
            """
            cur.execute(create_invites_table_query)
            print("Created 'invites' table")


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

