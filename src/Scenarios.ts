export interface ScenarioDefinition {
    name: string;
    positions: number[] | null;
    expectedSymbolId?: string;
    expectedMatchCount?: number;
}

export const SCENARIOS: ScenarioDefinition[] = [
    {
        name: 'Random Spin',
        positions: null
    },
    {
        name: '3 of a kind hv1',
        positions: [1, 12, 10, 0, 0],
        expectedSymbolId: 'hv1',
        expectedMatchCount: 3
    },
    {
        name: '4 of a kind hv1',
        positions: [1, 12, 10, 7, 0],
        expectedSymbolId: 'hv1',
        expectedMatchCount: 4
    },
    {
        name: '5 of a kind hv1',
        positions: [1, 12, 10, 7, 3],
        expectedSymbolId: 'hv1',
        expectedMatchCount: 5
    },
    {
        name: '3 of a kind hv2',
        positions: [0, 10, 3, 0, 0],
        expectedSymbolId: 'hv2',
        expectedMatchCount: 3
    },
    {
        name: '4 of a kind hv2',
        positions: [0, 10, 3, 15, 0],
        expectedSymbolId: 'hv2',
        expectedMatchCount: 4
    },
    {
        name: '5 of a kind hv2',
        positions: [0, 10, 3, 15, 2],
        expectedSymbolId: 'hv2',
        expectedMatchCount: 5
    },
    {
        name: '3 of a kind hv4',
        positions: [5, 7, 14, 0, 0],
        expectedSymbolId: 'hv4',
        expectedMatchCount: 3
    },
    {
        name: '3 of a kind lv1',
        positions: [3, 2, 7, 0, 0],
        expectedSymbolId: 'lv1',
        expectedMatchCount: 3
    },
    {
        name: '4 of a kind lv1',
        positions: [3, 2, 7, 8, 0],
        expectedSymbolId: 'lv1',
        expectedMatchCount: 4
    },
    {
        name: '3 of a kind lv3',
        positions: [0, 0, 0, 0, 0],
        expectedSymbolId: 'lv3',
        expectedMatchCount: 3
    },
    {
        name: '4 of a kind lv3',
        positions: [0, 0, 0, 13, 0],
        expectedSymbolId: 'lv3',
        expectedMatchCount: 4
    },
    {
        name: '5 of a kind lv3',
        positions: [0, 0, 0, 13, 18],
        expectedSymbolId: 'lv3',
        expectedMatchCount: 5
    },
    {
        name: '3 of a kind lv4',
        positions: [10, 4, 1, 0, 0],
        expectedSymbolId: 'lv4',
        expectedMatchCount: 3
    },
    {
        name: '4 of a kind lv4',
        positions: [10, 4, 1, 2, 0],
        expectedSymbolId: 'lv4',
        expectedMatchCount: 4
    },
    {
        name: '5 of a kind lv4',
        positions: [10, 4, 1, 2, 17],
        expectedSymbolId: 'lv4',
        expectedMatchCount: 5
    }
];

export const SCENARIOS_BY_NAME = Object.fromEntries(
    SCENARIOS.map((scenario) => [scenario.name, scenario])
);