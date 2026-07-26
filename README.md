# Pear Fiction Frontend Assessment

![Screenshot](screenshot.png)

```shell
npm install
npm run dev
echo 'Open http://localhost:5173/ in your browser'
```

---

## Testing

Run the tests with:
```bash
npm test
```

Unit Test file (`SlotLogic.ts`) has tests it respects the provided paylines, paytable, and reel bands.

---

## Architecture

- `src/SlotLogic.js`: Pure ES6 class containing the math model (reel bands, paylines, paytable, random positions, and win calculation). Completely decoupled from PIXI.js to allow easy testing.
- `src/Game.js`: Manages the PIXI.js `Application`, handles asset loading, UI generation (Reels, Spin button, Winnings text), and dynamic scaling layout logic.
- `src/main.js`: The application entry point.
- `tests/SlotLogic.test.js`: Vitest test suite validating the slot machine math model against multiple scenarios.


---

## Requirements:
* ✅ Written in ECMAScript 6th edition
* ✅ Using Pixi.js
* ✅ Preloader screen with images/assets used in game
  * ✅ This screen should show a progress loader and a load percentage
* ✅ Spin button should be the circle button image provided. 
* ✅ Pressing the spin button, the reels positions should be picked randomly and the symbols be updated on the screen. 
  * ✅ No spinning animation is required.
* ✅ To determine the visible symbols, use this reelset bands description
* ✅ Unit Tests
* ❌ Due 24th June 2026
  * ❌ If you can't make this time, let them know

### My Added Features
* ✅ Info icon
  * ✅ Info Panel shows paylines
* ✅ Made use of lil-gui to simulate spins
  * ✅ Added simulation options so that you can simulate wins
* ✅ Coverage Report on Tests