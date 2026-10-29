# Design: The Exercise Book and the Blackboard

Year Group Hub, Mfantsipim 2007. Branch `claude/honours-board` (the design preview).

## 1. What the founder asked for

- **Welcome first, money second.** The boys should feel at home when they open it. When it is
  all dues and appeals, it becomes stressful to enter.
- **Authentic, not common.** The earlier Honours Board (gilt on dark wood, Cormorant Garamond)
  read as generic prestige: not Mfantsipim's colours, and fonts many polished sites use.
- **Chosen direction (29 Oct 2026):** "the mix" of three samples, plus blackboard and white chalk.
  School colours: **red and black**.

## 2. The concept

Things every old boy handled at school, used as materials:

| Material | Where it is used |
|---|---|
| **The blackboard**, written in white chalk, the date in the corner as a teacher writes it | The top of Home, the sidebar, the whole app in dark mode |
| **The exercise book**: cream paper, blue rules, the double red margin | The page in light mode; Home's body |
| **Paper slips**, pinned with a red drawing pin, a little crooked | Notices, birthdays, letters, meet-ups (always paper, in both modes) |
| **The painted sign**: slab capitals with a hard offset shadow, as Ghana's sign-writers paint them | Names, headings, buttons, the tab bar |
| **The typewriter** | Labels, dates, typed notices |
| **Biro** (blue) on paper, **chalk** (white) on the board | What people write: quotes, nicknames in lists, signatures |

## 3. The system

### Type
| Role | Face | Use |
|---|---|---|
| Sign | Alfa Slab One | Names (`display-xl`, `.lettered`), headings, buttons, tabs |
| Hand | Kalam | `font-display` and `.serif-italic`: what people write; `.chalk` on the board |
| Typed | Special Elite | `.kicker`, `.typed`, `.textlink`: labels, dates, notices |
| Reading | Literata | Body text and `.figure` (lining, tabular, so money lines up) |

### Colour
| Token | Exercise book (light) | Blackboard (dark) | Use |
|---|---|---|---|
| Ground (`--paper`) | `#fbf8ef` | `#1b1e1d` | The page |
| Ink | `#1d1b18` | `#eeede6` chalk | Text |
| Accent (`--gilt`, name kept) | `#b0102a` red ink | `#ff8a93` red chalk | Headings' red word, links, focus |
| Crest red | `#c8102e` | `#c8102e` | Painted names, tape, pins, the bar's edge |
| Black | `#141212` | `#141212` | Bars, buttons on paper, the board's ledge |
| Hand (`--hand`) | `#1f3a8a` biro | chalk | Handwriting |
| Rule | `#b9cfe2` | none | Exercise-book lines |

`.board` is always blackboard; `.slip` is always paper.

### Motifs
`.chalk`, `.chalk-red`, `.chalk-line` · `.painted` / `.painted-on-board` · `.lined` (blue rules and red margin) ·
`.pinned` (drawing pin) · `.tilt-l` / `.tilt-r` · `.tape` (red tape across a corner) · `.stamp`.

### Home, in order
1. The blackboard: the date chalked in the corner, "Akwaaba," in chalk, your nickname painted in red,
   years since we left the hill, how many are on the roll.
2. Something that needs you (never money): your place, an approval, a date to answer.
3. The boys in your city (or the newest on the roll).
4. Birthdays in the next ten days (only those who share them, in circles you share).
5. From the boys: posts from your circles, in their own hand.
6. The notice board, the next meet-up (stamped with how many are going), where you belong.
7. One quiet line for dues, an instalment and the open appeal.

### Navigation
Tabs: Home, Boys, Meet, Circles, Me. Notices, My dues and Give sit in the side list
(and in Me), not on the bar.

## 4. Rules kept
- No photographs required, no invented school symbols: the crest is the school's own file.
- Sample names and posts are marked as sample outside demo mode.
- Targets 48px; contrast AA (red ink on paper 6.8:1, red chalk on board 7:1, white on crest red 5.9:1).
- Reduced motion: tilts and animations switch off.
