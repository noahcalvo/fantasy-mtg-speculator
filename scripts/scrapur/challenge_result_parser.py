from bs4 import BeautifulSoup

MINIMUM_CHALLENGE_FINISH = 8

def extract_deck_links(html_content):
    deck_links = []
    soup = BeautifulSoup(html_content, 'html.parser')
    tournament_table = soup.find('table', class_='table-tournament')
    if tournament_table:
        deck_rows = tournament_table.find_all('tr', class_=lambda x: x and 'tournament-decklist' in x)
        decks = 0
        for row in deck_rows:
            if row.find_all('td').__len__() < 2:  # Skip rows with less than 2 td elements
                continue
            place = row.find('td').text[1]  # Get the first character of the text content
            deck_link_tag = row.find_all('td')[1].find('a')  # Second td contains the decklist link
            if deck_link_tag:
                deck_link = deck_link_tag['href']
                deck_links.append((place, deck_link))
                decks += 1
            if decks >= MINIMUM_CHALLENGE_FINISH:
                break
    return deck_links
