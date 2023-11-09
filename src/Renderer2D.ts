class Renderer2D {
    private _context2D: CanvasRenderingContext2D;

    constructor(context2D: CanvasRenderingContext2D) {
        this._context2D = context2D;
    }

    public Width() { return this._context2D.canvas.width; }
    public Height() { return this._context2D.canvas.height; }

    // Očisti pozadinu
    public Clear(colour = 'black') {
        this._context2D.fillStyle = colour;
        this._context2D.fillRect(0, 0, this.Width(), this.Height());
    }

    // Translatiraj kordinatni sustav
    public Translate(x: number, y: number) {
        this._context2D.translate(x, y);
    }

    // Rotiraj kordinantni sustav
    public Rotate(radians: number) {
        this._context2D.rotate(radians);
    }

    public ToRadian(degrees: number) {
        return (degrees * Math.PI) / 180;
    }

    // Spremi trenutnu transformaciju
    public Push() {
        this._context2D.save();
    }

    // Makni trenutnu transformaciju iz polja transformacija
    public Pop() {
        this._context2D.restore();
    }

    public ResetTransform() {
        this._context2D.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Nacrtaj liniju
    public Line(x1: number, y1: number, x2: number, y2: number, colour = 'white', width = 1) {
        this._context2D.strokeStyle = colour;
        this._context2D.lineWidth = width;

        this._context2D.beginPath();
        this._context2D.moveTo(x1, y1);
        this._context2D.lineTo(x2, y2);
        this._context2D.stroke();
    }

    // Nacrtaj pravokutnik
    public DrawFillRect(x: number, y: number, w: number, h: number, colour: string = 'white') {
        this._context2D.fillStyle = colour;
        this._context2D.fillRect(x, y, w, h);
    }

    // Nacrtaj pravokutnik s 3D sjenom
    public DrawFillRectWithShadow(x: number, y: number, w: number, h: number, colour: string = 'white', shadowColour: string = 'black', shadowBlur: number = 20) {
        this._context2D.shadowBlur = shadowBlur;
        this._context2D.shadowColor = shadowColour;
        this.DrawFillRect(x, y, w, h, colour);
    }

    // Nacrtaj pravokutnik s 3D sjenom i obrubom
    public DrawFillRectWithShadowAndBorder(x: number, y: number, w: number, h: number, colour: string = 'white', shadowColour: string = 'black', shadowBlur: number = 20, borderColour: string = 'black', borderWidth: number = 1) {
        // Nacrtaj obrub/border i 3D sjenu
        this.DrawFillRectWithShadow(x, y, w, h, borderColour, shadowColour, shadowBlur);

        // Nacrtaj preko trenutnog pravokutnika unutarnji dio tako da dobijemo obrub
        this.DrawFillRect(x + borderWidth, y + borderWidth, w - borderWidth, h - borderWidth, colour);
    }

    // Nacrtaj popunjen text na T(x, y)
    public DrawFillText(text: string, x: number, y: number, fontSize: number, colour: string = 'white', font: string = 'Arial') {
        this._context2D.font = fontSize + 'px ' + font;
        this._context2D.fillStyle = colour;
        this._context2D.fillText(text, x, y);
    }
}

export default Renderer2D;