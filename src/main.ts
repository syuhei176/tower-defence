import { Application } from "pixi.js";
import { GRID_HEIGHT, GRID_WIDTH } from "./constant";
import { TitleScene } from "./scenes/TitleScene";
import { GameScene } from "./scenes/GameScene";

async function main() {
  // Calculate responsive canvas size
  const maxWidth = 1200;
  const maxHeight = 900;
  const gameAspectRatio = GRID_WIDTH / GRID_HEIGHT;

  function calculateSize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    let width, height;

    if (windowAspectRatio > gameAspectRatio) {
      // Window is wider than game - fit to height
      height = Math.min(windowHeight, maxHeight);
      width = height * gameAspectRatio;
    } else {
      // Window is taller than game - fit to width
      width = Math.min(windowWidth, maxWidth);
      height = width / gameAspectRatio;
    }

    return { width, height };
  }

  const initialSize = calculateSize();

  const app = new Application();
  await app.init({
    width: initialSize.width,
    height: initialSize.height,
    backgroundColor: 0x222222,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.canvas);

  // Handle window resize
  const handleResize = () => {
    const size = calculateSize();
    app.renderer.resize(size.width, size.height);
  };

  window.addEventListener("resize", handleResize);

  // Prevent double-tap zoom on mobile devices
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false },
  );

  // Scene management
  let currentScene: TitleScene | GameScene | null = null;

  function switchScene(newScene: TitleScene | GameScene) {
    if (currentScene) {
      app.stage.removeChild(currentScene);
    }
    currentScene = newScene;
    app.stage.addChild(currentScene);
  }

  // Show title scene
  const titleScene = new TitleScene(app);
  titleScene.onStart((difficulty) => {
    // Start game with selected difficulty
    let initialMoney = 100;
    switch (difficulty) {
      case "easy":
        initialMoney = 150;
        break;
      case "normal":
        initialMoney = 100;
        break;
      case "hard":
        initialMoney = 75;
        break;
    }

    const gameScene = new GameScene(app, initialMoney);
    switchScene(gameScene);
    gameScene.start();
  });
  switchScene(titleScene);
}

main();
