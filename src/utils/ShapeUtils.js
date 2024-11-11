export class ShapeUtils {
    static roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y + height, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
}
