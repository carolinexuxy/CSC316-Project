
# This script prepares data for a stacked area chart for each character and element
# in the following structure: data[character][element] = { chap: 1, angrily:0, ...}
# where frequencies are accumulated across chapters.

from collections import Counter, defaultdict
import json
import re
import nltk
import pandas as pd
# TODO: make sure to run the download lines below
# nltk.download('averaged_perceptron_tagger')
# nltk.download('punkt')


# -----------------------------
# Configuration
# -----------------------------
CSV_PATH = "avatar.csv"
OUTPUT_PATH = "character_data.json"
IGNORE_WORDS = {
    "back", "away", "again", "still", "up", "down", "around", "forward", "slightly", "somewhat", "further",
    "upward", "closer", "far", "anyway", "voiceover", "motionless", "nearby", "offcamera", "beside", "once",
    "flashback", "before", "along", "nearly", "barely", "immediately", "seemingly", "flutter", "aback", "ago",
    "instead", "unexpectedly", "hide", "finally", "merely", "aside", "ahead", "slowly", "suddenly", "clearly",
    "upside", "backward", "already", "however", "onward", "lower", "out", "inside", "fast", "albeit", "suddenly",
    "slowly", "rather", "totally", "visibly", "simply", "closely", "fully", "alone", "hallway", "anymore", "initially",
    "momentarily", "northward", "twice", "enough", "quite", "instantly", "utterly", "visually", "better", "nowhere",
    "repeatedly", "continuously", "ambiguously", "abruptly", "faster", "widely", "presumably", "broadly", "quickly",
    "deep", "deeply", "directly", "lowly", "bully", "highly", "somehow", "earlier", "louder", "tightly", "progressively",
    "apart", "later", "somewhere", "ashore", "outward", "next", "accidentally", "louder", "everywhere", "completely",
    "behind", "normally", "simultaneously", "successfully", "eventually", "extremely", "partially", "alongside",
    "thoroughly", "mostly",
    "not", "very", "just", "over", "off", "even", "together", "only", "now", "much", "close", "yet",
    "nose", "more", "belly", "sway", "necklace", "outburst", "frog", "less", "avatar", "open", "bone",
    "short", "neck", "song", "straight", "pathway", "becomes", "first", "sang", "screams",
    "aang", "sokka", "sokkas", "kataras", "zuko", "katara", "yue", "appa", "appas", "momo", "meng", "jeong",
    "iroh", "irohs", "hakoda", "tong",
    "here", "there", "then", "almost", "too", "so", "as", "well", "also", "really", "else", "more", "right",
    "soon", "long", "actually"
}

ELEMENT_MAP = {
    "Water": {
        "sadly", "nervously", "hopelessly", "weakly", "disappointedly", "sorrowfully",
        "pensively", "supportively", "reassuringly", "thoughtfully", "anxiously",
        "dreamily", "timidly", "humblly", "unsurely", "pleasantly", "calmly", "wistfully",
        "dreamingly", "softly", "sweetly", "hopefully", "regretfully", "tiredly",
        "tearfully", "sympathetically", "concernedly", "consolingly", "gently",
        "approvingly", "warmly", "uncomfortably", "emotionally", "sheepishly",
        "desperately", "worriedly", "quietly", "innocently", "fearfully", "doubtfully",
        "confusedly", "lovingly", "peacefully", "contentedly", "comfortingly",
        "miserably", "resignedly", "apathetically", "dejectedly", "lazily",
        "peevishly", "formally", "alertly", "inconspicuously", "reluctantly",
        "hesitatingly", "pathetically", "gratefully", "admiringly",
        "encouragingly", "moodily", "surprisingly", "brightly", "sleepily",
        "uneasily", "understandingly", "practically", "humbly", "compassionately",
        "sincerely", "meekly", "solicitously", "delicately", "correctly", "nostalgically", 
        "guiltily", "uselessly", "dubiously", "kindly", 
        "perfectly", "bemusedly", "pleadingly", "helplessly", "hesitantly",
        "respectfully", "jovially"
    },

    "Earth": {
        "stubbornly", "heavily", "firmly", "authoritatively", "ponderously", "seriously",
        "commandingly", "defensively", "confidently", "grumpily", "hungrily",
        "matteroffactly", "obstinately", "sternly", "neatly", "warily",
        "blandly", "partially", "carefully", "unhappily", "casually", "comfortably",
        "complacently", "tersely", "gravely",
        "decisively", "defiantly", "overdramatically", "shamefully",
        "smartly", "dismally", "roughly", "boldly", "readily", "briskly", "narrowly",
        "condescendingly", "disdainfully", "impolitely", "grimly", "childishly",
        "easily", "obviously", "dangerously", "monotonously", "hurredly",
        "solemnly", "oddly", "creepily", "emotionlessly", "scornfully",
        "maniacally",  "knowingly",
        "loudly", "curtly", "despairingly", "subsequently", "sinisterly",
        "unsteadily", "sadistically", "unwillingly", "contemptuously", "craftily",
        "assertively", "ravenously", "noisily", "patheically",  "intimidatingly",
        "sourly", "causally", "particularly", "halfheartedly", "afar", "inadvertently",
        "annoyed", "ominously", "respectively", "uncontrollably", "irritatingly",
        "flatly", "unenthusiastically", "cautiously", "bluntly"
    },

    "Fire": {
        "angrily", "indignantly", "dramatically", "aggressively", "hurriedly", "rapidly",
        "enthusiastically", "triumphantly", "excitedly", "vigorously", "ecstatically",
        "painfully", "hysterically", "proudly", "frantically", "accusingly",
        "irritably", "harshly", "impatiently", "disgustedly", "crossly", "furiously",
        "hatefully", "tauntingly", "threateningly", "emotionally", "actively",
        "offensively", "wildly", "urgently", "sharply", "anger",
        "agitatedly", "overdramatically", "menacingly", "sinisterly", "assertively",
        "ravenously", "boldly", "swiftly", "frightfully", "theatrically", "brazenly",
        "effortlessly", "bitterly", 'evilly', "suspiciously", "brazenly", "arrogantly",
        "crazily", "insanely", "menacingly"
    },

    "Air": {
        "sarcastically", "mockingly", "lightly", "playfully", "nonchalantly",
        "smugly", "sly", "humorously", "amusingly", "breezily", "quizzically", "coolly",
        "joyfully", "exuberantly", "curiously", "questioningly", "persuasively",
        "optimistically", "cheerfully", "eagerly", "nasally", "drowsily", "happily",
        "apologetically", "jokingly", "fakejokingly", "lightheartedly",
        "mischievously", "comically", "carelessly", "idly", "surreptitiously",
        "unconvincingly", "awkwardly", "teasingly", "dismissively",
        "distantly", "joyously", "casually", "sheepishly", "strangely",
        "inconspicuously", "secretly", "swfitly", "skeptically", "practically",
        "surprisingly", "brightly", "inquisitively", "flirtatiously", "openly",
        "cunningly", "knowingly", "cleverly", "finely", "intricately",
        "playfully", "joyously"
    }
}

