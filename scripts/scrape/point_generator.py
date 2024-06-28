def generate_points(deck_list, result_type):
    points = {
        "champs": 0,
        "decks": 0,
        "copies": 0,
    }
    for card_name, quantity in deck_list.items():
        if result_type.name == "Challenge":
            if result_type.place == 1:
                points.champs = 1
            elif result_type.place < 9:
                points.decks = 1
        elif result_type.name == "League":
            points[card_name] = .25
    return points
