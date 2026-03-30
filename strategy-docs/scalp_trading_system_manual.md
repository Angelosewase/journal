# The SCALP Trading System — Rule-Based Strategy Manual

## Overview

The SCALP system is a simplified, rule-based intraday scalping framework optimized for high risk-reward and high win rate trading. It is broken down into five steps, each represented by a letter in the acronym **S C A L P**. Each letter is a mandatory step in the trading protocol checklist — no step is optional, and no step is skipped.

The system operates on just **three timeframes** and is applied exclusively to **two currency pairs**:

- **Currency Pairs:** EURUSD and GBPUSD only
- **Timeframe 1 — 1 Hour (H1):** Find direction and define the impulse range
- **Timeframe 2 — 5 Minute (M5):** Refine and qualify points of interest
- **Timeframe 3 — 1 Minute (M1):** Execute the entry

There is no weekly, daily, 4-hour, or 30-minute analysis required. The multi-timeframe complexity is eliminated by design.

---

## System Key Performance Indicators (KPIs)

These are the expected outputs of the system when followed correctly. These are not aspirational targets — they are the built-in mathematical results of the rules applied consistently over a sufficient sample size.

| KPI | Target |
|---|---|
| Win Rate | 50% |
| Risk-Reward | 1 to 3 (minimum) |
| Trades Per Week | 1 to 4 |
| Risk Per Trade | 1% |
| Sample Size to Qualify | At least 50 trades |
| Currency Pairs | EURUSD and GBPUSD only |
| Average Stop Loss | 3 to 7 pips |
| Average Hold Time | ~1 hour |
| Monthly Return Target | 2–4% |

The strategy targets slow, conservative, reliable, and consistent gains of just 2, 3, 4% per month. The average movement of EURUSD and GBPUSD in the first hour of the key time window is 25 to 30 pips. With a 3 to 7 pip stop loss, only 9 to 21 pips are needed to achieve a 1 to 3 risk-reward — well within the average hourly range. This means the average hold time of the trade is just 1 hour, in and out.

---

## The SCALP Acronym — Step Reference

| Letter | Step | Purpose |
|---|---|---|
| **S** | Spot the Impulse | Identify market direction on H1 |
| **C** | Calculate Premium and Discount | Define the valid trade zone using 50% Fibonacci |
| **A** | Assess the Points of Interest | Identify and qualify the two key supply/demand zones |
| **L** | Liquidity | Confirm liquidity has been taken at the right time |
| **P** | Position | Execute the entry with confirmation |

---

## Step 1 — S: Spot the Impulse

### Purpose

The purpose of this step is to establish a single, clear market direction using only the H1 timeframe. Multi-timeframe top-down analysis is not used in this system because conflicting structures across different timeframes cause confusion, misidentified trends, and incorrect points of interest. The market has intentionality and systems to follow — this step applies those rules cleanly.

### The Problem Being Solved

The market has multiple directions simultaneously. The 4-hour may show a different trend to the 5-minute, which may differ from the 1-minute. Retracements can look like impulses. Complex pullbacks can look like trend continuations. When the trend is misread, points of interest will be wrong, and entries will be on the wrong side of the market.

### The Rule

**Use only the H1 timeframe. Identify the most recent impulse by locating where new territory was made.**

In a bearish market, new territory is a new lower low. In a bullish market, new territory is a new higher high.

### How to Execute

1. Open the H1 chart.
2. Dot only the major lower highs and lower lows. Ignore the small internal ones. Zoom out, take a breath, and identify only what jumps out immediately as obvious pivot points.
3. Identify the **previous lower high** and the **previous lower low** — this defines the previous external range.
4. Identify where **break of structure** occurred. A break of structure is confirmed when the previous lower low is broken. That break defines the new lower low.
5. Identify the **new lower high** — the lower high that is lower than the previous one and respects it by not breaking above it. This new lower high made the new lower low.
6. Draw a **red arrow** to mark the new H1 impulse direction.
7. Draw a **dotted line at the top** of the impulse range — this is the **external range high**.
8. Draw a **dotted line at the bottom** of the impulse range — this is the **external range low**.

