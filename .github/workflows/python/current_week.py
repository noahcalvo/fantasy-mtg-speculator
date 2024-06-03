from datetime import datetime

EPOCH = "04/08/2024"


def get_last_week_number():
    epoch = datetime.strptime(EPOCH, "%Y-%m-%d")
    today = datetime.now()
    weeks_passed = (today - epoch).days // 7

    # subtract one if today is a Monday so we get week of last Monday
    last_week = weeks_passed - (today.weekday() == 0)

    return last_week