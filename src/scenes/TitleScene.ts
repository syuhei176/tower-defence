import { Application, Container, Graphics, Text } from "pixi.js";
import { CELL_SIZE, GRID_HEIGHT, GRID_WIDTH } from "../constant";

export type Difficulty = "easy" | "normal" | "hard";

export class TitleScene extends Container {
  private onStartCallback?: (difficulty: Difficulty) => void;
  private selectedDifficulty: Difficulty = "normal";

  constructor(_app: Application) {
    super();

    // Background
    const bg = new Graphics();
    bg.beginFill(0x1a1a2e);
    bg.drawRect(0, 0, CELL_SIZE * GRID_WIDTH, CELL_SIZE * GRID_HEIGHT);
    bg.endFill();
    this.addChild(bg);

    // Title text
    const titleText = new Text({
      text: "TOWER DEFENCE",
      style: {
        fontFamily: "Arial",
        fontSize: "64px",
        fill: "#00ff88",
        fontWeight: "bold",
      },
    });
    titleText.anchor.set(0.5);
    titleText.x = (CELL_SIZE * GRID_WIDTH) / 2;
    titleText.y = (CELL_SIZE * GRID_HEIGHT) / 4;
    this.addChild(titleText);

    // Difficulty selection label
    const difficultyLabel = new Text({
      text: "SELECT DIFFICULTY",
      style: {
        fontFamily: "Arial",
        fontSize: "24px",
        fill: "#cccccc",
        fontWeight: "bold",
      },
    });
    difficultyLabel.anchor.set(0.5);
    difficultyLabel.x = (CELL_SIZE * GRID_WIDTH) / 2;
    difficultyLabel.y = (CELL_SIZE * GRID_HEIGHT) / 2 - 120;
    this.addChild(difficultyLabel);

    // Difficulty buttons
    const difficulties: {
      name: Difficulty;
      label: string;
      color: number;
      money: number;
    }[] = [
      { name: "easy", label: "EASY (💰150)", color: 0x00ff88, money: 150 },
      { name: "normal", label: "NORMAL (💰100)", color: 0x00ccff, money: 100 },
      { name: "hard", label: "HARD (💰75)", color: 0xff6600, money: 75 },
    ];

    const difficultyButtons: {
      button: Graphics;
      text: Text;
      difficulty: Difficulty;
    }[] = [];

    difficulties.forEach((diff, index) => {
      const buttonBg = new Graphics();
      const buttonWidth = 200;
      const buttonHeight = 50;
      const verticalSpacing = 65;
      const startY = (CELL_SIZE * GRID_HEIGHT) / 2 - 60;

      buttonBg.beginFill(diff.color, 0.3);
      buttonBg.lineStyle(3, diff.color);
      buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
      buttonBg.endFill();
      buttonBg.x = (CELL_SIZE * GRID_WIDTH) / 2 - buttonWidth / 2;
      buttonBg.y = startY + verticalSpacing * index;
      buttonBg.interactive = true;
      buttonBg.cursor = "pointer";
      this.addChild(buttonBg);

      const buttonText = new Text({
        text: diff.label,
        style: {
          fontFamily: "Arial",
          fontSize: "20px",
          fill: "#ffffff",
          fontWeight: "bold",
        },
      });
      buttonText.anchor.set(0.5);
      buttonText.x = (CELL_SIZE * GRID_WIDTH) / 2;
      buttonText.y = startY + verticalSpacing * index + buttonHeight / 2;
      this.addChild(buttonText);

      difficultyButtons.push({
        button: buttonBg,
        text: buttonText,
        difficulty: diff.name,
      });

      // Button click
      buttonBg.on("pointerdown", () => {
        this.selectedDifficulty = diff.name;

        // Update all buttons
        difficultyButtons.forEach((btn) => {
          const btnDiff = difficulties.find((d) => d.name === btn.difficulty)!;
          btn.button.clear();
          if (btn.difficulty === this.selectedDifficulty) {
            // Selected style
            btn.button.beginFill(btnDiff.color, 0.8);
            btn.button.lineStyle(3, btnDiff.color);
          } else {
            // Unselected style
            btn.button.beginFill(btnDiff.color, 0.3);
            btn.button.lineStyle(3, btnDiff.color);
          }
          btn.button.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
          btn.button.endFill();
        });
      });

      // Button hover effect
      buttonBg.on("pointerover", () => {
        if (this.selectedDifficulty !== diff.name) {
          buttonBg.clear();
          buttonBg.beginFill(diff.color, 0.5);
          buttonBg.lineStyle(3, diff.color);
          buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
          buttonBg.endFill();
        }
      });

      buttonBg.on("pointerout", () => {
        if (this.selectedDifficulty !== diff.name) {
          buttonBg.clear();
          buttonBg.beginFill(diff.color, 0.3);
          buttonBg.lineStyle(3, diff.color);
          buttonBg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
          buttonBg.endFill();
        }
      });
    });

    // Set normal as default selected
    const normalButton = difficultyButtons.find(
      (btn) => btn.difficulty === "normal",
    )!;
    const normalDiff = difficulties.find((d) => d.name === "normal")!;
    normalButton.button.clear();
    normalButton.button.beginFill(normalDiff.color, 0.8);
    normalButton.button.lineStyle(3, normalDiff.color);
    normalButton.button.drawRoundedRect(0, 0, 200, 50, 8);
    normalButton.button.endFill();

    // Start button
    const startButtonBg = new Graphics();
    startButtonBg.beginFill(0x00ccff);
    startButtonBg.drawRoundedRect(0, 0, 200, 60, 10);
    startButtonBg.endFill();
    startButtonBg.x = (CELL_SIZE * GRID_WIDTH) / 2 - 100;
    startButtonBg.y = (CELL_SIZE * GRID_HEIGHT) / 2 + 150;
    startButtonBg.interactive = true;
    startButtonBg.cursor = "pointer";
    this.addChild(startButtonBg);

    const startText = new Text({
      text: "START GAME",
      style: {
        fontFamily: "Arial",
        fontSize: "28px",
        fill: "#ffffff",
        fontWeight: "bold",
      },
    });
    startText.anchor.set(0.5);
    startText.x = (CELL_SIZE * GRID_WIDTH) / 2;
    startText.y = (CELL_SIZE * GRID_HEIGHT) / 2 + 180;
    this.addChild(startText);

    // Instructions
    const instructionText = new Text({
      text: "Click to place towers (25💰)\nClick tower to upgrade\nDefend your base!",
      style: {
        fontFamily: "Arial",
        fontSize: "18px",
        fill: "#cccccc",
        align: "center",
      },
    });
    instructionText.anchor.set(0.5);
    instructionText.x = (CELL_SIZE * GRID_WIDTH) / 2;
    instructionText.y = (CELL_SIZE * GRID_HEIGHT * 3) / 4 + 40;
    this.addChild(instructionText);

    // Start button hover effect
    startButtonBg.on("pointerover", () => {
      startButtonBg.clear();
      startButtonBg.beginFill(0x00ddff);
      startButtonBg.drawRoundedRect(0, 0, 200, 60, 10);
      startButtonBg.endFill();
    });

    startButtonBg.on("pointerout", () => {
      startButtonBg.clear();
      startButtonBg.beginFill(0x00ccff);
      startButtonBg.drawRoundedRect(0, 0, 200, 60, 10);
      startButtonBg.endFill();
    });

    // Start button click
    startButtonBg.on("pointerdown", () => {
      if (this.onStartCallback) {
        this.onStartCallback(this.selectedDifficulty);
      }
    });
  }

  public onStart(callback: (difficulty: Difficulty) => void) {
    this.onStartCallback = callback;
  }
}