The previous external low that was broken in the process becomes the confirmed break of structure point.

**This step takes approximately 30 seconds.**

### Annotation Summary

- **Red arrow** → direction of the impulse (bearish = pointing down)
- **Upper dotted line** → external range high (the new lower high)
- **Lower dotted line** → external range low (the new lower low)

### What to Expect Next

In a bearish market, the expectation is that the market will respect the external range high and go on to break the external range low — just as it did previously. The pattern is: lower high → lower low → lower high → lower low. The system is now looking for a sell setup from the premium zone above 50% of this range.

---

## Step 2 — C: Calculate Premium and Discount

### Purpose

This step defines where in the impulse range valid trade setups exist. It eliminates the error of selling into every supply zone, every break of structure, or every smart money concept visible on the chart. The rule is simple: **a good trader sells in premium and buys in discount.**

### The Rule

- **Above the 50% of the impulse range** → Premium zone → **SELL** setups only (bearish market)
- **Below the 50% of the impulse range** → Discount zone → **BUY** setups only (bullish market)

No trade entries are considered outside of the applicable zone.

### How to Execute

1. Take the Fibonacci tool.
2. Anchor it at the **external range high** (the upper dotted line from Step 1).
3. Drag it to the **external range low** (the lower dotted line from Step 1).
4. Identify the **0.5 level (50%)** — this is the dividing line between premium and discount.
5. Draw a **red box above the 50%** — this is the premium zone (sell area in a bearish market).
6. Draw a **blue box below the 50%** — this is the discount zone (buy area in a bullish market).

In a bearish context, only sell entries above the 50% in the red premium zone will be considered going forward.

**This step takes approximately 30 seconds.**

### Important Note

This filter does not mean everywhere inside the premium box is a valid sell. It means the search for valid points of interest is now restricted to this area only. The next step (A) identifies exactly which zones within this area are valid.

---

## Step 3 — A: Assess the Points of Interest

### Purpose

This step identifies and qualifies the two specific points of interest (POIs) within the premium or discount zone. It eliminates false zones, trap zones, and suboptimal areas by requiring that each POI is validated through a defined liquidity cycle visible on the M5 timeframe.

### The Two POIs to Find

Only **two POIs** are used in this system. Both must be located within the premium zone defined in Step 2.

**POI 1 — The Extreme (Origination Point)**
This is the highest probability reversal point. It is found at the origination of the impulse — the point where the lower high that made the lower low began. It sits at or near the external range high.

**POI 2 — The Decisional (Impactful Zone)**
This is the zone responsible for the break of structure. It is the zone from which the sellers that actually broke the previous lower low originated. It is the most recent impactful supply area before the external break of structure occurred.

### How to Execute — H1 Placement

1. On the H1 chart, locate the **extreme POI**: the origination point of the lower high. Draw a red supply zone box approximately 30 pips wide. This is a zone, not a precise entry point — pip-perfect accuracy is not required at this stage.
2. Locate the **decisional POI**: the zone from which the break of structure drop originated. Identify the distribution area or the drop that broke the previous lower low. Draw a red supply zone box approximately 30 pips wide over this area.

**This H1 placement step takes approximately 30 seconds.**

### How to Execute — M5 Refinement and Qualification

Both POIs must then be confirmed on the M5 timeframe. The purpose of the M5 is to verify that a **liquidity cycle** exists inside the zone — confirming it is a real, intentional zone and not a trap.

**Step-by-step M5 procedure:**

1. Switch to the M5 chart.
2. Inside the H1 impulse range, identify the internal structure. The retracement that formed the lower high will contain internal bullish legs (higher lows and higher highs). The push that formed the lower low will contain internal bearish legs (lower highs and lower lows).
3. Mark the **blue dots** for internal bullish complex pullback structure points (retracement legs).
4. Mark the **red dots** for internal bearish impulse structure points (the push legs).

**Annotation key for M5:**
- **Blue dots** → internal bullish complex pullback structure
- **Red dots** → internal bearish impulse structure

### Confirming Each POI on M5

For each POI, look for the following three-step sequence inside the zone:

