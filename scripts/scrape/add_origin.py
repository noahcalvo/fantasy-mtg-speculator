import requests
import time
import psycopg2
import os
from unidecode import unidecode
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def set_origin(db_connection):
    cursor = db_connection.cursor()

    # Fetch all card names from the Cards table in your database.
    cursor.execute("SELECT card_id, name FROM Cards WHERE origin IS NULL OR origin = 'unknown';")
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

            originSet = "unknown"

            i = 0
            while i < len(card_data['data']):
                if unidecode(card_data['data'][i]['name']) == unidecode(name):
                    print(f'Found {name} in set {card_data["data"][i]["set_name"]}')
                    originSet = card_data['data'][i]['set_name']
                    break
                card_faces = card_data['data'][i].get('card_faces')
                print(f'card_faces: {card_faces}')
                if card_faces and unidecode(card_faces[0]['name']) == unidecode(name):
                    print(f'Found {name} in set {card_data["data"][i]["set_name"]} (double sided card)')
                    # double sided cards require this edge case
                    originSet = card_data['data'][i]['set_name']
                    break
                print(f'Found {card_data["data"][i]["name"]} instead of {name}')
                # print(f'Looking for {name} in {card_data["data"][i]["card_faces"]} instead')
                i += 1

            print(f'Updating {name} with origin: {originSet}')            

            # Update the origin column for this card in your database
            update_query = "UPDATE Cards SET origin = %s WHERE card_id = %s;"
            cursor.execute(update_query, (originSet, card_id))
            
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

