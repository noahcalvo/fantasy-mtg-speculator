# main.py

import psycopg2
from datetime import datetime, timedelta
from scripts.db import connect_to_database, insert_stats


# Function to update TeamPerformances table on Monday with roster data
def update_team_performances_for_new_week():
    conn = connect_to_database()
    if conn:
        cur = conn.cursor()
        # Get the new week number
        today = datetime.now()
        week_number = today.isocalendar()[1]
        
        # Read from Rosters table
        cur.execute("SELECT roster_id, player_id, roster FROM Rosters")
        rosters = cur.fetchall()
        
        for roster_id, player_id, roster in rosters:
            # Assuming roster is a JSONB column with structure {card_name: cardId}
            # Convert roster JSONB to array of cardIds
            roster_array = [value for key, value in roster.items()]
            
            # Insert into TeamPerformances
            cur.execute(
                "INSERT INTO TeamPerformances (team_id, week, points, place, roster) VALUES (%s, %s, %s, %s, %s)",
                (player_id, week_number, 0, 0, roster_array)
            )
        
        conn.commit()
        cur.close()
        conn.close()

# Function to update TeamPerformances table from Tuesday to Sunday with performance data
def update_team_performances_with_performance_data():
    conn = connect_to_database()
    if conn:
        cur = conn.cursor()
        # Get the current week number
        today = datetime.now()
        week_number = today.isocalendar()[1]
        
        # Update TeamPerformances with performance data
        cur.execute("""
            UPDATE TeamPerformances
            SET points = subquery.total_points
            FROM (
                SELECT 
                    TeamPerformances.team_id,
                    SUM(
                        COALESCE(ChallengePerformance.champs * 5, 0) +
                        COALESCE(ChallengePerformance.copies * 0.5, 0) +
                        COALESCE(LeaguePerformance.copies * 0.25, 0)
                    ) AS total_points
                FROM TeamPerformances
                LEFT JOIN ChallengePerformance ON TeamPerformances.team_id = ChallengePerformance.performance_id
                LEFT JOIN LeaguePerformance ON TeamPerformances.team_id = LeaguePerformance.performance_id
                WHERE TeamPerformances.week = %s
                GROUP BY TeamPerformances.team_id
            ) AS subquery
            WHERE TeamPerformances.team_id = subquery.team_id AND TeamPerformances.week = %s
        """, (week_number, week_number))
        
        conn.commit()
        cur.close()
        conn.close()

# Main function to decide which update function to call based on the day of the week
def main():
    today = datetime.now()
    if today.weekday() == 0:  # Monday
        update_team_performances_for_new_week()
    else:
        update_team_performances_with_performance_data()

if __name__ == "__main__":
    main()