1. **Buildup** — a consolidation or accumulation forming inside or approaching the zone
2. **Inducement** — a sweep of liquidity (e.g., a sweep of equal highs, a trend line sweep, a break of internal structure that traps traders)
3. **Push** — a directional move that breaks internal structure, confirming the zone has real institutional intent

**If all three are present, the POI is confirmed and valid.**

If the zone has no buildup-inducement-push sequence and shows only continuous directional movement (higher highs, higher lows, lower highs, lower lows with no trap), it is not a valid zone.

### Example of Extreme POI Validation on M5

The extreme zone (origination point) is refined to approximately a 25 pip order block. On the M5, look for the zone to contain a buildup followed by a liquidity sweep (inducement) and a push out. This confirms the zone holds a real liquidity cycle and should be prioritized.

### Example of Decisional POI Validation on M5

The decisional zone may contain more complex structure. An advanced scenario includes equal highs forming inside the zone — one touch, two touches, three touches. This is a liquidity pool. Smart money will sweep those equal highs. After the sweep, watch for an order block, a fair value gap, and a break of structure. This sequence — equal highs → sweep → break of structure → fair value gap — is a confirmed real inducement.

In some cases, the push out of the decisional zone may first create a new internal lower low without yet creating an external break of structure. This is followed by a pullback that mitigates the inducement block, and then the final external break of structure. Both the immediate decisional zone and the full liquidity cycle around it are included as the focus area because the inducement must also be visible.

### Final Output of Step 3

Two red boxes on the chart: the refined extreme zone and the refined decisional zone. The focus within each zone is on the specific inducement area and its associated imbalances — not the entire 25–30 pip zone. Only the relevant inducement zone and the relevant inducement-and-mitigation zone are the precision focus areas.

---

## Step 4 — L: Liquidity

### Purpose

This step confirms that sufficient liquidity has been taken before a trade is considered. Entering before liquidity is swept increases the risk that the market will use the position as the liquidity it needs, triggering the stop loss before reversing. This step also applies a time-based filter to ensure the liquidity sweep occurs at the right time of day.

### The Time-Based Filter

Liquidity grabs are only relevant when they occur within the two key time windows:

1. **London Open** (primary key time window)
2. **New York Key Time Window** — the second hour of New York open (secondary key time window)

**The valid entry window is:**
- From **8:30 AM** (30 minutes before London open at 9:00 AM) to **10:00 AM** (end of the London open session hour)
- Any inducement that occurs within this 8:30–10:00 AM window qualifies for trade consideration

The Frankfurt open (which precedes London open) is specifically noted as a common trap zone. Price moves at Frankfurt open that resemble valid setups are typically smart money traps designed to induce early entries before the real move at London open.

### Key Liquidity Points to Monitor

Mark and track the following liquidity levels on the chart. These are the targets the market is likely to sweep before reversing from the POI:

- **High of previous day** or **high of previous week** (primary)
- **Smart money traps** (equal highs, trend line touches)
- **Major trend lines** (significant, multi-touch levels)
- **Major support and resistance** (structural liquidity)
- **Asia high** (additional confirmation — cherry on top)

### The Asia Range

Mark the Asia session range as a blue box on the chart, identifying:

- **Asia high**
- **Asia low**
- **Asia open**
- **Asia close**

The Asia high is a key liquidity target. When the market sweeps the Asia high, the high of previous day, and a structural resistance level — all within the key time window — while simultaneously reaching the identified POI, the setup has strong alignment.

### How to Read Liquidity Alignment

When inside the key time window and inside the identified POI:

- Confirm that the market has swept **at least one primary liquidity level** (high of previous day, high of previous week, or major resistance)
- The Asia high adds confirmation when also swept
- Multiple liquidity levels swept simultaneously (e.g., Asia high + high of previous day + structural high) significantly increases the quality of the setup

Once liquidity has been taken and the price has reached the POI within the time window, move to Step 5 to confirm the entry.

### What to Watch For (Market is Not Ready)

After taking liquidity, the market may continue higher before reversing. It may build more liquidity, distribute slowly, or sweep additional levels. The position step (P) confirms when the market is ready to enter — not the liquidity step alone. The liquidity step confirms context; the position step confirms execution timing.

