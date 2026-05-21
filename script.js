const CATEGORIES = {
    ones: (dice, sc) => {
        let s = sumIf(dice, 1);
        return s + getYahtzeeBonus(dice, sc) + getUpperBonusProgressValue(sc, s);
    },
    twos: (dice, sc) => {
        let s = sumIf(dice, 2);
        return s + getYahtzeeBonus(dice, sc) + getUpperBonusProgressValue(sc, s);
    },
    threes: (dice, sc) => {
        let s = sumIf(dice, 3);
        return s + getYahtzeeBonus(dice, sc) + getUpperBonusProgressValue(sc, s);
    },
    fours: (dice, sc) => {
        let s = sumIf(dice, 4);
        return s + getYahtzeeBonus(dice, sc) + getUpperBonusProgressValue(sc, s);
    },
    fives: (dice, sc) => {
        let s = sumIf(dice, 5);
        return s + getYahtzeeBonus(dice, sc) + getUpperBonusProgressValue(sc, s);
    },
    sixes: (dice, sc) => {
        let s = sumIf(dice, 6);
        return s + getYahtzeeBonus(dice, sc) + getUpperBonusProgressValue(sc, s);
    },
    threeOfAKind: (dice, sc) => {
        let s = hasNOfAKind(dice, 3) ? sumAll(dice) : 0;
        return s + getYahtzeeBonus(dice, sc);
    },
    fourOfAKind: (dice, sc) => {
        let s = hasNOfAKind(dice, 4) ? sumAll(dice) : 0;
        return s + getYahtzeeBonus(dice, sc);
    },
    fullHouse: (dice, sc) => {
        let s = 0;
        if (isFullHouse(dice) || isJokerValid(dice, sc)) s = 25;
        return s > 0 ? s + getYahtzeeBonus(dice, sc) : 0;
    },
    smallStraight: (dice, sc) => {
        let s = 0;
        if (isSmallStraight(dice) || isJokerValid(dice, sc)) s = 30;
        return s > 0 ? s + getYahtzeeBonus(dice, sc) : 0;
    },
    largeStraight: (dice, sc) => {
        let s = 0;
        if (isLargeStraight(dice) || isJokerValid(dice, sc)) s = 40;
        return s > 0 ? s + getYahtzeeBonus(dice, sc) : 0;
    },
    yahtzee: (dice, sc) => {
        // Can only be scored here if Yahtzee box is currently empty
        return hasNOfAKind(dice, 5) ? 50 : 0;
    },
    chance: (dice, sc) => {
        return sumAll(dice) + getYahtzeeBonus(dice, sc);
    }
};

const PROB_CATS = ['yahtzee', 'largeStraight', 'smallStraight', 'fullHouse', 'fourOfAKind'];

const CAT_MAX_SCORES = {
    ones: 5, twos: 10, threes: 15, fours: 20, fives: 25, sixes: 30,
    threeOfAKind: 30, fourOfAKind: 30, fullHouse: 25,
    smallStraight: 30, largeStraight: 40, yahtzee: 50, chance: 30
};

// Rough average scores a player gets from a category over a game
const CAT_AVG_SCORES = {
    ones: 2.5, twos: 5, threes: 7.5, fours: 10, fives: 12.5, sixes: 15,
    threeOfAKind: 18, fourOfAKind: 13, fullHouse: 17.5,
    smallStraight: 24, largeStraight: 20, yahtzee: 5, chance: 22
};

// Helper functions for scoring
function sumIf(dice, val) { return dice.filter(d => d === val).length * val; }
function sumAll(dice) { return dice.reduce((a, b) => a + b, 0); }
function getCounts(dice) {
    const counts = {};
    for (let d of dice) counts[d] = (counts[d] || 0) + 1;
    return Object.values(counts);
}
function hasNOfAKind(dice, n) { return Math.max(...getCounts(dice)) >= n; }
function isFullHouse(dice) {
    const counts = getCounts(dice);
    return counts.includes(3) && counts.includes(2);
}
function isSmallStraight(dice) {
    const unique = [...new Set(dice)].sort();
    const str = unique.join('');
    return str.includes('1234') || str.includes('2345') || str.includes('3456');
}
function isLargeStraight(dice) {
    const unique = [...new Set(dice)].sort();
    const str = unique.join('');
    return str.includes('12345') || str.includes('23456');
}

