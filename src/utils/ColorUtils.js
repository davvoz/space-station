export class ColorUtils {
    static createGradient(ctx, x, y, width, height, colors) {
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        return gradient;
    }

    static createRadialGradient(ctx, centerX, centerY, radius, colors) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        return gradient;
    }
}
