# AI Developer Instructions for Yahtzee AI Tactical Engine

Welcome, fellow AI! If you are reading this, you have been tasked with modifying, maintaining, or expanding the **Yahtzee AI Tactical Engine**. 

This document summarizes the core architecture, the mathematical algorithms, and the critical rules of the codebase. Please read this entirely before making any structural changes to the logic.

## 1. Project Overview
This project is a vanilla HTML/CSS/JS application that acts as a mathematically perfect Yahtzee assistant. It doesn't just play the game; it tells the user the absolute best move to make based on **Dynamic Programming** and **Expected Value (EV)**.

### Core Files
*   `index.html`: The structure of the app, consisting of a Scorecard (Me vs Opponent), a Dice Interaction zone, and a Recommendations panel.
*   `styles.css`: Uses CSS Variables for theming. Contains a fully responsive flex/grid layout and styling for a sleek, modern UI, including a game-over modal.
*   `script.js`: The brain of the operation. Contains all mathematical generation, EV simulations, and reactive UI event listeners.

## 2. Core Mathematical Architecture

### State Space Generation
There are exactly **252** unique sorted combinations of 5 six-sided dice. The engine generates this state space exactly once at runtime (`allHands` array) and maps them to an index (`handToIndex`). 
*   **Do not change this.** Exhaustive generation is what allows the app to run instantly without server-side compute.

### The Expected Value (EV) Algorithm
When a user requests a calculation, the AI simulates all possible futures:
1.  **0 Rolls Left:** It evaluates the raw points for all 252 hands against the user's open scorecard categories.
2.  **1 Roll Left:** It evaluates all 32 possible hold/reroll subsets for the current dice, mapping the outcomes (e.g., rerolling 2 dice generates 36 possible outcomes) to the known values of the 0-Roll state.
3.  **2 Rolls Left:** It recursively repeats the process, evaluating subsets against the known EV of the 1-Roll state.

## 3. Advanced Tactical Mechanics (DO NOT REMOVE)

Over the course of development, several advanced heuristic layers were added on top of the raw EV calculation. **These are critical to the AI's success.**

### Bonus Equity Math (`getBonusEquity`)
*   **The Problem:** Raw EV will tell a user to take a `0` in `Sixes` (costing 30 points) instead of taking a `0` in `4 of a Kind` (costing 30 points) if the odds are slightly better. However, scratching `Sixes` destroys the user's chance at the +35 Upper Section Bonus.
*   **The Solution:** The `getBonusEquity` function artificially inflates the value of Upper Section points by calculating the mathematical probability of hitting the 63-point threshold. It severely punishes moves that ruin the bonus track.

### Tie-Breaker Rarity Sorting (`renderImmediateList`)
*   If two categories have the exact same "Cost" (e.g., both result in a loss of -30 EV), the AI will sort them by **Rarity**.
*   It uses `CAT_AVG_SCORES` to determine which category is harder to hit over the course of a normal game, and recommends scratching the hardest category first.

### Official Yahtzee Joker Rules (`isJokerValid`)
*   The engine fully supports the official Yahtzee Joker rules.
*   If a player rolls a second Yahtzee, they receive +100 points (`getYahtzeeBonus`). 
*   They **must** score it in the corresponding Upper Section box if it is open. If closed, they can use it as a "Joker" for maximum points in the Lower Section (e.g., 40 points in Large Straight).

## 4. UI Architecture & Reactivity

*   **No Calculate Button:** The UI is entirely reactive. Any interaction (clicking a die, typing a keyboard shortcut, typing a score, changing the rolls-left radio) instantly triggers `runCalculation()`.
*   **Match Projection:** The scorecard calculates expected future points based on open categories (`CAT_AVG_SCORES`). It warns the user if they are projected to lose heavily ("Restart Suggested") or if they are leading ("Defensive").
*   **Keyboard Support:** Users can hover over dice and type `1-6` to instantly swap their values. 

## 5. Summary for Future AI Agents
If you are asked to add new features or fix bugs:
1.  **Keep it Vanilla:** Do not introduce heavy frameworks (React, Vue) or build steps (Webpack, Vite) unless explicitly requested by the user.
2.  **Protect the Math:** If you modify `CATEGORIES` logic, ensure you also update `CAT_MAX_SCORES` and `CAT_AVG_SCORES` or the tie-breaking and projection math will break.
3.  **Think in EV:** Any new tactical suggestions must be grounded in Expected Value, not just immediate point gains.
