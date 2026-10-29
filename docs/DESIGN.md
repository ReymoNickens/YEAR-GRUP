# Design: The Honours Board

Year Group Hub, Mfantsipim 2007. Stage A of the design reset (branch `claude/honours-board`).

## 1. Why the first redesign still looked generic

| Cause | Where it showed |
|---|---|
| The current "tasteful startup" kit: an editorial serif, Geist, small mono uppercase labels | Every screen. Interchangeable with Linear, Vercel and most AI-built products. |
| One section pattern repeated | A black rule, a serif title and "See all ›" on Home, Give, Me, Circles. |
| A fintech hero card in disguise | The red appeal block with a grid texture and a big number. |
| Uniform icon tiles | The four outlined shortcuts on Home. |
| Nothing specific to 2007 | The year was only text; swap the name and crest and it is any alumni app. |
| Product copy, not a voice | "Two taps to pay, and the receipt comes straight back." |
| Stock moves | Pastel initial avatars, a placeholder shield in place of the crest. |
| Sample numbers on the landing page | "40 on the roll" from fictional data. |

## 2. The concept

**Every school hall has honours boards**: names lettered in gold on dark wood, listed by year,
house and office. They are institutional and sentimental at once. They are about belonging to a
list, and they need no photographs.

The hub is built as that board and the papers pinned to it:

- **The board** (dark, lettered in gilt) carries identity and pride: the greeting, the appeal,
  the officers, who has answered.
- **Paper** (warm, ruled, printed) carries the business: dues ledgers, receipts, notices, forms.

Voice: an old boy writing to old boys, warm and a little ceremonial, never corporate.
"Your house is two names from the board", not "2 more givers to join".

The cohort's own spine is time: 2007, the year we left Kwabotwe, and 2027, the twentieth.

## 3. The system

### Type
| Role | Face | Use |
|---|---|---|
| Lettering | Cormorant (500 to 700, italic) | Headlines, names on the board, big figures. Caps with wide tracking for lettered names. |
| Text | Source Serif 4 (optical sizes) | Everything you read and press. A printed-programme feel, not an app sans. |
| Small capitals | Source Serif 4, 600, tracked 0.18em | Labels and section heads. Replaces the mono kickers. |

Figures are lining and tabular wherever money is compared.

### Colour and material
| Token | Board (dark) | Programme (light) | Use |
|---|---|---|---|
| Ground | `#12100d` | `#f1ebde` | The page |
| Raised | `#1b1814` | `#faf6ec` | Panels, fields |
| Ink | `#ece4d3` bone | `#1c1813` | Text |
| Muted | `#a69c8a` | `#6c6355` | Secondary text (AA) |
| Gilt | `#c9a45c` | `#7d5f26` bronze | Lettering, rules, progress, the primary action |
| Crest red | `#e0575e` | `#a3141e` | Only for what is owed or wrong |
| Paper | `#f3ecdd` on any ground | | Ledgers, receipts, notices |

Board bands stay dark in both modes: in light mode they hang on a cream programme page, as a board
hangs on a hall wall. No gradients except the faint grain of paper and wood.

### Graphic language (original, not school insignia)
1. **The moulding**: a gilt double rule (2px, 3px gap, 1px) that opens every board panel.
2. **Mitred corners**: small gilt corner marks on framed panels only (the appeal, the officers).
3. **Dot leaders**: name ........ value, as a programme or an honours board lists them.
4. **The years**: years since 2007 and to 2027, set in lettering, never as a countdown widget.
5. **Roll numbers**: a member's place on the roll, "No. 017", in small capitals.

The crest is the school's own file, used as supplied, at one size per context. Nothing is invented
in its place.

### Space and layout
- 4px base; steps 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Text measure 36 to 62 characters.
- Phones: 20px gutters, one column, the board band full-bleed.
- Desktop: a dark board sidebar; pages composed asymmetrically (7/5), not a stretched phone.
- Every section gets a treatment that fits its content: a framed panel for the appeal, a paper
  slip for a notice, a ledger for dues, a lettered list for houses, a letters column for notes.

### Components
- **Buttons**: square, 52px, small-capital labels. Primary is gilt on the board, ink on paper.
  Red only for paying what is owed.
- **Fields**: a single underline on paper, a framed box on the board.
- **Lists**: hairline-ruled, or dot-leadered where a value follows a name.
- **Avatars**: lettered monograms in a thin gilt ring. Your own is filled.
- **Navigation**: small-capital words, no icon tiles. A gilt bar marks where you are.

### Interaction
- Motion only to orient: content rises 6px and fades in on arrival (once), sheets slide from the
  edge, progress lines draw in. 200 to 400ms, ease-out, nothing loops. Reduced motion respected.
- Hover on desktop brightens gilt; press darkens. Focus is a 2px gilt outline offset by 3px.
- Targets 48px and up. Contrast AA throughout, including gilt on board (7.9:1) and bronze on
  cream (4.9:1).

## 4. Stage A scope
Tokens, typography, the frame (sidebar, top bar, tab bar), **Home** and **My dues**.
Other screens inherit the new type and colour but keep their old composition until Stage B.

## 5. Not done, on purpose
- No photographs, stock alumni, fabricated statistics or testimonials. Every number on Home is
  real data: givers counted from confirmed payments, members counted from confirmed places.
- No invented school symbols. The "07" and the moulding are ours; the crest is the school's.
