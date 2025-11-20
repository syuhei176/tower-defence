import { Application, Container, Graphics, Text } from "pixi.js";
import PF from "pathfinding";
import { CELL_SIZE, GRID_HEIGHT, GRID_WIDTH } from "../constant";

type CellType = 0 | 1; // 0: 空き, 1: タワー

class Tower {
  x: number;
  y: number;
  hp: number = 10;
  maxHp: number = 10;
  level: number = 1;
  damage: number = 1;
  range: number = 3;
  attackInterval: number = 30;
  lastAttackFrame: number = 0;
  barBg: Graphics;
  bar: Graphics;
  levelText: Text;
  graphics: Graphics;
  scene: GameScene;

  constructor(x: number, y: number, initialHp: number, scene: GameScene) {
    this.x = x;
    this.y = y;
    this.hp = initialHp;
    this.maxHp = initialHp;
    this.scene = scene;

    const px = x * CELL_SIZE;
    const py = y * CELL_SIZE;

    this.graphics = new Graphics();
    this.updateVisual();
    scene.addChild(this.graphics);

    this.barBg = new Graphics();
    this.barBg.beginFill(0x333333);
    this.barBg.drawRect(0, 0, CELL_SIZE, 4);
    this.barBg.endFill();
    this.barBg.x = px;
    this.barBg.y = py - 6;

    this.bar = new Graphics();
    this.bar.beginFill(0x00ccff);
    this.bar.drawRect(0, 0, CELL_SIZE, 4);
    this.bar.endFill();
    this.bar.x = px;
    this.bar.y = py - 6;

    this.levelText = new Text({
      text: `Lv${this.level}`,
      style: {
        fontFamily: "Arial",
        fontSize: "12px",
        fill: "#ffffff",
      },
    });
    this.levelText.anchor.set(0.5);
    this.levelText.x = px + CELL_SIZE / 2;
    this.levelText.y = py + CELL_SIZE / 2;

    scene.addChild(this.barBg);
    scene.addChild(this.bar);
    scene.addChild(this.levelText);
  }

  updateVisual() {
    this.graphics.clear();
    const colors = [0x00ccff, 0x00ff88, 0xff8800, 0xff00ff];
    const color = colors[Math.min(this.level - 1, colors.length - 1)];
    this.graphics.beginFill(color);
    this.graphics.drawRect(
      this.x * CELL_SIZE,
      this.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
    );
    this.graphics.endFill();
  }

  getUpgradeCost(): number {
    const costs = [0, 30, 50, 100];
    return costs[this.level] || 0;
  }

  canUpgrade(): boolean {
    return this.level < 4;
  }

  upgrade(): boolean {
    if (!this.canUpgrade()) return false;

    const cost = this.getUpgradeCost();
    if (this.scene.getMoney() < cost) return false;

    this.scene.addMoney(-cost);
    this.level++;

    switch (this.level) {
      case 2:
        this.damage = 2;
        this.range = 3.5;
        this.attackInterval = 25;
        break;
      case 3:
        this.damage = 3;
        this.range = 4;
        this.attackInterval = 20;
        break;
      case 4:
        this.damage = 5;
        this.range = 5;
        this.attackInterval = 15;
        break;
    }

    this.updateVisual();
    this.levelText.text = `Lv${this.level}`;
    return true;
  }

  updateBar() {
    const hpRatio = this.hp / this.maxHp;
    this.bar.scale.x = hpRatio;
  }

  takeDamage(dmg: number) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.scene.destroyTower(this.x, this.y);
    } else {
      this.updateBar();
    }
  }

  destroy() {
    this.scene.removeChild(this.bar);
    this.scene.removeChild(this.barBg);
    this.scene.removeChild(this.levelText);
    this.scene.removeChild(this.graphics);
  }
}

class Enemy {
  x = GRID_WIDTH - 1;
  y = 0;
  sprite = new Graphics();
  hpBarBg = new Graphics();
  hpBar = new Graphics();
  path: number[][] = [];
  pathIndex = 0;
  hp = 10;
  maxHp = 10;
  attackTurn = false;
  isRemoved = false;
  scene: GameScene;

