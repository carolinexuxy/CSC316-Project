"""
ATLA Moral Growth Processing (tidy output)
-----------------------------------------
Input:  avatar.csv  (columns include: character, full_text, book_num, chapter_num, ...)
Output: data/processed/moral_counts_tidy.csv with columns:

- chap_global   (chapter_num + (book_num-1)*20)
- book_num
- chapter_num
- character     (one of: aang, katara, sokka, toph, zuko, suki)
- word          (moral category name, e.g., duty_honor / justice / conflict_doubt / compassion / identity)
- count_norm    (category count normalized per 1,000 words)

Guarantees:
- Every (chap_global, book_num, chapter_num, character, word) combination appears exactly once.
- Missing combos are filled with count_norm = 0.
"""

import re
import sys
from pathlib import Path
import pandas as pd

# -----------------------------
# CONFIG
# -----------------------------
INPUT_CSV = "data/raw/avatar.csv"
ENCODING = "latin1"          # matches your previous pipeline
OUTPUT_DIR = "data/processed"
OUTPUT_FILE = "moral_counts_tidy.csv"

REMOVE_BRACKETS = True
MAIN_CHARACTERS = ["aang", "katara", "sokka", "toph", "zuko", "suki"]

# avatar.csv column names
COL_CHARACTER = "character"
COL_TEXT = "full_text"
COL_BOOK_NUM = "book_num"
COL_CHAPTER_NUM = "chapter_num"

# -----------------------------
# Speaker normalization
# -----------------------------
def normalize_character(raw: str) -> str | None:
    if pd.isna(raw):
        return None
    s = str(raw).strip().lower()
    s = re.sub(r"\s*\(.*?\)\s*", "", s).strip()  # remove parentheticals
    # if your dataset has extras like "aang:" strip punctuation
    s = re.sub(r"[:\-]+$", "", s).strip()
    if s in MAIN_CHARACTERS:
        return s
    return None

# -----------------------------
# Moral lexicon (categories)
# -----------------------------
MORAL_LEXICON = {
    "duty_honor": [
        "honor", "destiny", "duty", "obligation", "responsibility",
        "redeem", "redemption", "worthy", "shame", "pride", "legacy"
    ],
    "justice": [
        "right", "wrong", "justice", "unfair", "mercy", "forgive",
        "forgiveness", "revenge", "punish", "innocent", "guilty",
        "consequence", "deserve"
    ],
    "conflict_doubt": [
        "maybe", "confused", "torn", "doubt", "choice", "choose", "decide",
        "regret", "should", "shouldn't", "can't", "cannot", "won't",
        "what if", "i don't know"
    ],
    "compassion": [
        "help", "protect", "care", "friend", "trust", "together", "save",
        "sorry", "understand", "hope", "believe", "family"
    ],
    "identity": [
        "who i am", "who we are", "myself", "yourself", "identity",
        "change", "changed", "become", "meant to be", "i am", "i'm not"
    ],
}

def compile_patterns(lex: dict[str, list[str]]) -> dict[str, list[re.Pattern]]:
    compiled: dict[str, list[re.Pattern]] = {}
    for cat, terms in lex.items():
        pats = []
        for t in terms:
            t = t.strip().lower()
            # phrase vs word
            if " " in t or "'" in t:
                pats.append(re.compile(re.escape(t)))
            else:
                pats.append(re.compile(rf"\b{re.escape(t)}\b"))
        compiled[cat] = pats
    return compiled

LEX_PATTERNS = compile_patterns(MORAL_LEXICON)

# text cleaning
BRACKET_RE = re.compile(r"\[[^\]]*\]|\([^\)]*\)")
NONWORD_RE = re.compile(r"[^a-z0-9\s']+")

