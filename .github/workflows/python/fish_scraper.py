from bs4 import BeautifulSoup

def extract_deck_list(html_content):
    deck_list = {}

    # Parse HTML content
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find the div containing the deck table
    deck_table_container = soup.find('div', class_='deck-table-container')

    # Iterate over rows in the table
    for row in deck_table_container.find_all('tr'):
        # Check if it's a category header row
        if 'deck-category-header' in row.get('class', []):
            # Extract the category name (e.g., "Companion (1)")
            category_name = row.find('th').text.strip()
        else:
            # Extract card quantity and name
            cells = row.find_all('td')
            if len(cells) >= 2:
                quantity = cells[0].text.strip()
                card_name = cells[1].find('a').text.strip()
                # Add the card to the deck list dictionary
                deck_list[card_name] = int(quantity)

    return deck_list
