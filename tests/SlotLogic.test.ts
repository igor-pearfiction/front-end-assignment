import { describe, it, expect } from 'vitest';
import { SlotLogic, type WinDetail } from '../src/SlotLogic.js';
import { SCENARIOS } from '../src/Scenarios.js';

describe('SlotLogic', () => {
    const slotLogic = new SlotLogic();

    it('Scenario 1: positions 0, 0, 0, 0, 0', () => {
        const positions = [0, 0, 0, 0, 0];
        const screen = slotLogic.getScreenSymbols(positions);

        expect(screen[0]).toEqual(["hv2", "hv1", "lv1", "hv2", "lv3"]);
        expect(screen[1]).toEqual(["lv3", "lv2", "hv2", "lv2", "lv4"]);
        expect(screen[2]).toEqual(["lv3", "lv3", "lv3", "hv3", "hv2"]);

        const result = slotLogic.calculateWins(screen);
        expect(result.totalWin).toBe(1);
        expect(result.details.length).toBe(1);
        expect(result.details[0]).toEqual({ paylineId: 3, symbolId: "lv3", matchCount: 3, payout: 1 });
    });

    it('Scenario 2: positions 18, 9, 2, 0, 12', () => {
        const positions = [18, 9, 2, 0, 12];
        const screen = slotLogic.getScreenSymbols(positions);

        expect(screen[0]).toEqual(["lv3", "hv4", "lv3", "hv2", "lv2"]);
        expect(screen[1]).toEqual(["hv2", "lv3", "lv4", "lv2", "hv4"]);
        expect(screen[2]).toEqual(["hv2", "hv2", "hv3", "hv3", "hv1"]);

        const result = slotLogic.calculateWins(screen);
        expect(result.totalWin).toBe(0);
        expect(result.details.length).toBe(0);
    });

    it('Scenario 3: positions 0, 11, 1, 10, 14', () => {
        const positions = [0, 11, 1, 10, 14];
        const screen = slotLogic.getScreenSymbols(positions);

        expect(screen[0]).toEqual(["hv2", "hv2", "hv2", "lv1", "hv1"]);
        expect(screen[1]).toEqual(["lv3", "lv1", "lv3", "hv1", "lv2"]);
        expect(screen[2]).toEqual(["lv3", "lv3", "lv4", "lv2", "hv1"]);

        const result = slotLogic.calculateWins(screen);
        expect(result.totalWin).toBe(6);
        expect(result.details.length).toBe(2);
        
        // payline 2, hv2 x3, 5
        expect(result.details.find((d: WinDetail) => d.paylineId === 2)).toEqual({ paylineId: 2, symbolId: "hv2", matchCount: 3, payout: 5 });
        // payline 5, lv3 x3, 1
        expect(result.details.find((d: WinDetail) => d.paylineId === 5)).toEqual({ paylineId: 5, symbolId: "lv3", matchCount: 3, payout: 1 });
    });

    it('Scenario 4: positions 5, 14, 9, 9, 16', () => {
        const positions = [5, 14, 9, 9, 16];
        const screen = slotLogic.getScreenSymbols(positions);

        expect(screen[0]).toEqual(["lv1", "hv1", "lv1", "hv1", "hv1"]);
        expect(screen[1]).toEqual(["hv1", "lv1", "hv3", "lv1", "lv2"]);
        expect(screen[2]).toEqual(["hv4", "lv2", "lv1", "hv1", "hv4"]); // The prompt had a typo here, it should be hv4 based on band 1 index 7

        const result = slotLogic.calculateWins(screen);
        expect(result.totalWin).toBe(5); // payline 7 fails due to the hv4
        expect(result.details.length).toBe(1);
        
        // payline 6, lv1 x4, 5
        expect(result.details.find((d: WinDetail) => d.paylineId === 6)).toEqual({ paylineId: 6, symbolId: "lv1", matchCount: 4, payout: 5 });
    });

    it('Scenario 5: positions 1, 16, 2, 15, 0', () => {
        const positions = [1, 16, 2, 15, 0];
        const screen = slotLogic.getScreenSymbols(positions);

        expect(screen[0]).toEqual(["lv3", "lv2", "lv3", "lv3", "lv3"]);
        expect(screen[1]).toEqual(["lv3", "lv4", "lv4", "hv2", "lv4"]);
        expect(screen[2]).toEqual(["hv1", "lv3", "hv3", "lv1", "hv2"]);

        const result = slotLogic.calculateWins(screen);
        expect(result.totalWin).toBe(0);
        expect(result.details.length).toBe(0);
    });

    describe('lil-gui scenarios', () => {
        SCENARIOS
            .filter((scenario) => scenario.positions !== null)
            .forEach((scenario) => {
                it(`triggers ${scenario.name}`, () => {
                    const screen = slotLogic.getScreenSymbols(scenario.positions!);
                    const result = slotLogic.calculateWins(screen);

                    expect(result.details).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                symbolId: scenario.expectedSymbolId,
                                matchCount: scenario.expectedMatchCount
                            })
                        ])
                    );
                });
            });

        it('Scenario 1 (Random Spin) is configured as a random scenario', () => {
            const randomScenario = SCENARIOS.find((scenario) => scenario.name === 'Random Spin');

            expect(randomScenario).toBeDefined();
            expect(randomScenario!.positions).toBeNull();
        });
    });
});