# -----------------------------
# Helper functions
# -----------------------------
def extract_bracket_text(text):
    """
    Returns a list of strings found inside square brackets.
    """
    if pd.isna(text):
        return []
    return re.findall(r"\[(.*?)\]", text)


def tokenize(text):
    """
    Lowercase, remove punctuation, split into words.
    """
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text.split()

def filter(words):
    """
    Keep only adverbs (RB*)
    """
    tagged = nltk.pos_tag(words)
    allowed_tags = {"RB", "RBR", "RBS"}
    return [word for word, tag in tagged if tag in allowed_tags and word not in IGNORE_WORDS]

# -----------------------------
# Main processing
# -----------------------------
df = pd.read_csv(CSV_PATH, encoding="latin1")

# Structure: data[character][element][chapter] = Counter()
data = defaultdict(lambda: {elem: defaultdict(Counter) for elem in ELEMENT_MAP.keys()})
unique_characters = df["character"].unique().tolist() 

# iterate each row of data
for _, row in df.iterrows():
    character = row["character"]
    full_text = row["full_text"]
    # flatten chapters across books/seasons
    chapter = int(row["chapter_num"] + (row["book_num"] - 1) * 20)

    # Skip non-character rows if desired
    if character.lower() == "scene description":
        continue
    
    # extract words in brackets
    bracket_chunks = extract_bracket_text(full_text)
    if not bracket_chunks:
        continue

    # clean words (lowercase, splitting, punctuation)
    words = []
    for chunk in bracket_chunks:
        words.extend(tokenize(chunk))
    
    # filter words to keep only meaningful adverbs
    words = filter(words)
    if not words:
        continue

    # count words by element for the character and chapter
    for word in words:
        for elem, word_set in ELEMENT_MAP.items():
            if word in word_set:
                data[character][elem][chapter][word] += 1

# accumulate counts across chapters
for char in unique_characters:
    for elem, word_set in ELEMENT_MAP.items():
        cumulative = Counter({w: 0 for w in word_set})  # start with zeros
        for chap in range(1, 62):
            # Ensure all words exist in the current chapter
            for w in word_set:
                data[char][elem][chap][w] += cumulative[w]
            # Update cumulative
            for w in word_set:
                cumulative[w] = data[char][elem][chap][w]

# -----------------------------
# Convert to stacked-area-ready JSON
# -----------------------------
final_json = {}

for character, elem_dict in data.items():
    final_json[character] = {}
    for elem, chapters in elem_dict.items():
        # Convert Counter per chapter into dict, include 'chap' key
        chap_list = []
        for chap_num in sorted(chapters.keys()):
            entry = {"chap": chap_num}
            entry.update(chapters[chap_num])
            chap_list.append(entry)
        final_json[character][elem] = chap_list

# write to file
with open(OUTPUT_PATH, "w") as f:
    json.dump(final_json, f, indent=2)

print(f"Character data written to {OUTPUT_PATH}")