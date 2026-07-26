import {Application, Assets, Sprite, Text, Container, Graphics} from 'pixi.js';
import {SlotLogic, type WinResult} from './SlotLogic.js';
import {SCENARIOS, SCENARIOS_BY_NAME} from './Scenarios.js';
import GUI from 'lil-gui';

export class Game {
    app!: Application;
    logic!: SlotLogic;
    gameContainer!: Container;
    reelsContainer!: Container;
    symbolSprites!: Sprite[][];
    reelCols!: any[]; // To track spin state
    backgroundSprite!: Sprite;
    logoSprite!: Sprite;
    spinButton!: Sprite;
    winText!: Text;
    isSpinning!: boolean;
    targetPositions!: number[];

    async init(containerId: string) {
        this.app = new Application();

        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x222222,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        this.app.stage.sortableChildren = true;

        document.getElementById(containerId)!.appendChild(this.app.canvas);

        this.logic = new SlotLogic();
        this.gameContainer = new Container();
        this.gameContainer.zIndex = 10;
        this.app.stage.addChild(this.gameContainer);

        this.symbolSprites = []; // [row][col]

        window.addEventListener('resize', this.onResize.bind(this));

        await this.loadAssets();
        this.buildGame();

        // Initial setup as per requirements
        this.targetPositions = [0, 0, 0, 0, 0];

        // Populate initial symbols instantly without animation
        const initialScreen = this.logic.getScreenSymbols(this.targetPositions);
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                this.symbolSprites[row + 1]![col]!.texture = Assets.get(initialScreen[row]![col]!);
            }
        }

        this.onResize(); // Initial layout calc
    }

    async loadAssets() {
        const minimumLoadingTimeMs = 3 * 1000;

        const loadingText = new Text({
            text: 'Loading: 0%',
            style: {fontFamily: 'Arial', fontSize: 36, fill: 0xffffff, align: 'center'}
        });

        const minimumLoadingTimeText = new Text({
            text: 'Loader shown for a minimum of three seconds.',
            style: {fontFamily: 'Arial', fontSize: 16, fill: 0xffffff, align: 'center'}
        });

        loadingText.anchor.set(0.5);
        loadingText.x = this.app.screen.width / 2;
        loadingText.y = this.app.screen.height / 2;
        this.app.stage.addChild(loadingText);

        minimumLoadingTimeText.anchor.set(0.5);
        minimumLoadingTimeText.x = this.app.screen.width / 2;
        minimumLoadingTimeText.y = loadingText.y + 50;
        this.app.stage.addChild(minimumLoadingTimeText);

        const assets = [
            {alias: 'background', src: 'assets/background.jpg'},
            {alias: 'logo', src: 'assets/logo.png'},
            {alias: 'hv1', src: 'assets/hv1_symbol.png'},
            {alias: 'hv2', src: 'assets/hv2_symbol.png'},
            {alias: 'hv3', src: 'assets/hv3_symbol.png'},
            {alias: 'hv4', src: 'assets/hv4_symbol.png'},
            {alias: 'lv1', src: 'assets/lv1_symbol.png'},
            {alias: 'lv2', src: 'assets/lv2_symbol.png'},
            {alias: 'lv3', src: 'assets/lv3_symbol.png'},
            {alias: 'lv4', src: 'assets/lv4_symbol.png'},
            {alias: 'spin_button', src: 'assets/spin_button.png'}
        ];

        Assets.addBundle('gameAssets', assets);

        const minimumLoadingDelay = new Promise<void>((resolve) => {
            window.setTimeout(resolve, minimumLoadingTimeMs);
        });

        const assetLoading = Assets.loadBundle('gameAssets', (progress) => {
            loadingText.text = `Loading: ${Math.floor(progress * 100)}%`;
        });

        await Promise.all([assetLoading, minimumLoadingDelay]);

        this.app.stage.removeChild(loadingText);
        this.app.stage.removeChild(minimumLoadingTimeText);
    }

    buildGame() {
        this.backgroundSprite = new Sprite(Assets.get('background'));
        this.backgroundSprite.anchor.set(0.5);
        this.backgroundSprite.zIndex = -10;
        this.app.stage.addChild(this.backgroundSprite);

        this.gameContainer.zIndex = 10;

        this.logoSprite = new Sprite(Assets.get('logo'));
        this.logoSprite.anchor.set(0.5, 0);
        this.gameContainer.addChild(this.logoSprite);

        this.reelsContainer = new Container();
        this.gameContainer.addChild(this.reelsContainer);

        const symbolWidth = 150;
        const symbolHeight = 150;
        const padding = 10;

        // Mask to hide the extra row used for sliding
        const reelsWidth = 5 * symbolWidth + 4 * padding;
        const reelsHeight = 3 * symbolHeight + 2 * padding;
        const mask = new Graphics();
        mask.rect(0, 0, reelsWidth, reelsHeight);
        mask.fill(0xffffff);
        this.reelsContainer.addChild(mask);
        this.reelsContainer.mask = mask;

        this.reelCols = [];
        this.symbolSprites = []; // [row][col]

        for (let row = 0; row < 4; row++) {
            this.symbolSprites[row] = [];
        }

        for (let col = 0; col < 5; col++) {
            const colContainer = new Container();
            colContainer.x = col * (symbolWidth + padding);
            this.reelsContainer.addChild(colContainer);
            this.reelCols.push(colContainer);

            for (let row = 0; row < 4; row++) {
                const sprite = new Sprite(Assets.get('hv1'));
                sprite.width = symbolWidth;
                sprite.height = symbolHeight;
                sprite.y = (row - 1) * (symbolHeight + padding); // Row 0 is above the mask
                colContainer.addChild(sprite);
                this.symbolSprites[row]![col] = sprite;
            }
        }

        this.spinButton = new Sprite(Assets.get('spin_button'));
        this.spinButton.anchor.set(0.5);
        this.spinButton.eventMode = 'static';
        this.spinButton.cursor = 'pointer';
        this.spinButton.on('pointerdown', this.onSpin.bind(this));

        this.gameContainer.addChild(this.spinButton);

        this.winText = new Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 28,
                fill: 0xff0000,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: 800
            }
        });
        this.winText.anchor.set(0.5, 0); // Anchor top-center
        this.app.stage.addChild(this.winText);

        this.isSpinning = false;
        this.app.ticker.add((ticker) => {
            this.animateSpin(ticker.deltaMS);
        });

        this.setupGUI();
        this.app.stage.sortableChildren = true;
    }

    setupGUI() {
        const gui = new GUI();

        const state = {
            scenario: SCENARIOS[0]!.name,
            triggerScenario: () => {
                this.triggerScenario(state.scenario);
            }
        };

        gui.add(state, 'scenario', SCENARIOS.map((scenario) => scenario.name)).name('Scenario');
        gui.add(state, 'triggerScenario').name('Trigger Scenario');
    }

    triggerScenario(scenarioName: string) {
        const scenario = SCENARIOS_BY_NAME[scenarioName];

        if (!scenario) {
            console.warn(`Unknown scenario: ${scenarioName}`);
            return;
        }

        if (scenario.positions) {
            this.updateReels(scenario.positions);
            return;
        }

        this.onSpin();
    }

    updateReels(positions: number[] | null) {
        if (this.isSpinning || !positions) {
            return;
        }
        this.isSpinning = true;
        this.targetPositions = positions;
        this.winText.text = '';

        for (let col = 0; col < 5; col++) {
            const reel = this.reelCols[col];
            reel.spinTime = 500 + col * 250;
            reel.stopped = false;
            reel.stopIndex = 2;
        }
    }

    animateSpin(deltaMS: number) {
        if (!this.isSpinning) return;

        const symbolHeight = 150;
        const padding = 10;
        const totalHeight = symbolHeight + padding;
        const speed = 2.5; // pixels per ms

        let allStopped = true;

        for (let col = 0; col < 5; col++) {
            const reel = this.reelCols[col];

            if (reel.stopped) continue;

            allStopped = false;
            reel.spinTime -= deltaMS;
            reel.y += speed * deltaMS;

            if (reel.y >= totalHeight) {
                reel.y -= totalHeight;

                // Shift textures down
                for (let row = 3; row > 0; row--) {
                    this.symbolSprites[row]![col]!.texture = this.symbolSprites[row - 1]![col]!.texture;
                }

                if (reel.spinTime <= 0) {
                    if (reel.stopIndex >= 0) {
                        const screenSymbols = this.logic.getScreenSymbols(this.targetPositions!);
                        const symbolId = screenSymbols[reel.stopIndex]![col]!;
                        this.symbolSprites[0]![col]!.texture = Assets.get(symbolId);
                        reel.stopIndex--;
                    } else {
                        // Finished sliding in the final symbols
                        reel.y = 0;
                        reel.stopped = true;
                    }
                } else {
                    // Randomize top texture while spinning
                    const randomId = Object.keys(this.logic.paytable)[Math.floor(Math.random() * 8)]!;
                    this.symbolSprites[0]![col]!.texture = Assets.get(randomId);
                }
            }
        }

        if (allStopped) {
            this.isSpinning = false;
            const screenSymbols = this.logic.getScreenSymbols(this.targetPositions!);
            const winResult = this.logic.calculateWins(screenSymbols);
            this.displayWins(winResult);
        }
    }

    onSpin() {
        const randomPositions = this.logic.getRandomPositions();
        this.updateReels(randomPositions);
    }

    displayWins(winResult: WinResult) {
        let text = `Total wins: ${winResult.totalWin}`;
        winResult.details.forEach(detail => {
            text += `\n- payline ${detail.paylineId}, ${detail.symbolId} x${detail.matchCount}, ${detail.payout}`;
        });
        this.winText.text = text;
        this.onResize(); // Recalculate layout to fit new text length
    }

    onResize() {
        if (!this.gameContainer || !this.winText || !this.logoSprite || !this.backgroundSprite) return;

        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        this.backgroundSprite.x = screenWidth / 2;
        this.backgroundSprite.y = screenHeight / 2;

        const backgroundScale = Math.max(
            screenWidth / this.backgroundSprite.texture.width,
            screenHeight / this.backgroundSprite.texture.height
        );

        this.backgroundSprite.scale.set(backgroundScale);

        const symbolWidth = 150;
        const symbolHeight = 150;
        const padding = 10;

        const logoDisplayHeight = 130;
        const logoGap = 35;

        const spinButtonHeight = 256;
        const spinButtonGap = 40;

        const reelsWidth = 5 * symbolWidth + 4 * padding;
        const reelsHeight = 3 * symbolHeight + 2 * padding;

        this.logoSprite.scale.set(1);
        this.logoSprite.height = logoDisplayHeight;
        this.logoSprite.scale.x = this.logoSprite.scale.y;

        this.logoSprite.x = 0;
        this.logoSprite.y = 0;

        this.reelsContainer.x = -reelsWidth / 2;
        this.reelsContainer.y = logoDisplayHeight + logoGap;

        this.spinButton.x = 0;
        this.spinButton.y = this.reelsContainer.y + reelsHeight + spinButtonHeight / 2 + spinButtonGap;

        const topContentHeight = this.spinButton.y + this.spinButton.height / 2;
        const topContentWidth = Math.max(reelsWidth, this.spinButton.width, this.logoSprite.width);

        // Leave space for text below the spin button
        const availableTextHeight = Math.max(screenHeight * 0.25, 150);
        const maxTopHeight = screenHeight - availableTextHeight - 40;
        const maxTopWidth = screenWidth * 0.95;

        const scaleX = maxTopWidth / topContentWidth;
        const scaleY = maxTopHeight / topContentHeight;
        let scale = Math.min(scaleX, scaleY);

        // Prevent scaling up too much on large screens
        if (scale > 1.2) scale = 1.2;

        this.gameContainer.scale.set(scale);
        this.gameContainer.x = screenWidth / 2;

        // Center the logo + reels + spin button block vertically in its allocated space
        this.gameContainer.y = Math.max(20, (maxTopHeight - topContentHeight * scale) / 2 + 20);

        // Position win text below the spin button
        const spinButtonBottomY = this.gameContainer.y + (this.spinButton.y + this.spinButton.height / 2) * scale;

        this.winText.x = screenWidth / 2;
        this.winText.y = spinButtonBottomY + 20;

        // Reset text scale and set word wrap width
        this.winText.scale.set(1);
        this.winText.style.wordWrapWidth = screenWidth * 0.9;

        const textHeight = this.winText.height;
        const remainingHeight = screenHeight - this.winText.y - 20;

        // Scale text down if it overflows the remaining height
        if (textHeight > remainingHeight && remainingHeight > 0) {
            const textScale = remainingHeight / textHeight;
            this.winText.scale.set(textScale);
        }
    }
}
