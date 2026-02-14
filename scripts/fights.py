import pandas as pd
import json
import re
from collections import defaultdict

# Read the CSV file with proper encoding handling
df = pd.read_csv('data/avatar.csv', encoding='latin-1')

# Strong fight indicators - these strongly suggest combat
STRONG_FIGHT_INDICATORS = [
    'attacks', 'attacking', 'attacked',
    'fights', 'fighting', 'fought',
    'battle', 'battling', 'battled',
    'duel', 'dueling', 'dueled',
    'strikes at', 'strikes', 'striking',
    'fires at', 'firing at',
    'throws a', 'hurls a', 'launches an attack',
    'blasts', 'blasting',
    'combat', 'combats',
    'dodges', 'dodging', 'blocks', 'blocking', 'deflects', 'deflecting',
    'sends a blast', 'throws a punch', 'kicks at',
    'ambush', 'ambushed',
    'firebends at', 'waterbends at', 'earthbends at', 'airbends at'
]

# Combat action patterns that indicate two-sided combat
COMBAT_PATTERNS = [
    r'\b(\w+)\s+(attacks|strikes at|fires at|fights|battles|kicks|punches|throws at|blasts)\s+(\w+)',
    r'\b(\w+)\s+(?:and|,)\s+(\w+)\s+(?:fight|battle|duel|clash)',
    r'\b(\w+)\s+(?:dodges|blocks|deflects|parries)\s+(?:.*?)\s+(?:from|by)\s+(\w+)',
]

# Training/non-combat exclusions
EXCLUDE_KEYWORDS = [
    'training session', 'practice session', 'demonstrates how', 
    'shows how to', 'teaching', 'instruction'
]

def is_likely_fight_scene(text):
    """Determine if text describes a fight scene"""
    if pd.isna(text):
        return False
    
    text_lower = text.lower()
    
    # Strong exclude for training
    if any(keyword in text_lower for keyword in EXCLUDE_KEYWORDS):
        return False
    
    # Check for strong fight indicators
    return any(indicator in text_lower for indicator in STRONG_FIGHT_INDICATORS)

def extract_characters_from_group(group):
    """Extract unique characters from a group of rows"""
    characters = set()
    for char in group['character'].dropna():
        if char != 'Scene Description':
            characters.add(char)
    return list(characters)

def find_character_mentions(text, all_characters):
    """Find which characters are actively mentioned in combat text"""
    text_lower = text.lower()
    mentioned = []
    
    for char in all_characters:
        char_lower = char.lower()
        # Check if character is mentioned in combat context
        if char_lower in text_lower:
            mentioned.append(char)
    
    return mentioned