// Joker & Bonus Logic
function isJokerValid(dice, sc) {
    if (!hasNOfAKind(dice, 5)) return false;
    if (sc.yahtzee !== 50 && sc.yahtzee !== 0) return false;
    
    const dieVal = dice[0];
    const upperCats = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    const upperCat = upperCats[dieVal - 1];
    
    // Forced Upper Section rule: if corresponding upper box is empty, you CANNOT use Joker in lower section
    if (sc[upperCat] === null) return false;
    return true;
}

function getYahtzeeBonus(dice, sc) {
    if (hasNOfAKind(dice, 5) && sc.yahtzee === 50) return 100;
    return 0;
}

function getUpperBonusProgressValue(sc, addedScore) {
    if (sc.upperTotal >= 63) return 0; // Already have bonus
    if (sc.upperTotal + addedScore >= 63) return 35; // Immediate +35 reward
    
    // Tactical heuristic: Value points that contribute to the 63-point goal higher
    return addedScore * 0.5;
}

// Generate all 252 possible sorted combinations of 5 dice
const allHands = [];
const handToIndex = {};
function generateAllHands() {
    for(let a=1; a<=6; a++) {
        for(let b=a; b<=6; b++) {
            for(let c=b; c<=6; c++) {
                for(let d=c; d<=6; d++) {
                    for(let e=d; e<=6; e++) {
                        const hand = [a,b,c,d,e];
                        handToIndex[hand.join('')] = allHands.length;
                        allHands.push(hand);
                    }
                }
            }
        }
    }
}
generateAllHands();

function getHandIndex(dice) {
    const sorted = [...dice].sort((a,b)=>a-b);
    return handToIndex[sorted.join('')];
}

// Generate all 32 subsets of a 5-element array
function getSubsets(arr) {
    const subsets = [];
    for (let i = 0; i < 32; i++) {
        const kept = [];
        const rerolledCount = 5;
        let c = 0;
        for (let j = 0; j < 5; j++) {
            if ((i & (1 << j))) {
                kept.push(arr[j]);
                c++;
            }
        }
        subsets.push({ kept, rerollCount: 5 - c, mask: i });
    }
    return subsets;
}

// Memoized outcomes for rerolling N dice
const rerollOutcomesCache = {};
function getRerollOutcomes(n) {
    if (rerollOutcomesCache[n]) return rerollOutcomesCache[n];
    if (n === 0) return [[]];
    const outcomes = [];
    const subOutcomes = getRerollOutcomes(n - 1);
    for (let i = 1; i <= 6; i++) {
        for (let sub of subOutcomes) {
            outcomes.push([i, ...sub]);
        }
    }
    rerollOutcomesCache[n] = outcomes;
    return outcomes;
}

