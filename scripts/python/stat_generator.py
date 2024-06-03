MINIMUM_CHALLENGE_FINISH = 8

def generate_stats(deck_list, result_type):
    # return early if deck didn't finish in top 8
    if result_type.name == "challenge" and result_type.place > MINIMUM_CHALLENGE_FINISH:
        return {}
    
    stats = {}
    for card_name, quantity in deck_list.items():
        # Initialize the stat structure if it doesn't exist.
        if card_name not in stats:
            stats[card_name] = {'challenge_champs': 0, 'challenge_copies': 0, 'league_copies': 0}
        
        if result_type.name == "challenge":
            if result_type.place == 1:
                stats[card_name]['challenge_champs'] += 1
            stats[card_name]['challenge_copies'] += (quantity)
        elif result_type.name == "league":
            stats[card_name]['league_copies'] += (quantity)
    return stats
