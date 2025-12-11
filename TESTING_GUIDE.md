# Testing Guide - Automata Visualizer
## Group 4 - Furqan Azeem

---

## 🎯 Testing Objective

Verify that the automaton correctly implements the assigned regex `d(de*d+ef*e+fd*f)df` by testing all three patterns and edge cases.

---

## 📝 Test Plan

### Test Suite 1: Valid Strings (Should Accept ✅)

#### Test Case 1.1: Pattern A - Zero Middle
**Input:** `ddddf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(de*d)df` with zero e's in middle  
**Explanation:** Start with 'd', middle is 'dd' (zero e's), end with 'df'.

#### Test Case 1.2: Pattern A - One Middle
**Input:** `ddeddf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(de*d)df` with one 'e'  
**Explanation:** Start 'd', middle 'ded' (one e), end 'df'.

#### Test Case 1.3: Pattern A - Two Middle
**Input:** `ddeeddf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(de*d)df` with two e's  
**Explanation:** Start 'd', middle 'deed' (two e's), end 'df'.

#### Test Case 1.4: Pattern B - Zero Middle
**Input:** `deedf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(ef*e)df` with zero f's in middle  
**Explanation:** Start 'd', middle 'ee' (zero f's), end 'df'.

#### Test Case 1.5: Pattern B - One Middle
**Input:** `defedf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(ef*e)df` with one 'f'  
**Explanation:** Start 'd', middle 'efe' (one f), end 'df'.

#### Test Case 1.6: Pattern B - Two Middle
**Input:** `deffedf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(ef*e)df` with two f's  
**Explanation:** Start 'd', middle 'effe' (two f's), end 'df'.

#### Test Case 1.7: Pattern C - Zero Middle
**Input:** `dffdf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(fd*f)df` with zero d's in middle  
**Explanation:** Start 'd', middle 'ff' (zero d's), end 'df'.

#### Test Case 1.8: Pattern C - One Middle
**Input:** `dfdfdf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(fd*f)df` with one 'd'  
**Explanation:** Start 'd', middle 'fdf' (one d), end 'df'.

#### Test Case 1.9: Pattern C - Two Middle
**Input:** `dfddfdf`  
**Expected:** ACCEPT (Green)  
**Pattern:** `d(fd*f)df` with two d's  
**Explanation:** Start 'd', middle 'fddf' (two d's), end 'df'.

---

### Test Suite 2: Invalid Strings (Should Reject ❌)

#### Test Case 2.1: Missing Prefix
**Input:** `dedf`  
**Expected:** REJECT (Red)  
**Reason:** Missing the starting 'd'. Matches Option 1 + suffix, but forgot prefix.  
**DFA Behavior:** Machine starts at 'd', but input starts with 'd' and expects pattern inside. This missing the required prefix structure.

#### Test Case 2.2: Missing Suffix 'f'
**Input:** `dddd`  
**Expected:** REJECT (Red)  
**Reason:** Ends with 'd' instead of 'f'. Pattern A works but suffix should be 'df' not 'd'.  
**DFA Behavior:** After valid middle section, machine expects 'f' but finds only 'd'.

#### Test Case 2.3: Incomplete Middle
**Input:** `dddf`  
**Expected:** REJECT (Red)  
**Reason:** Middle is just 'd', not valid for any pattern. Pattern A needs `de*d` (at least 'dd').  
**DFA Behavior:** 'd' alone is not a valid middle section for any pattern.

#### Test Case 2.4: Broken Option 2
**Input:** `defdf`  
**Expected:** REJECT (Red)  
**Reason:** Starts Pattern B (`ef`) but missing closing 'e'. Should be 'ef*e'.  
**DFA Behavior:** After 'f', machine expects another 'e' to close the pattern.

#### Test Case 2.5: Broken Option 3
**Input:** `dfdf`  
**Expected:** REJECT (Red)  
**Reason:** Starts Pattern C (`f`) but missing closing 'f'. Should be 'fd*f'.  
**DFA Behavior:** After 'd', machine expects another 'f' to close the pattern.

#### Test Case 2.6: Suffix Mismatch
**Input:** `ddedef`  
**Expected:** REJECT (Red)  
**Reason:** Valid middle but ends in 'ef' instead of 'df'.  
**DFA Behavior:** Pattern expects suffix 'df' but finds 'ef'.

#### Test Case 2.7: Invalid Character in Pattern C
**Input:** `dfffdf`  
**Expected:** REJECT (Red)  
**Reason:** Pattern C only allows 'd' inside (`fd*f`). This has 'f' inside.  
**DFA Behavior:** 'fff' is not valid. Pattern C: 'f' followed by zero or more 'd's, then 'f'.

---

## 🧪 How to Execute Tests

### Method 1: Manual Testing (Recommended for Viva)

1. **Open Application:** Navigate to `http://localhost:5173/`
2. **Load Regex:** Click "Load Assigned Task" button
3. **Generate Automata:** Click "Generate Automata"
4. **Select Tab:** Choose "Minimized DFA" for most efficient visualization
5. **Enter Test String:** Type or click a test button from the quick test section
6. **Simulate:** Click "Play" and observe step-by-step execution
7. **Verify Result:** Check if result matches expected outcome (Accept/Reject)

### Method 2: Quick Test Buttons

The application provides built-in test buttons:

**Valid Tests (Green):** cc, acc, aacc, aaacc, ba, aa  
**Invalid Tests (Red):** c, a, aaa, b, bac, caa, aba

Simply click any button to auto-fill the test string and observe behavior.

---

## 🎓 Viva Demonstration Script

### Step 1: Show NFA Generation
"Sir, first I'll load our assigned regex and generate the NFA using Thompson's Construction."
- Click "Load Assigned Task"
- Click "Generate Automata"
- Show the NFA tab
- Explain: "Notice the epsilon transitions connecting the three union branches."

### Step 2: Show DFA Conversion
"Now I'll switch to the DFA, which was created using Subset Construction."
- Click "DFA" tab
- Explain: "The DFA has fewer states and no epsilon transitions. Each state represents a set of NFA states."

### Step 3: Show Minimization
"Finally, the minimized DFA removes redundant states using the Table-Filling Algorithm."
- Click "Minimized DFA" tab
- Explain: "This is the most efficient representation with the minimum number of states."

### Step 4: Test Valid String
"Let me test a valid string: 'aacc'"
- Type "aacc" or click the button
- Click "Play"
- **Narrate:** "At step 2, after reading 'aa', the machine is in a final state because 'aa' matches Pattern C. But when we read the third character 'c', it leaves that final state. Finally, at step 4, after reading 'cc', it reaches another final state matching Pattern A 'aacc'."
- **Point:** "This demonstrates that the DFA correctly handles overlapping patterns."

### Step 5: Test Invalid String
"Now let me test an invalid string: 'bac'"
- Type "bac" or click the button
- Click "Play"
- **Narrate:** "The machine accepts 'ba' (Pattern B), but when it reads 'c', there's no valid transition from the accept state. Therefore, it rejects."

### Step 6: Explain Critical Test
"The most important test is 'aacc', which shows Accept → Reject → Accept behavior."
- Repeat the "aacc" test
- **Highlight:** "Notice the yellow highlighting changing as we step through. After 'aa', it's green (accepted). After 'aac', it would be red if we stopped (rejected). After 'aacc', it's green again (accepted)."

---

## 📊 Expected Results Summary

| Test Case | Input | Expected Result | Pattern Matched |
|-----------|-------|-----------------|-----------------|
| 1.1 | ddddf | ✅ ACCEPT | A |
| 1.2 | ddeddf | ✅ ACCEPT | A |
| 1.3 | ddeeddf | ✅ ACCEPT | A |
| 1.4 | deedf | ✅ ACCEPT | B |
| 1.5 | defedf | ✅ ACCEPT | B |
| 1.6 | deffedf | ✅ ACCEPT | B |
| 1.7 | dffdf | ✅ ACCEPT | C |
| 1.8 | dfdfdf | ✅ ACCEPT | C |
| 1.9 | dfddfdf | ✅ ACCEPT | C |
| 2.1 | dedf | ❌ REJECT | None |
| 2.2 | dddd | ❌ REJECT | None |
| 2.3 | dddf | ❌ REJECT | None |
| 2.4 | defdf | ❌ REJECT | None |
| 2.5 | dfdf | ❌ REJECT | None |
| 2.6 | ddedef | ❌ REJECT | None |
| 2.7 | dfffdf | ❌ REJECT | None |

---

## 🔍 Debugging Checklist

If a test fails, verify:

1. ✅ **Regex Parser:** Check that postfix conversion is correct
   - Expected: `aa+aaa+aa+*.c.c+b.a+a.a+`
   
2. ✅ **NFA States:** Verify NFA has appropriate ε-transitions for union and star

3. ✅ **DFA States:** Check that ε-closure is computed correctly

4. ✅ **Minimization:** Ensure final and non-final states are properly separated

5. ✅ **Simulation:** Verify that state transitions match the DFA transition table

---

## 🏆 Success Criteria

- ✅ All valid strings (7 cases) are accepted
- ✅ All invalid strings (8 cases) are rejected
- ✅ "aacc" demonstrates Accept → Reject → Accept behavior
- ✅ Visual highlighting updates correctly during simulation
- ✅ NFA, DFA, and Minimized DFA all produce correct results
- ✅ No JavaScript errors in browser console

---

## 📝 Test Report Template

```
Test Date: ____________
Tester: Furqan Azeem
Regex: (a+aaa+aa)*cc+ba+aa

NFA States: ____
DFA States: ____
Minimized DFA States: ____

Valid Tests Passed: ___/7
Invalid Tests Passed: ___/8

Critical Test (aacc):
- Step 2 (aa): [✅ Accept / ❌ Reject]
- Step 3 (aac): [✅ Reject / ❌ Accept]
- Step 4 (aacc): [✅ Accept / ❌ Reject]

Overall Status: [✅ PASS / ❌ FAIL]

Notes: _______________________________________________
```

---

## 🎯 Conclusion

This testing guide ensures comprehensive validation of the automaton implementation. Following these steps guarantees a successful viva demonstration and proves the correctness of all three algorithms: Thompson's NFA, Subset Construction, and Table-Filling Minimization.

**Remember:** The "aacc" test is your ace card for the viva! 🎓
