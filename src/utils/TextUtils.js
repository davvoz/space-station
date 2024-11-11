export class TextUtils {
    static drawText(ctx, text, x, y, font, color, align = 'left', baseline = 'middle') {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }
}