def clean_text(text: str, remove_brackets: bool = True) -> str:
    if text is None or (isinstance(text, float) and pd.isna(text)):
        return ""
    t = str(text).lower()
    if remove_brackets:
        t = BRACKET_RE.sub(" ", t)
    t = NONWORD_RE.sub(" ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def count_matches(text: str, patterns: list[re.Pattern]) -> int:
    return sum(len(p.findall(text)) for p in patterns)

# -----------------------------
# Main
# -----------------------------
def main():
    in_path = Path(INPUT_CSV)
    if not in_path.exists():
        print(f"[ERROR] Cannot find input CSV: {in_path.resolve()}", file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(in_path, encoding=ENCODING)

    # Validate required columns
    required = [COL_CHARACTER, COL_TEXT, COL_BOOK_NUM, COL_CHAPTER_NUM]
    missing = [c for c in required if c not in df.columns]
    if missing:
        print(f"[ERROR] Missing columns in avatar.csv: {missing}", file=sys.stderr)
        print(f"Columns found: {list(df.columns)}", file=sys.stderr)
        sys.exit(1)

    # Normalize + filter characters
    df["character_norm"] = df[COL_CHARACTER].apply(normalize_character)
    df = df[df["character_norm"].isin(MAIN_CHARACTERS)].copy()

    # Ensure numeric
    df[COL_BOOK_NUM] = pd.to_numeric(df[COL_BOOK_NUM], errors="coerce")
    df[COL_CHAPTER_NUM] = pd.to_numeric(df[COL_CHAPTER_NUM], errors="coerce")
    df = df.dropna(subset=[COL_BOOK_NUM, COL_CHAPTER_NUM])
    df[COL_BOOK_NUM] = df[COL_BOOK_NUM].astype(int)
    df[COL_CHAPTER_NUM] = df[COL_CHAPTER_NUM].astype(int)

    # chap_global (same scheme you used before)
    df["chap_global"] = df[COL_CHAPTER_NUM] + (df[COL_BOOK_NUM] - 1) * 20

    # Clean text and compute word counts
    df["text_clean"] = df[COL_TEXT].apply(lambda x: clean_text(x, REMOVE_BRACKETS))
    df["word_count"] = df["text_clean"].apply(lambda s: 0 if not s else len(s.split()))

    # Aggregate per (episode, character)
    group_cols = ["chap_global", COL_BOOK_NUM, COL_CHAPTER_NUM, "character_norm"]
    agg = (
        df.groupby(group_cols, as_index=False)
          .agg(
              full_text_clean=("text_clean", lambda s: " ".join([x for x in s if isinstance(x, str)])),
              total_words=("word_count", "sum"),
          )
    )

    # Compute normalized counts per moral category
    for cat, pats in LEX_PATTERNS.items():
        agg[f"{cat}_count"] = agg["full_text_clean"].apply(lambda t: count_matches(t, pats))
        agg[f"{cat}_norm"] = agg.apply(
            lambda r: (r[f"{cat}_count"] / r["total_words"] * 1000) if r["total_words"] > 0 else 0.0,
            axis=1
        )

    # Melt into requested tidy format:
    # chap_global, book_num, chapter_num, character, word, count_norm
    norm_cols = [f"{cat}_norm" for cat in MORAL_LEXICON.keys()]
    tidy = agg.melt(
        id_vars=["chap_global", COL_BOOK_NUM, COL_CHAPTER_NUM, "character_norm"],
        value_vars=norm_cols,
        var_name="word",
        value_name="count_norm"
    )

    # Clean "word" values: "duty_honor_norm" -> "duty_honor"
    tidy["word"] = tidy["word"].str.replace("_norm", "", regex=False)

    # Rename character column to requested name
    tidy = tidy.rename(columns={"character_norm": "character", COL_BOOK_NUM: "book_num", COL_CHAPTER_NUM: "chapter_num"})

    # ---------------------------------------------------------
    # Guarantee: every (chapter, character, moral category) exists
    # ---------------------------------------------------------
    chapters = tidy[["chap_global", "book_num", "chapter_num"]].drop_duplicates()
    characters = pd.DataFrame({"character": MAIN_CHARACTERS})
    morals = pd.DataFrame({"word": list(MORAL_LEXICON.keys())})

    full_index = (
        chapters.assign(_k=1)
        .merge(characters.assign(_k=1), on="_k")
        .merge(morals.assign(_k=1), on="_k")
        .drop(columns=["_k"])
    )

    tidy_full = full_index.merge(
        tidy,
        on=["chap_global", "book_num", "chapter_num", "character", "word"],
        how="left"
    )

    # Fill missing with 0
    tidy_full["count_norm"] = tidy_full["count_norm"].fillna(0.0)

    # Sort for readability
    tidy_full = tidy_full.sort_values(["chap_global", "character", "word"]).reset_index(drop=True)

    # Output
    out_dir = Path(OUTPUT_DIR)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / OUTPUT_FILE
    tidy_full.to_csv(out_path, index=False)

    print("[OK] Wrote:", out_path)
    print("Columns:", list(tidy_full.columns))
    print("Rows:", len(tidy_full))

if __name__ == "__main__":
    main()