---

## Step 5 — P: Position (Entry Confirmation)

### Purpose

This step converts the trade idea into a trade execution. Entry is only taken when all three components of the confirmation trinity are present simultaneously. Entering without these confirmations results in emotional, random, or trap-based entries.

### The Holy Trinity — Non-Negotiable Entry Requirements

All three must be present before entry:

1. **Time** — The liquidity sweep must occur within the key time window (8:30–10:00 AM London)
2. **Inducement** — A liquidity sweep or trap must occur at or within the POI on the lower timeframe
3. **Lower Timeframe Confirmation** — A structural shift on the M1 must confirm the reversal

When a point of interest aligns with the trend direction, this constitutes a high quality A+ setup.

### Entry Types on M1

Three valid entry types are accepted:

1. **Break of Structure (BOS) on M1** — A clear lower low formed on M1 inside the POI after price enters the supply zone, confirming a structural shift to bearish
2. **Two-Leg Protocol** — Price enters the POI, creates one leg up (inducement leg), fails to make a new higher high, then breaks the previous internal low to make a lower low. This becomes the sell zone.
3. **Buildup-Inducement-Break of Structure** — A consolidation forms inside the POI on M1, followed by a sweep of internal liquidity and a break of structure confirming the reversal

### Stop Loss Placement

- Stop loss is always placed **above the local high** of the entry structure
- Target range: **3 to 7 pips** (the refined IFC or order block to the local high is typically within this range)
- A 4.7 pip stop loss is common; rounding up to 5 pips for conservative sizing is acceptable

### Take Profit

- **Fixed take profit: 1 to 3 risk-reward** for this system
- At 1% risk per trade and 1 to 3 risk-reward, one winning trade produces a 3% gain — the full monthly target achieved in a single trade
- As the trader advances, the 1 to 3 can be extended toward 1 to 10 and beyond by holding with a break-even stop — but the default rule for this system is 1 to 3

### Break Even Rule

Move the stop loss to break even upon confirmation of a break of structure on M1 in the direction of the trade.

### Trade Duration

The trade entry to 1 to 3 risk-reward target is expected to resolve within **13 minutes** on average within the key time window. Because the average first-hour movement is 25 to 30 pips and only 15 pips are needed (5 pip stop × 3 = 15 pip target), the probability of hitting the target within the session hour is structurally high. Price will tap into the zone and move — either hitting take profit, reaching break even, or hitting the stop loss quickly. Extended waiting, emotional management, or trade adjustment is not part of this system.

---

## The Two-Leg Protocol — Detailed Mechanics

The two-leg protocol is the most precise entry type in the system. It is broken down as follows:

1. **Price enters the supply zone** (reaching the refined POI within the key time window)
2. **Leg 1 (Inducement leg):** Price moves up inside the zone, creating a new high. This traps buyers (who see internal break of structure to the upside) and traps trend-line sellers (who expect the trend line to hold). Both groups are getting induced.
3. **Retracement:** Price pulls back after the inducement leg, failing to make a new higher high. It respects the previous high.
4. **Leg 2 (Confirmation leg):** Price breaks below the previous internal low, forming a new lower low on M1. This is the confirmation.
5. **Entry:** The sell entry is placed at this point. The local high of the inducement leg is the stop loss.

This sequence — inducement up, failure to break previous high, break of previous low — is the complete two-leg protocol. It consistently produces the 3 to 7 pip stop loss that is characteristic of this system because the entry is taken at the precise moment of structure confirmation, not at a wide arbitrary level.

---

## Identifying and Avoiding Traps

### Frankfurt Open Trap

Frankfurt open is a known trap session. Price at Frankfurt open will frequently sweep the Asia high equal highs, form what appears to be an order block with a fair value gap, and display a break of structure — appearing to be a valid smart money entry. This is a trap. The Frankfurt open signal is the tell. Do not enter at Frankfurt open. Wait for London open.

