import requests
import time
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def set_origin(db_connection):
    cursor = db_connection.cursor()

    # Fetch all card names from the Cards table in your database.
    cursor.execute("SELECT card_id, name FROM Cards WHERE origin IS NULL;")
    cards = cursor.fetchall()

    for card_id, name in cards:
        # Properly encode the name for use in a URL
        encoded_name = requests.utils.quote(name)

        # Build Scryfall API URL
        url = f"https://api.scryfall.com/cards/search?q=is%3Afirstprint+{encoded_name}"

        try:
            # Make the request to Scryfall API
            response = requests.get(url)
            response.raise_for_status()  # Will raise an exception for HTTP error codes

            # Extract card data from response (assuming there's one match)
            card_data = response.json()
            first_print_set = card_data['data'][0]['set_name']
            
            print(f'Updating {name} with origin: {first_print_set}')
            
            # Update the origin column for this card in your database
            update_query = "UPDATE Cards SET origin = %s WHERE card_id = %s;"
            cursor.execute(update_query, (first_print_set, card_id))
            
        except requests.exceptions.HTTPError as errh:
            print(f"Http Error for {name}: ", errh)
        except requests.exceptions.ConnectionError as errc:
            print(f"Error Connecting for {name}: ", errc)
        except requests.exceptions.Timeout as errt:
            print(f"Timeout Error for {name}: ", errt)
        except requests.exceptions.RequestException as err:
            print(f"Error retrieving first printing of {name}: ", err)
        
        # Sleep between requests to avoid overwhelming Scryfall's server.
        time.sleep(0.1)  # 100ms pause to respect Scryfall's rate limit

    # Commit all changes after updating entries
    db_connection.commit()
    
    # Close cursor and connection if needed (depends on your specific DB connection management).
    cursor.close()

def main():
    print("os.getenv('POSTGRES_URL')", os.getenv("POSTGRES_URL"))
    conn = psycopg2.connect(os.getenv("POSTGRES_URL"))
    set_origin(conn)
    conn.close()

if __name__ == "__main__":
    main()

