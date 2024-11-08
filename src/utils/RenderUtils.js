export class RenderUtils {
    static drawText(ctx, options) {
        const { text, x, y, font, color, align = 'left', baseline = 'middle' } = options;
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }

    static roundRect(ctx, x, y, width, height, radius) {
        if (radius > width/2 || radius > height/2) {
            radius = Math.min(width/2, height/2);
        }
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        return ctx; // Return context for chaining
    }
}
