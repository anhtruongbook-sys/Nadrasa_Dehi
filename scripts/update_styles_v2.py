# -*- coding: utf-8 -*-
import sys

with open(r'c:\Books\Neta Light\styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

anchor = """.tarot-sec-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #e5e7eb;
}"""

extra_css = """

/* Quintessence Box */
.tarot-quintessence-box {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%);
  border: 1.5px solid rgba(167, 139, 250, 0.4);
}

.tarot-quint-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.tarot-quint-img-wrap {
  width: 75px;
  height: 128px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  border: 1.5px solid rgba(251, 191, 36, 0.5);
}

.tarot-quint-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tarot-quint-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.tarot-quint-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quint-name {
  font-size: 1.15rem;
  font-weight: 900;
  color: #fbbf24;
}

.quint-sub {
  font-size: 0.82rem;
  color: #c4b5fd;
}

.quint-num-badge {
  font-size: 0.72rem;
  font-weight: 800;
  background: rgba(251, 191, 36, 0.2);
  color: #fef08a;
  padding: 2px 8px;
  border-radius: 12px;
}

.tarot-quint-lesson p {
  margin: 4px 0 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #f3f4f6;
}

/* Storyline Narrative Box */
.tarot-storyline-box {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  border-left: 4px solid #6366f1;
}

.tarot-storyline-content blockquote {
  margin: 0;
  font-size: 0.95rem;
  font-style: italic;
  line-height: 1.65;
  color: #e2e8f0;
}

/* Archetypal Patterns */
.tarot-patterns-box {
  border-left: 4px solid #ec4899;
}

.tarot-patterns-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tarot-pattern-item {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.pattern-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #f472b6;
}

.pattern-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(236, 72, 153, 0.2);
  color: #fbcfe8;
  padding: 2px 6px;
  border-radius: 4px;
}

.pattern-desc {
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.45;
}"""

if anchor in content:
    content = content.replace(anchor, anchor + extra_css, 1)

# Thêm light theme overrides
light_anchor = """body.theme-light .tarot-prescription-content blockquote {
  color: #1f2937;
}"""

extra_light = """

body.theme-light .tarot-quintessence-box {
  background: #fdfbf7;
  border-color: #f59e0b;
}

body.theme-light .quint-name {
  color: #b45309;
}

body.theme-light .quint-sub {
  color: #6d28d9;
}

body.theme-light .quint-num-badge {
  background: #fef3c7;
  color: #92400e;
}

body.theme-light .tarot-quint-lesson p {
  color: #1f2937;
}

body.theme-light .tarot-storyline-box {
  background: #f8fafc;
  border-color: #4f46e5;
}

body.theme-light .tarot-storyline-content blockquote {
  color: #1e293b;
}

body.theme-light .tarot-pattern-item {
  background: #fdf2f8;
  border-color: #f472b6;
}

body.theme-light .pattern-title {
  color: #be185d;
}

body.theme-light .pattern-desc {
  color: #374151;
}"""

if light_anchor in content:
    content = content.replace(light_anchor, light_anchor + extra_light, 1)

with open(r'c:\Books\Neta Light\styles.css', 'w', encoding='utf-8') as f:
    f.write(content)
print('[OK] styles.css updated')

with open(r'c:\Books\Neta Light\mobile_app\assets\www\styles.css', 'w', encoding='utf-8') as f:
    f.write(content)
print('[OK] mobile_app/assets/www/styles.css updated')
