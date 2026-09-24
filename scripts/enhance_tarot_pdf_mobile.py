import os

CSS_MOBILE_ENHANCE = """
/* Responsive Mobile Enhancements for PDF Sheet Preview */
@media (max-width: 600px) {
  .tarot-pdf-paper {
    padding: 16px 12px !important;
  }
  .pdf-hdr-banner {
    flex-direction: column !important;
    gap: 8px !important;
  }
  .pdf-hdr-title {
    font-size: 1.05rem !important;
    line-height: 1.3 !important;
  }
  .pdf-hdr-subtitle {
    font-size: 0.78rem !important;
  }
  .pdf-hdr-date {
    text-align: left !important;
    font-size: 0.78rem !important;
    border-top: 1px dashed #e2e8f0 !important;
    padding-top: 4px !important;
    width: 100% !important;
  }
  .tarot-pdf-modal-footer {
    flex-direction: column-reverse !important;
  }
  .tarot-pdf-modal-footer button {
    width: 100% !important;
  }
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
                f.write("\n" + CSS_MOBILE_ENHANCE + "\n")
            print(f"Appended responsive enhancements to {p}")

if __name__ == '__main__':
    main()
