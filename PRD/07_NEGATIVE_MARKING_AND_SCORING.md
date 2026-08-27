# Scoring Rules — Critical

## Marking
- +1 correct
- -0.25 wrong
- 0 unanswered

## Implementation Requirements
1. Store selectedOption as a/b/c/d/null
2. On submit:
   - correctCount
   - wrongCount
   - unansweredCount
3. finalScore = correctCount - (wrongCount * 0.25)
4. Round only for display to 2 decimals if needed
5. Section score also uses same negative marking
6. Results must display net score, not just raw correct count
7. Qualifying comparison uses net score against 150

## UI
- Results hero must show NET SCORE
- Example: 162 correct, 28 wrong, 10 blank
  - Net = 162 - (28*0.25) = 155