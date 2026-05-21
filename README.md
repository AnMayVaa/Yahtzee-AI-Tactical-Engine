# Yahtzee AI Tactical Engine 🎲

A mathematically rigorous Yahtzee assistant and scorecard tracker that uses **Dynamic Programming** and **Expected Value (EV)** calculations to determine the absolute mathematically perfect move for any given dice roll.

## Overview

Unlike standard Yahtzee apps that just let you play, this engine acts as your personal AI tactician. It analyzes all 252 possible dice combinations and calculates the exact probabilities and expected point values of every possible reroll and scoring choice.

It will tell you exactly which dice to keep, which dice to reroll, and where to place your score to maximize your chances of crushing your opponent over the long run.

## Features

*   **Dynamic Programming Algorithm:** Calculates the Expected Value (EV) of rerolling any combination of dice, looking multiple rolls ahead.
*   **Bonus Equity Math:** The AI tracks your progress towards the 63-point Upper Section bonus. It mathematically weighs the risk of losing the 35-point bonus against the reward of high-scoring Lower Section categories, preventing you from throwing away the bonus needlessly.
*   **Tie-Breaker Rarity Sorting:** If taking a `0` (scratching) in two categories costs the same amount of points, the AI automatically prioritizes scratching the mathematically rarer category (e.g., it will tell you to scratch `4 of a Kind` before `Chance`).
*   **Live Probability Tracker:** See the exact % chance of hitting complex categories like Large Straights or Yahtzees on your next roll.
*   **Interactive Scorecard:** Keeps track of both your score and your opponent's score, providing a live "Match Projection" (e.g., "Aggressive", "Defensive") based on expected future points.
*   **Lightning Fast & Reactive:** Calculates the math instantly. Change a die or update the scorecard and the AI instantly recalculates your optimal path. 
*   **Keyboard Shortcuts:** Hover over any die and press `1-6` on your keyboard to instantly change its value. Click on any AI recommendation to auto-fill it into your scorecard.

## How It Works Under The Hood

The AI operates on a robust mathematical foundation:
1.  **State Space:** The engine generates all 252 possible sorted combinations of 5 dice.
2.  **Outcomes Calculation:** For any given roll, there are 32 possible ways to hold/reroll the dice. For each subset, it calculates the distribution of outcomes.
3.  **Expected Value (EV):** It evaluates the Expected Value of each reroll option by looking at the current state of your scorecard. It simulates the remaining rolls (if you have 2 rolls left, it computes the EV recursively).
4.  **Bonus Equity:** It converts your likelihood of hitting the 63-point upper threshold into a probability, and assigns a point value to it. This prevents short-sighted tactical errors.

## How to Run

1. Clone the repository.
2. Open `index.html` in any modern web browser.
3. No server or build step required! Everything runs locally in vanilla HTML, CSS, and JavaScript.

## Author
Developed by [AnMayVaa](https://github.com/AnMayVaa)
