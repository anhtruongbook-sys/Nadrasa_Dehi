import os

CSS_RULES = """
/* ==========================================================================
   JUSTIFY ALIGNMENT FOR ALL TAROT & READING INTERPRETATIONS
   ========================================================================== */
.tarot-storyline-content,
.tarot-storyline-content blockquote,
.tarot-storyline-content p,
.tarot-quint-lesson p,
.reading-card-desc,
.reading-card-advice,
.tarot-prescription-content,
.tarot-prescription-content blockquote,
.tarot-prescription-content p,
.pattern-desc,
.dignity-desc,
.tarot-modal-body p,
.tarot-info-block p,
.journal-item-story,
.journal-item-advice,
.reflection-note-text,
.pdf-card-text,
.pdf-story-quote,
.pdf-prescription-quote {
  text-align: justify !important;
  text-justify: inter-word !important;
  hyphens: auto !important;
  -webkit-hyphens: auto !important;
}

/* 4-Button Action Grid (2x2 on mobile, 4 columns on desktop, ZERO popup) */
.tarot-report-actions {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 8px !important;
  margin-top: 20px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

@media (min-width: 640px) {
  .tarot-report-actions {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}

.tarot-report-actions button {
  width: 100% !important;
  min-width: 0 !important;
  padding: 11px 6px !important;
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  border-radius: 8px !important;
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
}

@media (max-width: 350px) {
  .tarot-report-actions {
    grid-template-columns: 1fr !important;
  }
}

/* Hide popup elements completely */
.tarot-pdf-modal-overlay {
  display: none !important;
}
"""

def main():
    root = r"c:\Books\Neta Light"
    paths = [
        os.path.join(root, "styles.css"),
        os.path.join(root, "mobile_app", "assets", "www", "styles.css")
    ]
    for p in paths:
        if os.path.exists(p):
            with open(p, "a", encoding="utf-8") as f:
                f.write("\n" + CSS_RULES + "\n")
            print(f"Appended justify & grid CSS to: {p}")

if __name__ == '__main__':
    main()
