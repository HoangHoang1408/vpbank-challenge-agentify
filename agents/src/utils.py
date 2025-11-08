import json
import re
from operator import itemgetter

def read_jsonl(file_path):
    with open(file_path, "r") as f:
        return [json.loads(line) for line in f]

def write_jsonl(data, file_path, mode="w"):
    with open(file_path, mode) as f:
        for item in data:
            json.dump(item, f)
            f.write("\n")

def read_json(file_path):
    with open(file_path, "r") as f:
        return json.load(f)

def write_json(data, file_path):
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

JSON_PATTERN = re.compile(r"```json\n([\s\S]*?)\n```")
def parse_from_json(text: str) -> dict:
    """Extract the last json answer from text.

    Args:
        text (str): Text containing a json answer

    Returns:
        Optional[str]: The extracted answer if found, None otherwise
    """
    matches = JSON_PATTERN.findall(text)
    if matches:
        for match in matches[::-1]:
            try:
                return json.loads(match.strip())
            except Exception:
                continue
    return {}


def safe_itemgetter(*items, default=None):
    getter = itemgetter(*items)
    def _safe_getter(obj):
        try:
            return getter(obj)
        except (KeyError, IndexError):
            # If multiple items are requested, return a tuple of defaults
            if len(items) > 1:
                return tuple(default for _ in items)
            # Otherwise, return the single default value
            return default
    return _safe_getter