def identify_combatants(fight_group, all_characters):
    """
    Identify who's fighting whom based on the text content
    Returns: (main_combatants, supporting_characters)
    """
    combined_text = ' '.join(fight_group['full_text'].dropna().astype(str))
    text_lower = combined_text.lower()
    
    # Score each character based on combat involvement
    combat_scores = {}
    
    for char in all_characters:
        score = 0
        char_lower = char.lower()
        
        # High score for being subject of combat verbs
        combat_subjects = [
            f"{char_lower} attacks", f"{char_lower} strikes",
            f"{char_lower} fights", f"{char_lower} fires",
            f"{char_lower} blasts", f"{char_lower} throws",
            f"{char_lower} blocks", f"{char_lower} dodges",
            f"{char_lower} defeats", f"{char_lower} kicks",
            f"{char_lower} punches"
        ]
        score += sum(3 for pattern in combat_subjects if pattern in text_lower)
        
        # Medium score for being object of combat
        combat_objects = [
            f"attacks {char_lower}", f"strikes {char_lower}",
            f"at {char_lower}", f"hits {char_lower}",
            f"against {char_lower}"
        ]
        score += sum(2 for pattern in combat_objects if pattern in text_lower)
        
        # Low score for general mentions
        score += text_lower.count(char_lower) * 0.5
        
        combat_scores[char] = score
    
    # Sort by combat involvement
    sorted_chars = sorted(combat_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Main combatants are top scorers with score > 2
    main_combatants = [char for char, score in sorted_chars if score >= 2][:6]
    supporting = [char for char in all_characters if char not in main_combatants]
    
    return main_combatants, supporting

def get_fight_description(fight_group):
    """Create a brief description of the fight"""
    # Get first few lines of actual dialogue/description
    descriptions = []
    for text in fight_group['full_text'].dropna():
        if len(text) > 20:
            descriptions.append(text)
        if len(descriptions) >= 2:
            break
    
    if descriptions:
        snippet = ' '.join(descriptions)
        return snippet[:250] + '...' if len(snippet) > 250 else snippet
    return ''

# Process the data
fights = []
fight_id = 0

print("Processing episodes...\n")

# Group by book and chapter to identify fight sequences
for (book, chapter_num, chapter), group in df.groupby(['book', 'chapter_num', 'chapter']):
    
    # Find all rows that mention combat
    fight_indices = []
    for idx, row in group.iterrows():
        text = str(row['full_text']) if pd.notna(row['full_text']) else ''
        if is_likely_fight_scene(text):
            fight_indices.append(idx)
    
    if not fight_indices:
        continue
    
    # Group consecutive fight rows with small gaps
    fight_sequences = []
    current_sequence = [fight_indices[0]]
    
    for i in range(1, len(fight_indices)):
        # If indices are close together (within 15 rows), consider them part of same fight
        if fight_indices[i] - fight_indices[i-1] <= 15:
            current_sequence.append(fight_indices[i])
        else:
            if len(current_sequence) >= 2:  # Minimum length for a fight
                fight_sequences.append(current_sequence)
            current_sequence = [fight_indices[i]]
    
    # Last sequence
    if len(current_sequence) >= 2:
        fight_sequences.append(current_sequence)
    
    # Process each fight sequence
    for seq_indices in fight_sequences:
        fight_group = df.loc[seq_indices]
        
        # Extract all characters mentioned
        all_characters = extract_characters_from_group(fight_group)
        
        if len(all_characters) < 1:
            continue
        
        # Identify main combatants vs supporting
        main_combatants, supporting = identify_combatants(fight_group, all_characters)
        
        # Skip if we can't identify clear combatants
        if len(main_combatants) == 0:
            main_combatants = all_characters[:2]
            supporting = all_characters[2:]
        
        # Get fight description
        description = get_fight_description(fight_group)
        
        fight_id += 1
        
        fight = {
            'id': fight_id,
            'book': book,
            'book_num': int(fight_group.iloc[0]['book_num']),
            'chapter': chapter,
            'chapter_num': int(chapter_num),
            'main_combatants': main_combatants,
            'supporting_characters': supporting,
            'all_characters': all_characters,
            'num_participants': len(all_characters),
            'num_main_combatants': len(main_combatants),
            'description': description
        }
        
        fights.append(fight)

# Filter out questionable fights (only 1 character and brief)
filtered_fights = []
for fight in fights:
    # Keep if: multiple characters OR single character but substantial fight
    if fight['num_participants'] >= 2 or (fight['num_participants'] == 1 and len(fight['description']) > 150):
        filtered_fights.append(fight)

fights = filtered_fights

# Re-number the fights
for i, fight in enumerate(fights, 1):
    fight['id'] = i

# Print summary
print(f"Total fights identified: {len(fights)}\n")
print(f"Fights by Book:")
for book_name in ['Water', 'Earth', 'Fire']:
    book_fights = [f for f in fights if f['book'] == book_name]
    print(f"  {book_name}: {len(book_fights)} fights")
    
    # Show character distribution
    chars_in_book = defaultdict(int)
    for fight in book_fights:
        for char in fight['main_combatants']:
            chars_in_book[char] += 1
    
    top_fighters = sorted(chars_in_book.items(), key=lambda x: x[1], reverse=True)[:5]
    if top_fighters:
        print(f"    Top fighters: {', '.join([f'{char} ({count})' for char, count in top_fighters])}")

# Save to JSON
output_data = {
    'metadata': {
        'total_fights': len(fights),
        'books': ['Water', 'Earth', 'Fire'],
        'book_stats': {
            'Water': {'num': 1, 'fights': len([f for f in fights if f['book'] == 'Water'])},
            'Earth': {'num': 2, 'fights': len([f for f in fights if f['book'] == 'Earth'])},
            'Fire': {'num': 3, 'fights': len([f for f in fights if f['book'] == 'Fire'])}
        }
    },
    'fights': fights
}

output_path = 'data/fights.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"\nData saved to: {output_path}")

# Show sample fights
print("\n" + "="*80)
print("SAMPLE FIGHTS:")
print("="*80)
for fight in fights[:10]:
    print(f"\nFight #{fight['id']} - {fight['book']} Book - {fight['chapter']} (Episode {fight['chapter_num']})")
    print(f"Main combatants: {', '.join(fight['main_combatants'])}")
    if fight['supporting_characters']:
        print(f"Also involved: {', '.join(fight['supporting_characters'][:3])}")
    print(f"Description: {fight['description'][:200]}...")