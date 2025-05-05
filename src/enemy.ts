import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "./constant";
import { Graphics } from "pixi.js";

export class Enemy {
    x = GRID_WIDTH - 1;
    y = 0;
    sprite = new Graphics();
    path: [number, number][] = [];
    pathIndex = 0;
    hp = 3;
  
    constructor() {
      this.sprite.beginFill(0xff0000);
      this.sprite.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
      this.sprite.endFill();
      app.stage.addChild(this.sprite);
      this.updatePath();
    }
  
    updatePath() {
      this.path = findPath(this.x, this.y, 0, GRID_HEIGHT - 1);
      this.pathIndex = 0;
    }
  
    updatePosition() {
      this.sprite.x = this.x * CELL_SIZE;
      this.sprite.y = this.y * CELL_SIZE;
    }
  
    move() {
      if (this.pathIndex < this.path.length - 1) {
        this.pathIndex++;
        [this.x, this.y] = this.path[this.pathIndex];
        this.updatePosition();
      }
    }
  
    takeDamage(damage: number) {
      this.hp -= damage;
      if (this.hp <= 0) {
        this.destroy();
      }
    }
  
    destroy() {
      app.stage.removeChild(this.sprite);
      enemies.splice(enemies.indexOf(this), 1);
    }
  }