  constructor(initialHp: number, scene: GameScene) {
    this.hp = initialHp;
    this.maxHp = initialHp;
    this.scene = scene;

    this.sprite.beginFill(0xff0000);
    this.sprite.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
    this.sprite.endFill();
    scene.addChild(this.sprite);

    this.hpBarBg.beginFill(0x550000);
    this.hpBarBg.drawRect(0, 0, CELL_SIZE, 4);
    this.hpBarBg.endFill();
    scene.addChild(this.hpBarBg);

    this.hpBar.beginFill(0x00ff00);
    this.hpBar.drawRect(0, 0, CELL_SIZE, 4);
    this.hpBar.endFill();
    scene.addChild(this.hpBar);

    this.updatePath();
    this.updatePosition();
  }

  updatePath() {
    this.path = this.scene.findPath(this.x, this.y, 0, GRID_HEIGHT - 1);
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
    if (this.checkAndAttackTower()) return;

    if (this.pathIndex < this.path.length - 1) {
      this.pathIndex++;
      [this.x, this.y] = this.path[this.pathIndex];
      this.updatePosition();
    }

    if (this.x === 0 && this.y === GRID_HEIGHT - 1) {
      this.scene.addLife(-1);
      this.destroy();

      if (this.scene.getLife() <= 0) {
        this.scene.gameOver();
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
    if (this.isRemoved) return;
    this.scene.removeChild(this.sprite);
    this.scene.removeChild(this.hpBar);
    this.scene.removeChild(this.hpBarBg);
    this.isRemoved = true;

    this.scene.incrementEnemyStats();
    this.scene.addMoney(11);
  }

  checkAndAttackTower(): boolean {
    if (!this.attackTurn) {
      this.attackTurn = true;
      return false;
    }
    this.attackTurn = false;

    const towers = this.scene.getTowers();
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const tower = towers[y][x];
        if (tower) {
          const dx = tower.x - this.x;
          const dy = tower.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= this.scene.getEnemyAttackRange()) {
            this.scene.addEnemyProjectile(
              new EnemyProjectile(this.x, this.y, tower, this.scene),
            );
            return true;
          }
        }
      }
    }
    return false;
  }
}

class Projectile {
  sprite = new Graphics();
  x: number;
  y: number;
  target: Enemy;
  speed = 4;
  damage: number;
  scene: GameScene;

  constructor(
    fromX: number,
    fromY: number,
    target: Enemy,
    damage: number,
    scene: GameScene,
  ) {
    this.x = fromX;
    this.y = fromY;
    this.target = target;
    this.damage = damage;
    this.scene = scene;

    this.sprite.beginFill(0xffff00);
    this.sprite.drawCircle(0, 0, 4);
    this.sprite.endFill();
    scene.addChild(this.sprite);
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
      this.target.takeDamage(this.damage);
      this.destroy();
      return false;
    }

    this.x += (dx / dist) * (this.speed / CELL_SIZE);
    this.y += (dy / dist) * (this.speed / CELL_SIZE);
    this.updatePosition();
    return true;
  }

  destroy() {
    this.scene.removeChild(this.sprite);
    this.scene.removeProjectile(this);
  }
}

class EnemyProjectile {
  sprite = new Graphics();
  x: number;
  y: number;
  target: Tower;
  speed = 4;
  scene: GameScene;

  constructor(fromX: number, fromY: number, target: Tower, scene: GameScene) {
    this.x = fromX;
    this.y = fromY;
    this.target = target;
    this.scene = scene;

    this.sprite.beginFill(0xff6600);
    this.sprite.drawCircle(0, 0, 4);
    this.sprite.endFill();
    scene.addChild(this.sprite);
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
      return false;
    }

    this.x += (dx / dist) * (this.speed / CELL_SIZE);
    this.y += (dy / dist) * (this.speed / CELL_SIZE);
    this.updatePosition();
    return true;
  }

  destroy() {
    this.scene.removeChild(this.sprite);
    this.scene.removeEnemyProjectile(this);
  }
}

