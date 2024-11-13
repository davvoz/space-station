
export class SpatialGrid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = Array(this.cols).fill().map(() => Array(this.rows).fill().map(() => new Set()));
    }

    // Inserisce un'entità nella griglia
    insert(entity) {
        const cell = this.getCellCoords(entity);
        this.grid[cell.col][cell.row].add(entity);
    }

    // Rimuove un'entità dalla griglia
    remove(entity) {
        const cell = this.getCellCoords(entity);
        this.grid[cell.col][cell.row].delete(entity);
    }

    // Aggiorna la posizione di un'entità nella griglia
    update(entity, oldX, oldY) {
        const oldCell = this.getCellCoordsFromPos(oldX, oldY);
        const newCell = this.getCellCoords(entity);

        if (oldCell.col !== newCell.col || oldCell.row !== newCell.row) {
            this.grid[oldCell.col][oldCell.row].delete(entity);
            this.grid[newCell.col][newCell.row].add(entity);
        }
    }

    // Ottiene le entità potenzialmente collidenti
    getNearby(entity, range = 1) {
        const cell = this.getCellCoords(entity);
        const nearby = new Set();

        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                const col = cell.col + i;
                const row = cell.row + j;
                
                if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                    this.grid[col][row].forEach(other => {
                        if (other !== entity) {
                            nearby.add(other);
                        }
                    });
                }
            }
        }

        return nearby;
    }

    // Ottiene le coordinate della cella per una posizione
    getCellCoords(entity) {
        return {
            col: Math.min(Math.max(Math.floor(entity.x / this.cellSize), 0), this.cols - 1),
            row: Math.min(Math.max(Math.floor(entity.y / this.cellSize), 0), this.rows - 1)
        };
    }

    // Ottiene le coordinate della cella da x,y
    getCellCoordsFromPos(x, y) {
        return {
            col: Math.min(Math.max(Math.floor(x / this.cellSize), 0), this.cols - 1),
            row: Math.min(Math.max(Math.floor(y / this.cellSize), 0), this.rows - 1)
        };
    }

    // Pulisce la griglia
    clear() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j].clear();
            }
        }
    }
}