The mechanics of this trap: smart money traders see perfect equal highs, wait for the sweep, observe the order block and fair value gap, and enter. That entry becomes the liquidity. The market quickly reverses against them. Frankfurt open generates the false sweep that feeds the real London open move.

### Internal Structure Traps

When price returns to a supply zone and shows a higher low making a higher high on M1, traders expecting bullish continuation will buy. Simultaneously, sellers watching a two-touch trend line will sell. Both groups are trapped. The correct response is to wait for the inducement to complete — for both the buyers and sellers to be trapped — and then watch for the two-leg protocol to confirm the actual directional move. Do not react to the internal higher low / higher high structure as a bullish signal when price is inside a confirmed supply zone that has already taken premium liquidity in the key time window.

---

## Trade Psychology and Feedback Loop

The system eliminates emotional trading because of the nature of the tap-and-go execution. Price will not remain inside a 5-pip stop loss zone for an extended period. It will tap the entry zone and move immediately — either hitting take profit, break even, or the stop loss. This rapid resolution removes the conditions that cause emotional interference: extended holding, watching candles, second-guessing, re-entering, cutting trades early, or adding to losing positions.

The feedback loop is fast. A losing trade is identified and resolved within minutes. A winning trade reaches its target within minutes. This makes the system highly efficient for building pattern recognition and psychological discipline through rapid, clear-cut repetitions.

Emotional trades are eliminated by following the checklist. Before every trade, all five steps of the SCALP checklist must be ticked off. If any box cannot be ticked, the trade is not taken. There are no discretionary exceptions, no FOMO-based entries, no revenge entries, and no fear-based exits. The checklist removes the decision — the system makes the decision.

---

## System Summary — Complete Trade Logic Flow

The following is the complete sequential logic of one trade from start to finish:

1. **H1 — Spot the Impulse:** Identify the bearish market via the most recent lower high → lower low. Draw external range high and low with dotted lines. Mark the red arrow for direction. *(~30 seconds)*

2. **H1 — Calculate Premium and Discount:** Apply Fibonacci from external high to external low. Identify the 50% level. Mark the premium zone (red box above 50%) as the sell-only area. *(~30 seconds)*

3. **H1 + M5 — Assess Points of Interest:** Identify the extreme POI (origination zone) and the decisional POI (break of structure zone) within the premium box. Draw rough 30-pip red boxes on H1. Switch to M5. Mark internal blue and red structure dots. Confirm each POI has the buildup-inducement-push sequence. Refine each zone to the 25-pip order block or IFC around the confirmed inducement. *(~2 minutes)*

4. **M5/H1 — Liquidity:** Mark Asia high, high of previous day, high of previous week, major trend lines, and key resistance levels. Confirm the market has swept at least one primary liquidity level. Confirm the sweep is occurring within the 8:30–10:00 AM London open window. Note the Frankfurt open area as a trap zone and do not enter there.

5. **M1 — Position:** Enter the key time window (London open). Wait for the inducement within the confirmed POI. Apply the two-leg protocol or BOS confirmation on M1. Place the sell entry. Set stop loss 3–7 pips above the local high. Set take profit at 1 to 3 risk-reward. Move stop to break even upon M1 BOS confirmation. Exit at 1 to 3.

---

## System Principles

- **One timeframe for direction.** H1 only. No top-down multi-timeframe analysis.
- **Two POIs maximum.** Extreme and decisional only. All other zones are ignored.
- **Two currency pairs only.** EURUSD and GBPUSD. No others.
- **One to four trades per week.** Not more. Quality over frequency.
- **Sell in premium. Buy in discount.** Never trade outside the 50% filter zone.
- **Time is a filter.** No trade outside the 8:30–10:00 AM London or New York key time window.
- **Liquidity must be taken.** Do not enter before liquidity has been swept.
- **The holy trinity is non-negotiable.** Time + inducement + lower timeframe confirmation. All three required.
- **Stop loss is 3 to 7 pips.** Wider stops are not part of this system.
- **Take profit is 1 to 3.** Default rule. No exceptions until advanced.
- **Check the checklist.** Every trade requires all five SCALP steps to be confirmed before execution.
- **Boring trading works.** Conservative, consistent, repeatable. That is the system.
