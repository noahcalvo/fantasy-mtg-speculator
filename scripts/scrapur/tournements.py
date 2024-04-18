from datetime import datetime, timedelta
from urllib.parse import urlencode
from bs4 import BeautifulSoup

STARTDATE = "04/08/2024"

def create_url(week, name, page=1):
    date_range = create_date_range_string(week)
    base_url = "https://www.mtggoldfish.com/tournament_searches/create"
    query_parameters = {
        "utf8": "✓",
        "tournament_search[name]": name,
        "tournament_search[format]": "modern",
        "tournament_search[date_range]": date_range,
        "commit": "Search",
        "page": page
    }

    url = base_url + "?" + urlencode(query_parameters)
    return(url)

def generate_tournement_page_links(html_content):
    tournement_result_links = []
    soup = BeautifulSoup(html_content, 'html.parser')
    tournament_list_table = soup.find('table', class_='table-striped')
    if tournament_list_table:
        tournament_rows = tournament_list_table.find_all('tr')
        for row in tournament_rows:
            tournament_link_tag = row.find('a')
            if tournament_link_tag:
                tournament_link = tournament_link_tag['href']
                tournement_result_links.append(tournament_link)
    return tournement_result_links

def create_date_range_string(week_number):
    start_date = datetime.strptime(STARTDATE, "%m/%d/%Y")
    start_date += timedelta(weeks=week_number)
    end_date = start_date + timedelta(days=6)
    return f"{start_date.strftime('%m/%d/%Y')} - {end_date.strftime('%m/%d/%Y')}"