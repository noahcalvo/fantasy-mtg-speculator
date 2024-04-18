
from challenge_result_parser import extract_deck_links
from db import connect_to_database, insert_points
from tournements import create_url, generate_tournement_page_links
from fetch import fetch_webpage
from fish_scraper import extract_deck_list
from point_generator import generate_points

import sys

print(sys.executable)

class ResultType:
    def __init__(self, name, place=None):
        self.name = name
        self.place = place

week_to_scrape = 1
base_url = "https://www.mtggoldfish.com"
combined_points_dict = {}  # Initialize an empty dictionary to store combined points
page = 1
while True:
    # get the url for the tournements occuring in the week
    tournements_url = create_url(week_to_scrape, "Modern Challenge", page)
    # get the html content of the tournements page
    print("fetching tournement list page:", tournements_url)
    this_weeks_tournements_html = fetch_webpage(tournements_url)
    if not this_weeks_tournements_html:
        break
    # parse tournement page links from the tournements page html
    tournement_links = generate_tournement_page_links(this_weeks_tournements_html)
    # should break here, when loop passes the last page
    if not tournement_links:
        break
    for tournement_link in tournement_links:
        url = base_url+tournement_link
        print("fetching tournement page:", url)
        html_content = fetch_webpage(url)
        if html_content:
            deck_list_links = extract_deck_links(html_content)
            for deck in deck_list_links:
                print("fetching deck list page:", "https://www.mtggoldfish.com"+deck[1])
                deck_list_html = fetch_webpage("https://www.mtggoldfish.com"+deck[1])
                deck_list = extract_deck_list(deck_list_html)
                points_dict = generate_points(deck_list, ResultType("Challenge", int(deck[0])))
                for card, points in points_dict.items():
                    combined_points_dict[card] = combined_points_dict.get(card, 0) + points
    page += 1

top_cards = sorted(combined_points_dict.items(), key=lambda x: x[1], reverse=True)[:10]
            
# Print the top 5 cards with their respective points
print("Top 5 cards:")
for card, points in top_cards:
    print(f"{card}: {points} points")

# Connect to the database
connection = connect_to_database()
if connection:
    # Assuming combined_points_dict is your dictionary of card -> points
    insert_points(connection, combined_points_dict, week_to_scrape)  # Assuming the week starts on 04/08/2024
    connection.close()  # Close the database connection when done

