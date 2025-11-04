def customer_initials(full_name: str) -> str:
    parts = [segment for segment in full_name.replace("-", " ").split() if segment]
    if not parts:
        return "N/A"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def date_key_to_date(date_key: int):
    from datetime import date

    value = str(date_key)
    if len(value) != 8:
        return None
    try:
        year = int(value[:4])
        month = int(value[4:6])
        day = int(value[6:])
        return date(year, month, day)
    except ValueError:
        return None