export class GameScene extends Container {
  private app: Application;
  private money = 100;
  private life = 10;
  private towerCost = 25;
  private ENEMY_ATTACK_RANGE = 4;
  private initialHp = 15;
  private initialTowerHp = 20;
  private defeatedEnemies = 0;
  private readonly ENEMIES_TO_WIN = 100;

  private grid: CellType[][];
  private graphics: Graphics;
  private enemies: Enemy[] = [];
  private spawnCounter = 0;
  private towerAttackCounter = 0;
  private projectiles: Projectile[] = [];
  private enemyProjectiles: EnemyProjectile[] = [];
  private towers: (Tower | null)[][];
  private uiText: Text;

  constructor(app: Application, initialMoney: number = 100) {
    super();
    this.app = app;
    this.money = initialMoney;

    this.grid = Array.from({ length: GRID_HEIGHT }, () =>
      Array.from({ length: GRID_WIDTH }, () => 0),
    );

    this.towers = Array.from({ length: GRID_HEIGHT }, () =>
      Array.from({ length: GRID_WIDTH }, () => null),
    );

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    // UI Text
    this.uiText = new Text({
      text: `💰 ${this.money}　❤️ ${this.life}　🏆 ${this.defeatedEnemies}/${this.ENEMIES_TO_WIN}`,
      style: {
        fontFamily: "Arial",
        fontSize: "18px",
        fill: "#ffffff",
      },
    });
    this.uiText.x = 10;
    this.uiText.y = 10;
    this.addChild(this.uiText);

    this.drawGrid();
    this.setupInteraction();
  }

  // Public methods for inner classes
  public getMoney(): number {
    return this.money;
  }
  public getLife(): number {
    return this.life;
  }
  public getEnemyAttackRange(): number {
    return this.ENEMY_ATTACK_RANGE;
  }
  public getTowers(): (Tower | null)[][] {
    return this.towers;
  }

  public addMoney(amount: number) {
    this.money += amount;
    this.updateUI();
  }

  public addLife(amount: number) {
    this.life += amount;
    this.updateUI();
  }

  public incrementEnemyStats() {
    this.defeatedEnemies++;
    this.updateUI();

    // Check for game clear
    if (this.defeatedEnemies >= this.ENEMIES_TO_WIN) {
      this.gameClear();
      return;
    }

    // Gradually increase enemy HP every 5 defeats
    if (this.defeatedEnemies % 5 === 0) {
      this.initialHp += 2;
    }

    // Gradually increase tower HP
    if (this.initialTowerHp < 40) {
      this.initialTowerHp += 1;
    }
  }

  public addEnemyProjectile(projectile: EnemyProjectile) {
    this.enemyProjectiles.push(projectile);
  }

  public removeProjectile(projectile: Projectile) {
    const index = this.projectiles.indexOf(projectile);
    if (index > -1) {
      this.projectiles.splice(index, 1);
    }
  }

  public removeEnemyProjectile(projectile: EnemyProjectile) {
    const index = this.enemyProjectiles.indexOf(projectile);
    if (index > -1) {
      this.enemyProjectiles.splice(index, 1);
    }
  }

  private createPFGrid(): PF.Grid {
    const matrix = this.grid.map((row) =>
      row.map((cell) => (cell === 0 ? 0 : 1)),
    );
    return new PF.Grid(matrix);
  }

  public findPath(
    startX: number,
    startY: number,
    goalX: number,
    goalY: number,
  ): number[][] {
    const finder = new PF.AStarFinder({});
    const pfGrid = this.createPFGrid();
    return finder.findPath(startX, startY, goalX, goalY, pfGrid);
  }

  private updateUI() {
    this.uiText.text = `💰 ${this.money}　❤️ ${this.life}　🏆 ${this.defeatedEnemies}/${this.ENEMIES_TO_WIN}`;
  }

