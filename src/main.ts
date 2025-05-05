import { Application, Graphics, Text } from 'pixi.js';
import PF from 'pathfinding';
import { CELL_SIZE, GRID_HEIGHT, GRID_WIDTH } from './constant';

type CellType = 0 | 1; // 0: 空き, 1: タワー

let money = 100;
let life = 10;
const towerCost = 20;

const grid: CellType[][] = Array.from({ length: GRID_HEIGHT }, () =>
  Array.from({ length: GRID_WIDTH }, () => 0)
);

const app = new Application();
await app.init({
  width: CELL_SIZE * GRID_WIDTH,
  height: CELL_SIZE * GRID_HEIGHT,
  backgroundColor: 0x222222,
});
document.body.appendChild(app.canvas);

const graphics = new Graphics();
app.stage.addChild(graphics);

// Pathfinding用のグリッド作成関数
function createPFGrid(): PF.Grid {
  const matrix = grid.map(row => row.map(cell => (cell === 0 ? 0 : 1)));
  return new PF.Grid(matrix);
}

function findPath(startX: number, startY: number, goalX: number, goalY: number): [number, number][] {
  const finder = new PF.AStarFinder({ allowDiagonal: false });
  const pfGrid = createPFGrid();
  return finder.findPath(startX, startY, goalX, goalY, pfGrid);
}

const enemies: Enemy[] = [];
let spawnCounter = 0;
let towerAttackCounter = 0;
const projectiles: Projectile[] = [];

function gameOver() {
  const text = new Text({
    text: 'Game Over',
    style: {
      fontFamily: 'Arial',
      fontSize: "48px",
      fill: '#ff4444',
    },
  });
  text.anchor.set(0.5);
  text.x = app.screen.width / 2;
  text.y = app.screen.height / 2;
  app.stage.addChild(text);

  app.ticker.stop(); // ゲーム停止
}

const uiText = new Text({
  text: `💰 ${money}　❤️ ${life}`,
  style: {
    fontFamily: 'Arial',
    fontSize: "18px",
    fill: '#ffffff',
  },
});
uiText.x = 10;
uiText.y = 10;
app.stage.addChild(uiText);

function updateUI() {
  uiText.text = `💰 ${money}　❤️ ${life}`;
}

class Projectile {
  sprite = new Graphics();
  x: number;
  y: number;
  target: Enemy;
  speed = 4;

  constructor(fromX: number, fromY: number, target: Enemy) {
    this.x = fromX;
    this.y = fromY;
    this.target = target;

    this.sprite.beginFill(0xffff00);
    this.sprite.drawCircle(0, 0, 4);
    this.sprite.endFill();
    app.stage.addChild(this.sprite);
    this.updatePosition();
  }

  updatePosition() {
    this.sprite.x = this.x * CELL_SIZE + CELL_SIZE / 2;
    this.sprite.y = this.y * CELL_SIZE + CELL_SIZE / 2;
  }

  update(): boolean {
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1) {
      this.target.takeDamage(1);
      this.destroy();
      return false; // 終了
    }

    this.x += (dx / dist) * (this.speed / CELL_SIZE);
    this.y += (dy / dist) * (this.speed / CELL_SIZE);
    this.updatePosition();
    return true;
  }

  destroy() {
    app.stage.removeChild(this.sprite);
    projectiles.splice(projectiles.indexOf(this), 1);

    // 💰 敵を倒した報酬
    money += 8;
    updateUI();
  }
}

// 敵クラス
class Enemy {
  x = GRID_WIDTH - 1;
  y = 0;
  sprite = new Graphics();
  hpBarBg = new Graphics();
  hpBar = new Graphics();
  path: [number, number][] = [];
  pathIndex = 0;
  hp = 3;
  maxHp = 3;

  constructor() {
    // 敵の本体
    this.sprite.beginFill(0xff0000);
    this.sprite.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
    this.sprite.endFill();
    app.stage.addChild(this.sprite);

    // HPバー背景
    this.hpBarBg.beginFill(0x550000);
    this.hpBarBg.drawRect(0, 0, CELL_SIZE, 4);
    this.hpBarBg.endFill();
    app.stage.addChild(this.hpBarBg);

    // HPバー本体
    this.hpBar.beginFill(0x00ff00);
    this.hpBar.drawRect(0, 0, CELL_SIZE, 4);
    this.hpBar.endFill();
    app.stage.addChild(this.hpBar);

    this.updatePath();
    this.updatePosition();
  }

  updatePath() {
    this.path = findPath(this.x, this.y, 0, GRID_HEIGHT - 1);
    this.pathIndex = 0;
  }

  updatePosition() {
    const px = this.x * CELL_SIZE;
    const py = this.y * CELL_SIZE;
    this.sprite.x = px;
    this.sprite.y = py;

    this.hpBarBg.x = px;
    this.hpBarBg.y = py - 6;

    this.hpBar.x = px;
    this.hpBar.y = py - 6;

    const hpRatio = this.hp / this.maxHp;
    this.hpBar.scale.x = hpRatio;
  }

  move() {
    if (this.pathIndex < this.path.length - 1) {
      this.pathIndex++;
      [this.x, this.y] = this.path[this.pathIndex];
      this.updatePosition();
    }
  
    // ゴール地点チェック
    if (this.x === 0 && this.y === GRID_HEIGHT - 1) {
      life--;
      updateUI();
      this.destroy();
  
      if (life <= 0) {
        gameOver();
      }
    }
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.destroy();
    } else {
      this.updatePosition();
    }
  }

  destroy() {
    app.stage.removeChild(this.sprite);
    app.stage.removeChild(this.hpBar);
    app.stage.removeChild(this.hpBarBg);
    enemies.splice(enemies.indexOf(this), 1);
  }
}


// タワー設置（クリック）
app.canvas.addEventListener('pointerdown', (e) => {
  const rect = app.canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  if (grid[y]?.[x] === 0 && money >= towerCost) {
    grid[y][x] = 1;
    money -= towerCost;
    drawGrid();
    updateUI();

    // 全敵の経路を再探索
    for (const enemy of enemies) {
      enemy.updatePath();
    }
  }
});

// グリッドとタワー描画
function drawGrid() {
  graphics.clear();


  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      console.log(grid[y][x]);

      if (grid[y][x] === 1) {
        graphics.beginFill(0x00ccff);
        graphics.drawRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        graphics.endFill();
      } else {
        graphics.beginFill(0x333333);
        graphics.lineStyle(1, 0x444444);
        graphics.drawRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        graphics.endFill();
      }
    }
  }
}

drawGrid();

const TOWER_ATTACK_INTERVAL = 30;
const TOWER_RANGE = 3;


// メインループ
app.ticker.add(() => {
  spawnCounter++;
  towerAttackCounter++;

  if (spawnCounter % 180 === 0) {
    const enemy = new Enemy();
    enemies.push(enemy);
  }

  if (spawnCounter % 30 === 0) {
    for (const enemy of enemies) {
      enemy.move();
    }
  }

  // 🔫 タワーからの攻撃処理
  if (towerAttackCounter % TOWER_ATTACK_INTERVAL === 0) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] === 1) {
          for (const enemy of enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= TOWER_RANGE) {
              // 弾を発射（同一タワーは1回攻撃）
              projectiles.push(new Projectile(x, y, enemy));
              break;
            }
          }
        }
      }
    }
  }

  // 弾の移動処理
  for (const p of [...projectiles]) {
    p.update();
  }
});