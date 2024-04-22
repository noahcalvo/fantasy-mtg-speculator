
from tournement_result_parser import extract_deck_links
from db import connect_to_database, insert_stats
from tournements import create_url, generate_tournement_page_links
from fetch import fetch_webpage
from fish_scraper import extract_deck_list
from stat_generator import generate_stats

class ResultType:
    def __init__(self, name, place=None):
        self.name = name
        self.place = place

base_url = "https://www.mtggoldfish.com"

def scrape_tournaments(type, combined_stats_dict, week_to_scrape):
    searchKeyword = {
        "challenge": "Modern Challenge",
        "league": "Modern League"
    }.get(type)

    page = 1
    while True:
        tournements_url = create_url(week_to_scrape, searchKeyword, page)
        print("fetching tournement list page:", tournements_url)
        this_weeks_tournements_html = fetch_webpage(tournements_url)
        if not this_weeks_tournements_html:
            break
        tournement_links = generate_tournement_page_links(this_weeks_tournements_html)
        if not tournement_links:
            break
        for tournement_link in tournement_links:
            url = base_url+tournement_link
            print("fetching tournement page:", url)
            html_content = fetch_webpage(url)
            if html_content:
                deck_list_links = extract_deck_links(html_content, type)
                for deck in deck_list_links:
                    print("fetching deck list page:", "https://www.mtggoldfish.com"+deck[1])
                    deck_list_html = fetch_webpage("https://www.mtggoldfish.com"+deck[1])

                    if deck_list_html:
                        deck_list = extract_deck_list(deck_list_html)
                        points_dict = generate_stats(deck_list, ResultType(type, int(deck[0])))
                        
                        for card, new_stats in points_dict.items():
                            if card not in combined_stats_dict:
                                combined_stats_dict[card] = {'challenge_champs': 0, 'challenge_copies': 0, 'league_copies': 0}
                            
                            combined_card_stats = combined_stats_dict[card]
                            combined_card_stats['challenge_champs'] += new_stats['challenge_champs']
                            combined_card_stats['challenge_copies'] += new_stats['challenge_copies']
                            combined_card_stats['league_copies'] += new_stats['league_copies']
                            combined_stats_dict[card] = combined_card_stats
        page += 1

weeks_to_scrape = [0, 1]

combined_stats_dict = {} # Initialize an empty dictionary to store combined points
for week_to_scrape in weeks_to_scrape:    
    scrape_tournaments("league", combined_stats_dict, week_to_scrape)
    scrape_tournaments("challenge", combined_stats_dict, week_to_scrape)
            
    # Connect to the database
    connection = connect_to_database()
    if connection:
        # Assuming combined_points_dict is your dictionary of card -> points
        insert_stats(connection, combined_stats_dict, week_to_scrape, 0)  # Assuming the week starts on 04/08/2024
        connection.close()  # Close the database connection when done