  public destroyTower(x: number, y: number) {
    const tower = this.towers[y][x];
    if (tower) {
      tower.destroy();
      this.towers[y][x] = null;
    }
    this.grid[y][x] = 0;
    this.drawGrid();
  }

  public gameOver() {
    const text = new Text({
      text: "Game Over",
      style: {
        fontFamily: "Arial",
        fontSize: "48px",
        fill: "#ff4444",
      },
    });
    text.anchor.set(0.5);
    text.x = (CELL_SIZE * GRID_WIDTH) / 2;
    text.y = (CELL_SIZE * GRID_HEIGHT) / 2;
    this.addChild(text);

    this.app.ticker.stop();
  }

  public gameClear() {
    const text = new Text({
      text: "GAME CLEAR!",
      style: {
        fontFamily: "Arial",
        fontSize: "48px",
        fill: "#00ff88",
      },
    });
    text.anchor.set(0.5);
    text.x = (CELL_SIZE * GRID_WIDTH) / 2;
    text.y = (CELL_SIZE * GRID_HEIGHT) / 2;
    this.addChild(text);

    const subText = new Text({
      text: `You defeated ${this.defeatedEnemies} enemies!`,
      style: {
        fontFamily: "Arial",
        fontSize: "24px",
        fill: "#ffffff",
      },
    });
    subText.anchor.set(0.5);
    subText.x = (CELL_SIZE * GRID_WIDTH) / 2;
    subText.y = (CELL_SIZE * GRID_HEIGHT) / 2 + 60;
    this.addChild(subText);

    this.app.ticker.stop();
  }

  private drawGrid() {
    this.graphics.clear();

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        this.graphics.beginFill(0x333333);
        this.graphics.lineStyle(1, 0x444444);
        this.graphics.drawRect(
          x * CELL_SIZE,
          y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE,
        );
        this.graphics.endFill();
      }
    }
  }

  private setupInteraction() {
    this.app.canvas.addEventListener("pointerdown", (e: PointerEvent) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const scaleX = (CELL_SIZE * GRID_WIDTH) / rect.width;
      const scaleY = (CELL_SIZE * GRID_HEIGHT) / rect.height;
      const x = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_SIZE);
      const y = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_SIZE);

      const existingTower = this.towers[y]?.[x];
      if (existingTower) {
        const success = existingTower.upgrade();
        if (!success && existingTower.canUpgrade()) {
          console.log(
            `Need ${existingTower.getUpgradeCost()} money to upgrade (have ${this.money})`,
          );
        } else if (!success) {
          console.log("Tower is already max level!");
        }
      } else if (this.grid[y]?.[x] === 0 && this.money >= this.towerCost) {
        this.grid[y][x] = 1;
        this.towers[y][x] = new Tower(x, y, this.initialTowerHp, this);
        this.money -= this.towerCost;
        this.drawGrid();
        this.updateUI();

        for (const enemy of this.enemies) {
          enemy.updatePath();
        }
      }
    });
  }

  public start() {
    this.app.ticker.add(() => {
      this.spawnCounter++;
      this.towerAttackCounter++;

      if (this.spawnCounter % 180 === 0) {
        const enemy = new Enemy(this.initialHp, this);
        this.enemies.push(enemy);
      }

      if (this.spawnCounter % 45 === 0) {
        for (const enemy of this.enemies) {
          enemy.move();
        }

        this.enemies = this.enemies.filter((enemy) => !enemy.isRemoved);
      }

      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const tower = this.towers[y][x];
          if (tower) {
            if (
              this.towerAttackCounter - tower.lastAttackFrame >=
              tower.attackInterval
            ) {
              for (const enemy of this.enemies) {
                const dx = enemy.x - x;
                const dy = enemy.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= tower.range) {
                  this.projectiles.push(
                    new Projectile(x, y, enemy, tower.damage, this),
                  );
                  tower.lastAttackFrame = this.towerAttackCounter;
                  break;
                }
              }
            }
          }
        }
      }

      for (const p of [...this.projectiles]) {
        p.update();
      }

      for (const p of [...this.enemyProjectiles]) {
        p.update();
      }
    });
  }
}
