# Testing Guide - Automata Visualizer
## Group 4 - Furqan Azeem

---

## 🎯 Testing Objective

Verify that the automaton correctly implements the assigned regex `(a+aaa+aa)*cc+ba+aa` by testing all three patterns and edge cases.

---

## 📝 Test Plan

### Test Suite 1: Valid Strings (Should Accept ✅)

#### Test Case 1.1: Pattern A - Zero Loop
**Input:** `cc`  
**Expected:** ACCEPT (Green)  
**Pattern:** `(a+aaa+aa)*cc` with loop executing 0 times  
**Explanation:** The star allows zero repetitions, so "cc" alone is valid.

#### Test Case 1.2: Pattern A - Single 'a'
**Input:** `acc`  
**Expected:** ACCEPT (Green)  
**Pattern:** `(a+aaa+aa)*cc` with one 'a'  
**Explanation:** Loop executes once with 'a', followed by "cc".

#### Test Case 1.3: Pattern A - Two 'a's
**Input:** `aacc`  
**Expected:** ACCEPT (Green)  
**Pattern:** `(a+aaa+aa)*cc` OR matches Pattern C first then Pattern A  
**Explanation:** Can be: (1) Loop with "aa", then "cc", OR (2) First accepts "aa" (Pattern C), then continues to "aacc" (Pattern A).

**⚠️ CRITICAL TEST:** This demonstrates the "Accept → Reject → Accept" behavior:
- After "aa": **ACCEPT** ✅ (Pattern C)
- After "aac": **REJECT** ❌ (intermediate state)
- After "aacc": **ACCEPT** ✅ (Pattern A)

#### Test Case 1.4: Pattern A - Three 'a's
**Input:** `aaacc`  
**Expected:** ACCEPT (Green)  
**Pattern:** `(a+aaa+aa)*cc` with "aaa"  
**Explanation:** Loop selects the "aaa" path, followed by "cc".

#### Test Case 1.5: Pattern A - Multiple 'a's
**Input:** `aaaaacc`  
**Expected:** ACCEPT (Green)  
**Pattern:** `(a+aaa+aa)*cc` with multiple loop iterations  
**Explanation:** Loop can execute multiple times: "aa" + "aaa" or "a" + "aa" + "aa", etc.

#### Test Case 1.6: Pattern B - Exact Match
**Input:** `ba`  
**Expected:** ACCEPT (Green)  
**Pattern:** `ba`  
**Explanation:** Direct match of the second union branch.

#### Test Case 1.7: Pattern C - Exact Match
**Input:** `aa`  
**Expected:** ACCEPT (Green)  
**Pattern:** `aa`  
**Explanation:** Direct match of the third union branch.

---

### Test Suite 2: Invalid Strings (Should Reject ❌)

#### Test Case 2.1: Incomplete "cc"
**Input:** `c`  
**Expected:** REJECT (Red)  
**Reason:** Pattern A requires "cc" (two c's), not just one.  
**DFA Behavior:** After 'c', no valid transition exists or machine is not in final state.

#### Test Case 2.2: Single 'a'
**Input:** `a`  
**Expected:** REJECT (Red)  
**Reason:** Not "aa" (Pattern C), and not followed by "cc" (Pattern A).  
**DFA Behavior:** Machine stops in non-final state.

#### Test Case 2.3: Three 'a's without "cc"
**Input:** `aaa`  
**Expected:** REJECT (Red)  
**Reason:** Pattern A requires "cc" after the a's. Pattern C only accepts "aa".  
**DFA Behavior:** Missing "cc" termination.

#### Test Case 2.4: Incomplete "ba"
**Input:** `b`  
**Expected:** REJECT (Red)  
**Reason:** Pattern B requires "ba", not just 'b'.  
**DFA Behavior:** Machine expects 'a' after 'b'.

#### Test Case 2.5: Extra Character After "ba"
**Input:** `bac`  
**Expected:** REJECT (Red)  
**Reason:** Pattern B is exactly "ba". The extra 'c' has no valid transition.  
**DFA Behavior:** After accepting "ba", there's no path for 'c'.

#### Test Case 2.6: Wrong Order
**Input:** `caa`  
**Expected:** REJECT (Red)  
**Reason:** Pattern A requires a's before "cc", not "c" before "aa".  
**DFA Behavior:** Starting with 'c' leads to wrong path.

#### Test Case 2.7: Invalid Sequence
**Input:** `aba`  
**Expected:** REJECT (Red)  
**Reason:** No pattern supports 'a' followed by 'b' followed by 'a'.  
**DFA Behavior:** After 'a', machine expects more a's or "cc", not 'b'.

#### Test Case 2.8: Partial "aacc"
**Input:** `aaca`  
**Expected:** REJECT (Red)  
**Reason:** "aac" is incomplete (missing second 'c'), then extra 'a'.  
**DFA Behavior:** Machine leaves the path to Pattern A completion.

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
| 1.1 | cc | ✅ ACCEPT | A |
| 1.2 | acc | ✅ ACCEPT | A |
| 1.3 | aacc | ✅ ACCEPT | A |
| 1.4 | aaacc | ✅ ACCEPT | A |
| 1.5 | aaaaacc | ✅ ACCEPT | A |
| 1.6 | ba | ✅ ACCEPT | B |
| 1.7 | aa | ✅ ACCEPT | C |
| 2.1 | c | ❌ REJECT | None |
| 2.2 | a | ❌ REJECT | None |
| 2.3 | aaa | ❌ REJECT | None |
| 2.4 | b | ❌ REJECT | None |
| 2.5 | bac | ❌ REJECT | None |
| 2.6 | caa | ❌ REJECT | None |
| 2.7 | aba | ❌ REJECT | None |
| 2.8 | aaca | ❌ REJECT | None |

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
