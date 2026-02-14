"""
Process Avatar: The Last Airbender transcript data to count
bending instances per element across all episodes.

Dataset: https://www.kaggle.com/datasets/ekrembayar/avatar-the-last-air-bender?select=avatar.csv
Download avatar.csv and place it in ../data/avatar.csv before running.
Output: ../data/element_bending.json
"""

import csv
import json
import re
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, '..', 'data')
INPUT_CSV = os.path.join(DATA_DIR, 'raw','avatar.csv')
OUTPUT_JSON = os.path.join(DATA_DIR, 'element_bending.json')

# Patterns for each element's bending keywords (includes sub-skills)
BENDING_PATTERNS = {
    'water': [
        r'waterbend\w*', r'water\s*bend\w*',
        r'bloodbend\w*', r'blood\s*bend\w*',
        r'healing\s+water', r'ice\s*bend\w*',
    ],
    'earth': [
        r'earthbend\w*', r'earth\s*bend\w*',
        r'metalbend\w*', r'metal\s*bend\w*',
        r'sandbend\w*', r'sand\s*bend\w*',
        r'lavabend\w*',
    ],
    'fire': [
        r'firebend\w*', r'fire\s*bend\w*',
        r'lightningbend\w*', r'lightning\s*bend\w*',
        r'combustionbend\w*',
    ],
    'air': [
        r'airbend\w*', r'air\s*bend\w*',
    ],
}


def count_bending_mentions(text, patterns):
    """Count bending keyword matches in a line of text."""
    if not text:
        return 0
    count = 0
    for pattern in patterns:
        count += len(re.findall(pattern, text, re.IGNORECASE))
    return count


def process_data():
    element_totals = {'water': 0, 'earth': 0, 'fire': 0, 'air': 0}
    episodes = {}

    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = row.get('full_text', '')
            book = row.get('book', '')
            book_num = row.get('book_num', '')
            chapter = row.get('chapter', '')
            chapter_num = row.get('chapter_num', '')

            ep_key = f"{book_num}-{chapter_num}"
            if ep_key not in episodes:
                episodes[ep_key] = {
                    'book': book,
                    'book_num': int(book_num) if book_num else 0,
                    'chapter': chapter,
                    'chapter_num': int(chapter_num) if chapter_num else 0,
                    'water': 0, 'earth': 0, 'fire': 0, 'air': 0,
                }

            for element, patterns in BENDING_PATTERNS.items():
                count = count_bending_mentions(text, patterns)
                element_totals[element] += count
                episodes[ep_key][element] += count

    output = {
        'totals': element_totals,
        'episodes': sorted(episodes.values(), key=lambda x: (x['book_num'], x['chapter_num'])),
    }

    # Print summary
    print("=== Element Bending Mentions ===")
    for element, count in element_totals.items():
        print(f"  {element.capitalize():8s}: {count}")
    print(f"  {'Total':8s}: {sum(element_totals.values())}")
    print(f"\nProcessed {len(episodes)} unique episodes.")

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)

    print(f"Output written to {OUTPUT_JSON}")


if __name__ == '__main__':
    process_data()
