import { SpaceStation } from '../../objects/SpaceStation.js';

export class EntityManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.entities = [];
    }

    update(deltaTime) {
        this.entities.forEach(entity => entity.update(deltaTime));
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
}