// Main logic
document.addEventListener('DOMContentLoaded', () => {
    const diceElements = document.querySelectorAll('.die');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('results-container');
    const keepDiceDisplay = document.getElementById('keep-dice-display');
    const expectedScoreVal = document.getElementById('expected-score-val');
    const probList = document.getElementById('prob-list');
    
    const sortSelect = document.getElementById('sort-probs');
    const sortImmediate = document.getElementById('sort-immediate');
    let lastProbs = {};
    let lastImmediateScores = [];
    
    const meInputs = document.querySelectorAll('.me-input');
    const oppInputs = document.querySelectorAll('.opp-input');
    const clearBoardBtn = document.getElementById('clear-board-btn');

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (Object.keys(lastProbs).length > 0) renderProbabilities(lastProbs);
        });
    }

    if (sortImmediate) {
        sortImmediate.addEventListener('change', () => {
            if (lastImmediateScores.length > 0) renderImmediateList();
        });
    }

    // Scorecard Update Logic
    let gameOverShown = false;

    function updateScorecard() {
        let meUpper = 0, meTotal = 0;
        let oppUpper = 0, oppTotal = 0;
        const upperCats = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];

        document.querySelectorAll('#scorecard-table tbody tr').forEach(row => {
            const cat = row.dataset.cat;
            if (!cat) return;
            
            const meVal = row.querySelector('.me-input').value;
            const oppVal = row.querySelector('.opp-input').value;

            if (meVal !== '') {
                const val = parseInt(meVal) || 0;
                meTotal += val;
                if (upperCats.includes(cat)) meUpper += val;
            }
            
            if (oppVal !== '') {
                const val = parseInt(oppVal) || 0;
                oppTotal += val;
                if (upperCats.includes(cat)) oppUpper += val;
            }
        });

        const meBonus = meUpper >= 63 ? 35 : 0;
        const oppBonus = oppUpper >= 63 ? 35 : 0;

        document.getElementById('me-bonus').innerHTML = `${meBonus} <div style="font-size:0.75rem;font-weight:normal;color:var(--text-secondary);">${meUpper}/63</div>`;
        document.getElementById('opp-bonus').innerHTML = `${oppBonus} <div style="font-size:0.75rem;font-weight:normal;color:var(--text-secondary);">${oppUpper}/63</div>`;
        
        const finalMeTotal = meTotal + meBonus;
        const finalOppTotal = oppTotal + oppBonus;

        document.getElementById('me-total').textContent = finalMeTotal;
        document.getElementById('opp-total').textContent = finalOppTotal;

        updateGameStatus(finalMeTotal, finalOppTotal);

        const meOpen = getOpenCategories('.me-input');
        const oppOpen = getOpenCategories('.opp-input');
        
        if (meOpen.length === 0 && oppOpen.length === 0) {
            if (!gameOverShown) {
                showGameOver(finalMeTotal, finalOppTotal);
                gameOverShown = true;
            }
        } else {
            gameOverShown = false;
        }
    }

    meInputs.forEach(inp => inp.addEventListener('input', updateScorecard));
    oppInputs.forEach(inp => inp.addEventListener('input', updateScorecard));
    
    clearBoardBtn.addEventListener('click', () => {
        meInputs.forEach(inp => inp.value = '');
        oppInputs.forEach(inp => inp.value = '');
        updateScorecard();
    });

    function getOpenCategories(selector) {
        const open = [];
        document.querySelectorAll('#scorecard-table tbody tr').forEach(row => {
            const cat = row.dataset.cat;
            if (cat && cat !== 'yahtzeeBonus' && row.querySelector(selector).value === '') {
                open.push(cat);
            }
        });
        return open;
    }

    function getScorecardState() {
        const sc = { upperTotal: 0 };
        const upperCats = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
        
        document.querySelectorAll('#scorecard-table tbody tr').forEach(row => {
            const cat = row.dataset.cat;
            if (!cat) return;
            const valStr = row.querySelector('.me-input').value;
            sc[cat] = valStr === '' ? null : parseInt(valStr);
            if (upperCats.includes(cat) && sc[cat] !== null) {
                sc.upperTotal += sc[cat];
            }
        });
        return sc;
    }

    function updateGameStatus(myScore, oppScore) {
        const myOpen = getOpenCategories('.me-input');
        const oppOpen = getOpenCategories('.opp-input');
        
        const myExpectedFuture = myOpen.reduce((sum, cat) => sum + CAT_AVG_SCORES[cat], 0);
        const oppExpectedFuture = oppOpen.reduce((sum, cat) => sum + CAT_AVG_SCORES[cat], 0);

        const myProjected = myScore + myExpectedFuture;
        const oppProjected = oppScore + oppExpectedFuture;

        const badge = document.getElementById('risk-mode');
        const details = document.getElementById('projection-details');
        
        const diff = myProjected - oppProjected;
        
        if (myOpen.length === 13 && oppOpen.length === 13) {
            badge.className = 'risk-badge neutral';
            badge.textContent = 'Balanced';
            details.textContent = 'Game just started.';
            return;
        }

        if (diff > 15) {
            badge.className = 'risk-badge defensive';
            badge.textContent = 'Defensive';
            details.innerHTML = `You are projected to win by <b>${diff.toFixed(1)}</b> pts. Play it safe!`;
        } else if (diff < -50) {
            badge.className = 'risk-badge fatal';
            badge.textContent = 'Restart Suggested';
            details.innerHTML = `You are projected to lose by <b>${Math.abs(diff).toFixed(1)}</b> pts. It might be best to restart and not waste time.`;
        } else if (diff < -15) {
            badge.className = 'risk-badge aggressive';
            badge.textContent = 'Aggressive';
            details.innerHTML = `You are projected to lose by <b>${Math.abs(diff).toFixed(1)}</b> pts. Take risks!`;
        } else {
            badge.className = 'risk-badge neutral';
            badge.textContent = 'Balanced';
            let txt = diff >= 0 ? `Leading projection by ${diff.toFixed(1)} pts.` : `Trailing projection by ${Math.abs(diff).toFixed(1)} pts.`;
            details.textContent = txt;
        }
    }

    function showGameOver(myTotal, oppTotal) {
        const modal = document.getElementById('game-over-modal');
        const content = document.getElementById('modal-content');
        const title = document.getElementById('modal-title');
        const score = document.getElementById('modal-score');

        content.className = 'modal-content glass-panel'; // reset classes

        if (myTotal > oppTotal) {
            content.classList.add('win');
            title.textContent = 'Victory!';
        } else if (myTotal < oppTotal) {
            content.classList.add('lose');
            title.textContent = 'Defeat...';
        } else {
            content.classList.add('tie');
            title.textContent = 'It\'s a Tie!';
        }

        score.textContent = `${myTotal} - ${oppTotal}`;
        modal.classList.remove('hidden');
    }

    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
    });

    document.querySelectorAll('input[name="rolls"]').forEach(radio => {
        radio.addEventListener('change', () => {
            resultsContainer.classList.add('hidden');
        });
    });

    // Dice click and hover typing handler
    let hoveredDieIndex = -1;
    
    diceElements.forEach((die, index) => {
        die.addEventListener('mouseenter', () => hoveredDieIndex = index);
        die.addEventListener('mouseleave', () => { if (hoveredDieIndex === index) hoveredDieIndex = -1; });
        
        die.addEventListener('click', () => {
            let val = parseInt(die.dataset.value);
            val = val === 6 ? 1 : val + 1;
            die.dataset.value = val;
            die.textContent = val;
            resultsContainer.classList.add('hidden');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (hoveredDieIndex !== -1) {
            const val = parseInt(e.key);
            if (val >= 1 && val <= 6) {
                const die = diceElements[hoveredDieIndex];
                die.dataset.value = val;
                die.textContent = val;
                resultsContainer.classList.add('hidden');
            }
        }
    });

    calculateBtn.addEventListener('click', () => {
        calculateBtn.textContent = 'Calculating...';
        calculateBtn.disabled = true;
        setTimeout(() => {
            runCalculation();
            calculateBtn.textContent = 'Calculate Best Move';
            calculateBtn.disabled = false;
        }, 50);
    });

    function getBonusEquity(cat, score, meUpper, openCats) {
        const upperCats = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
        if (!upperCats.includes(cat)) return 0;

        let expectedOthers = 0;
        for (let openCat of openCats) {
            if (upperCats.includes(openCat) && openCat !== cat) {
                const val = upperCats.indexOf(openCat) + 1;
                expectedOthers += val * 3; // Par value
            }
        }

        const expectedTotal = meUpper + score + expectedOthers;
        const deficit = 63 - expectedTotal;
        const probability = 1 / (1 + Math.exp(deficit / 4));
        return probability * 35;
    }

    function runCalculation() {
        const currentDice = Array.from(diceElements).map(d => parseInt(d.dataset.value));
        const rollsRadio = document.querySelector('input[name="rolls"]:checked');
        if (!rollsRadio) return;
        const rollsLeft = parseInt(rollsRadio.value);
        
        const openCategories = getOpenCategories('.me-input');
        const sc = getScorecardState();

        if (openCategories.length === 0) {
            resultsContainer.classList.add('hidden');
            return;
        }

        let meUpper = 0;
        document.querySelectorAll('#scorecard-table tbody tr').forEach(row => {
            const rowCat = row.dataset.cat;
            const upperCats = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
            if (upperCats.includes(rowCat)) {
                const val = row.querySelector('.me-input').value;
                if (val !== '') meUpper += parseInt(val);
            }
        });

        renderImmediateScores(currentDice, openCategories, sc, meUpper);

        if (rollsLeft === 0) {
            document.querySelector('.recommendation-card').style.display = 'none';
            document.getElementById('prob-card').style.display = 'none';
            resultsContainer.classList.remove('hidden');
            return;
        } else {
            document.querySelector('.recommendation-card').style.display = 'block';
            document.getElementById('prob-card').style.display = 'block';
        }

        const V0 = new Float32Array(252);
        const Prob0 = Array(252).fill(0).map(() => ({}));
        
        for (let i = 0; i < 252; i++) {
            const hand = allHands[i];
            let maxScore = 0;
            for (let cat of openCategories) {
                const score = CATEGORIES[cat](hand, sc);
                if (score > maxScore) maxScore = score;
            }
            V0[i] = maxScore;
            
            for (let pc of PROB_CATS) {
                if (openCategories.includes(pc)) {
                    Prob0[i][pc] = CATEGORIES[pc](hand, sc) > 0 ? 1 : 0;
                }
            }
        }

        let V_current = V0;
        let Prob_current = Prob0;

        if (rollsLeft === 2) {
            const V1 = new Float32Array(252);
            const Prob1 = Array(252).fill(0).map(() => ({}));

            for (let i = 0; i < 252; i++) {
                const hand = allHands[i];
                const subsets = getSubsets(hand);
                let bestEV = -1;
                let bestProbs = {};

                for (let subset of subsets) {
                    const outcomes = getRerollOutcomes(subset.rerollCount);
                    let evSum = 0;
                    let probSums = {};
                    for (let pc of PROB_CATS) if (openCategories.includes(pc)) probSums[pc] = 0;

                    for (let out of outcomes) {
                        const finalHand = [...subset.kept, ...out];
                        const idx = getHandIndex(finalHand);
                        evSum += V0[idx];
                        for (let pc in probSums) probSums[pc] += Prob0[idx][pc];
                    }

                    const ev = evSum / outcomes.length;
                    if (ev > bestEV) {
                        bestEV = ev;
                        for (let pc in probSums) bestProbs[pc] = probSums[pc] / outcomes.length;
                    }
                }
                V1[i] = bestEV;
                Prob1[i] = bestProbs;
            }
            V_current = V1;
            Prob_current = Prob1;
        }

        const currentSubsets = getSubsets(currentDice);
        let absoluteBestEV = -1;
        let absoluteBestSubset = null;
        let absoluteBestProbs = {};

        for (let subset of currentSubsets) {
            const outcomes = getRerollOutcomes(subset.rerollCount);
            let evSum = 0;
            let probSums = {};
            for (let pc of PROB_CATS) if (openCategories.includes(pc)) probSums[pc] = 0;

            for (let out of outcomes) {
                const finalHand = [...subset.kept, ...out];
                const idx = getHandIndex(finalHand);
                evSum += V_current[idx];
                for (let pc in probSums) probSums[pc] += Prob_current[idx][pc];
            }

            const ev = evSum / outcomes.length;
            
            if (ev > absoluteBestEV || (ev === absoluteBestEV && absoluteBestSubset && subset.kept.length < absoluteBestSubset.kept.length)) {
                absoluteBestEV = ev;
                absoluteBestSubset = subset;
                for (let pc in probSums) absoluteBestProbs[pc] = probSums[pc] / outcomes.length;
            }
        }

        displayResults(absoluteBestSubset.kept, absoluteBestEV, absoluteBestProbs, currentDice, absoluteBestSubset.mask);
    }

    function displayResults(kept, ev, probs, currentDice, mask) {
        diceElements.forEach((die, idx) => {
            if ((mask & (1 << idx))) die.classList.add('kept');
            else die.classList.remove('kept');
        });

        keepDiceDisplay.innerHTML = '';
        if (kept.length === 0) {
            keepDiceDisplay.innerHTML = '<span style="color: var(--text-secondary); margin-top: 10px;">Reroll all dice</span>';
        } else {
            kept.forEach(val => {
                const d = document.createElement('div');
                d.className = 'small-die';
                d.textContent = val;
                keepDiceDisplay.appendChild(d);
            });
        }

        expectedScoreVal.textContent = ev.toFixed(2);
        lastProbs = probs;
        renderProbabilities(probs);
        resultsContainer.classList.remove('hidden');
    }

    function renderProbabilities(probs) {
        probList.innerHTML = '';
        const names = {
            yahtzee: 'Yahtzee', largeStraight: 'Large Straight', smallStraight: 'Small Straight',
            fullHouse: 'Full House', fourOfAKind: '4 of a Kind'
        };

        let probArray = [];
        for (let pc in probs) {
            probArray.push({ key: pc, chance: probs[pc], name: names[pc], score: CAT_MAX_SCORES[pc] });
        }

        if (sortSelect) {
            const sortBy = sortSelect.value;
            if (sortBy === 'chance') probArray.sort((a, b) => b.chance - a.chance);
            else if (sortBy === 'score') probArray.sort((a, b) => b.score - a.score);
        }

        if (probArray.length === 0) {
            probList.innerHTML = '<li class="prob-item"><span class="prob-name">No complex categories open</span></li>';
            return;
        }

        probArray.forEach(item => {
            const li = document.createElement('li');
            li.className = 'prob-item';
            const percent = (item.chance * 100).toFixed(1);
            li.innerHTML = `<span class="prob-name">${item.name}</span><span class="prob-value">${percent}%</span>`;
            probList.appendChild(li);
        });
    }

    function renderImmediateScores(currentDice, openCategories, sc, meUpper) {
        const names = {
            ones: 'Ones', twos: 'Twos', threes: 'Threes', fours: 'Fours', fives: 'Fives', sixes: 'Sixes',
            threeOfAKind: '3 of a Kind', fourOfAKind: '4 of a Kind', fullHouse: 'Full House',
            smallStraight: 'Small Straight', largeStraight: 'Large Straight', yahtzee: 'Yahtzee', chance: 'Chance'
        };

        let scoresArray = [];
        for (let cat of openCategories) {
            const score = CATEGORIES[cat](currentDice, sc);
            
            let displayScore = 0;
            if (['ones','twos','threes','fours','fives','sixes'].includes(cat)) {
                let s = 0;
                if (cat==='ones') s = sumIf(currentDice, 1);
                if (cat==='twos') s = sumIf(currentDice, 2);
                if (cat==='threes') s = sumIf(currentDice, 3);
                if (cat==='fours') s = sumIf(currentDice, 4);
                if (cat==='fives') s = sumIf(currentDice, 5);
                if (cat==='sixes') s = sumIf(currentDice, 6);
                displayScore = s + getYahtzeeBonus(currentDice, sc);
                if (sc.upperTotal < 63 && sc.upperTotal + s >= 63) {
                    displayScore += 35; // Show the true jump if it secured the bonus
                }
            } else {
                displayScore = score;
                const isJoker = isJokerValid(currentDice, sc);
                if (cat === 'fullHouse' && isJoker) displayScore = 25;
                if (cat === 'smallStraight' && isJoker) displayScore = 30;
                if (cat === 'largeStraight' && isJoker) displayScore = 40;
            }

            const actualBonusEquity = getBonusEquity(cat, displayScore, meUpper, openCategories);
            const perfectScore = CAT_MAX_SCORES[cat];
            const perfectBonusEquity = getBonusEquity(cat, perfectScore, meUpper, openCategories);
            
            let netValue = (displayScore + actualBonusEquity) - (perfectScore + perfectBonusEquity);
            netValue = Math.round(netValue * 10) / 10;

            scoresArray.push({ 
                cat: cat,
                name: names[cat], 
                score: displayScore, 
                netValue: netValue,
                avgScore: CAT_AVG_SCORES[cat] || 0
            });
        }
        
        lastImmediateScores = scoresArray;
        renderImmediateList();
    }

    function renderImmediateList() {
        const immediateList = document.getElementById('immediate-list');
        if (!immediateList) return;
        immediateList.innerHTML = '';

        let arr = [...lastImmediateScores];
        const sortBy = sortImmediate ? sortImmediate.value : 'tactic';

        if (sortBy === 'tactic') {
            arr.sort((a, b) => {
                if (b.netValue !== a.netValue) return b.netValue - a.netValue;
                return a.avgScore - b.avgScore; // Tie-breaker: prioritize rarer categories
            });
        } else {
            arr.sort((a, b) => b.score - a.score);
        }

        arr.forEach(item => {
            const li = document.createElement('li');
            li.className = 'prob-item clickable-score';
            
            let netDisplay = '';
            if (sortBy === 'tactic') {
                const text = item.netValue >= -0.1 ? 'Perfect!' : `Cost: ${item.netValue}`;
                const color = item.netValue >= -0.1 ? 'var(--success-color)' : (item.netValue < -15 ? 'var(--danger-color)' : 'var(--warning-color)');
                netDisplay = `<span style="font-size: 0.85rem; color: ${color}; margin-right: 8px;">${text}</span>`;
            }

            li.innerHTML = `<span class="prob-name">${item.name}</span>
                            <div>${netDisplay}<span class="prob-value" style="color: var(--success-color);">${item.score} pts</span></div>`;
            
            // Auto-fill logic
            li.addEventListener('click', () => {
                const row = document.querySelector(`#scorecard-table tbody tr[data-cat="${item.cat}"]`);
                if (row) {
                    const input = row.querySelector('.me-input');
                    input.value = item.score;
                    
                    // Reset turn state
                    document.querySelector('input[name="rolls"][value="2"]').checked = true;
                    diceElements.forEach((die, idx) => {
                        die.dataset.value = 1;
                        die.textContent = 1;
                        die.classList.remove('kept');
                    });
                    
                    document.getElementById('results-container').classList.add('hidden');
                    
                    // Trigger scorecard recalculation
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });

            immediateList.appendChild(li);
        });
    }
    
    // Initial call
    updateScorecard();
});
