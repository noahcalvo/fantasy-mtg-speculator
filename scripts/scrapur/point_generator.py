def generate_points(deck_list, result_type):
    points = {}
    for card_name, quantity in deck_list.items():
        if result_type.name == "Challenge":
            if result_type.place == 1:
                points[card_name] = 0.5 * quantity + 2
            elif result_type.place < 9:
                points[card_name] = 0.5 * quantity
        elif result_type.name == "League":
            points[card_name] = .25
    return points
