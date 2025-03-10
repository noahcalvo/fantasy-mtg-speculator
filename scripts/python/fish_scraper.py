from bs4 import BeautifulSoup

def extract_deck_list(html_content):
    deck_list = {}

    # Parse HTML content
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find the div containing the deck table
    deck_input = soup.find('input', {'name': 'deck_input[deck]'})['value']

    if deck_input is None:
        print("No deck table found.")
        print(html_content)
        return deck_list
    
    # for each line in deck_input.splitlines():
    for line in deck_input.splitlines():
        if line == "":
            continue
        if " " in line:
            quantity, card_name = line.split(" ", 1)
        else:
            continue
        deck_list[card_name] = int(quantity)

    return deck_list
