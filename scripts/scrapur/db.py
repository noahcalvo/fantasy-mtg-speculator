import psycopg2
from psycopg2 import Error
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

load_dotenv()  # take environment variables from .env.

# Function to connect to the PostgreSQL database
def connect_to_database():
    try:
        connection = psycopg2.connect(os.getenv("POSTGRES_URL"))
        return connection
    except Error as e:
        print("Error while connecting to PostgreSQL", e)
        return None

# # Function to insert card data into the Cards table
# def insert_card(connection, card_name):
#     try:
#         cursor = connection.cursor()
#         cursor.execute("INSERT INTO Cards (name) VALUES (%s) ON CONFLICT DO NOTHING", (card_name,))
#         connection.commit()
#         cursor.close()
#     except Error as e:
#         print("Error inserting card data:", e)

# Function to insert points data into the Points table
def insert_points(connection, points_dict, week):
    try:
        with connection.cursor() as cursor:
            insert_query = """
            INSERT INTO points (card_name, points, week)
            VALUES %s
            ON CONFLICT (card_name, week)
            DO UPDATE SET card_name = excluded.card_name, points = excluded.points, week = excluded.week;
            """
            # Convert the dictionary to a list of tuples
            data_tuples = [(card, points, week) for card, points in points_dict.items()]
            psycopg2.extras.execute_values(cursor, insert_query, data_tuples)
        connection.commit()
    except Error as e:
        print("Error inserting points data:", e)