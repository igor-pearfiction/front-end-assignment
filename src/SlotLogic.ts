export interface WinDetail {
    paylineId: number;
    symbolId: string;
    matchCount: number;
    payout: number;
}

export interface WinResult {
    totalWin: number;
    details: WinDetail[];
}

export type Paytable = Record<string, Record<number, number>>;

export class SlotLogic {
    bands: string[][];
    paytable: Paytable;
    paylines: number[][];

    constructor() {
        this.bands = [
            ["hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2"],
            ["hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2"],
            ["lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4"],
            ["hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2"],
            ["lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4"]
        ];

        this.paytable = {
            "hv1": { 3: 10, 4: 20, 5: 50 },
            "hv2": { 3: 5,  4: 10, 5: 20 },
            "hv3": { 3: 5,  4: 10, 5: 15 },
            "hv4": { 3: 5,  4: 10, 5: 15 },
            "lv1": { 3: 2,  4: 5,  5: 10 },
            "lv2": { 3: 1,  4: 2,  5: 5  },
            "lv3": { 3: 1,  4: 2,  5: 3  },
            "lv4": { 3: 1,  4: 2,  5: 3  }
        };

        // Paylines defined as the row index (0, 1, or 2) for each of the 5 columns
        this.paylines = [
            [1, 1, 1, 1, 1], // Payline 1: middle
            [0, 0, 0, 0, 0], // Payline 2: top
            [2, 2, 2, 2, 2], // Payline 3: bottom
            [0, 0, 1, 2, 2], // Payline 4: V-shape top
            [2, 2, 1, 0, 0], // Payline 5: V-shape bottom
            [0, 1, 2, 1, 0], // Payline 6: zig-zag top
            [2, 1, 0, 1, 2]  // Payline 7: zig-zag bottom
        ];
    }

    getRandomPositions(): number[] {
        return this.bands.map(band => Math.floor(Math.random() * band.length));
    }

    getScreenSymbols(positions: number[]): string[][] {
        // Returns a 2D array: screen[row][col]
        const screen: string[][] = [
            [], // Top row (0)
            [], // Middle row (1)
            []  // Bottom row (2)
        ];

        for (let col = 0; col < 5; col++) {
            const pos = positions[col]!;
            const band = this.bands[col]!;
            screen[0]![col] = band[pos % band.length]!;
            screen[1]![col] = band[(pos + 1) % band.length]!;
            screen[2]![col] = band[(pos + 2) % band.length]!;
        }
        return screen;
    }

    calculateWins(screen: string[][]): WinResult {
        let totalWin = 0;
        const details: WinDetail[] = [];

        this.paylines.forEach((line, index) => {
            const paylineId = index + 1;
            const symbolsOnLine = line.map((row, col) => screen[row]![col]!);

            // Check for matching symbols starting from the leftmost column
            const firstSymbol = symbolsOnLine[0]!;
            let matchCount = 1;

            for (let i = 1; i < 5; i++) {
                if (symbolsOnLine[i] === firstSymbol) {
                    matchCount++;
                } else {
                    break;
                }
            }

            if (matchCount >= 3) {
                const payout = this.paytable[firstSymbol]![matchCount]!;
                totalWin += payout;
                details.push({
                    paylineId: paylineId,
                    symbolId: firstSymbol,
                    matchCount: matchCount,
                    payout: payout
                });
            }
        });

        return {
            totalWin,
            details
        };
    }
}
