import './global.css';
import Renderer2D from './Renderer2D';

function ToRadian(degrees: number) {
    return (degrees * Math.PI) / 180;
}

function FormatTimeToString(timerInMS: number) {
    const ms = Math.floor(timerInMS % 1000);
    const sec = Math.floor((timerInMS / 1000) % 60);
    const min = Math.floor((timerInMS / 1000) / 60);
    let msString = `${ms}`;
    let secString = `${sec}`;
    let minString = `${min}`;
    if (ms < 10) msString = `00${msString}`;
    else if (ms < 100) msString = `0${msString}`;
    if (sec < 10) secString = `0${secString}`;
    if (min < 10) minString = `0${minString}`;
    return `${minString}:${secString}:${msString}`;
}

abstract class Object {
    protected _x: number;
    protected _y: number;
    protected _size: number = 50; // veličina objekta
    protected _speed: number = 5; // brzina objekta

    // Postavi poziciju objekta
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public abstract Update(): void;
    public abstract Render(r2d: Renderer2D): void;

    // Za AABB koliziju (svi moji objekti su slozeni da im je pozicija centar pravokutnika pa se i za to treba uracunati)
    public Left() { return this._x - (this._size / 2); }
    public Right() { return this._x + (this._size / 2); }
    public Top() { return this._y - (this._size / 2); }
    public Bottom() { return this._y + (this._size / 2) }

    // http://kishimotostudios.com/articles/aabb_collision/
    public Collides(B: Object): boolean {
        const AisToTheRightOfB = this.Left() > B.Right();
        const AisToTheLeftOfB = this.Right() < B.Left();
        const AisAboveB = this.Bottom() < B.Top();
        const AisBelowB = this.Top() > B.Bottom();
        return !(AisToTheRightOfB
            || AisToTheLeftOfB
            || AisAboveB
            || AisBelowB);
    }
}

class Player extends Object {
    private _playerColour: string = 'red';
    private _pressedKeys: [boolean, boolean, boolean, boolean] = [false, false, false, false]; // 0 - left, 1 - up, 2 - right, 3 - down

    constructor(x: number, y: number) {
        super(x, y);

        // Veličina i brzina igrača
        this._size = 50;
        this._speed = 5;

        // Postavi listener za tipke odnosno pomicanje igrača
        // Potrebni su dva listenera (dok je tipka dolje i dok je puštena) jer inače dvije tipke odjednom pritisnute se ne očitavaju
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'a' || ev.key === 'ArrowLeft') {
                this._pressedKeys[0] = true;
            }
            else if (ev.key === 'd' || ev.key === 'ArrowRight') {
                this._pressedKeys[2] = true;
            }
            else if (ev.key === 'w' || ev.key === 'ArrowUp') {
                this._pressedKeys[1] = true;
            }
            else if (ev.key === 's' || ev.key === 'ArrowDown') {
                this._pressedKeys[3] = true;
            }
        });
        document.addEventListener('keyup', (ev) => {
            if (ev.key === 'a' || ev.key === 'ArrowLeft') {
                this._pressedKeys[0] = false;
            }
            else if (ev.key === 'd' || ev.key === 'ArrowRight') {
                this._pressedKeys[2] = false;
            }
            else if (ev.key === 'w' || ev.key === 'ArrowUp') {
                this._pressedKeys[1] = false;
            }
            else if (ev.key === 's' || ev.key === 'ArrowDown') {
                this._pressedKeys[3] = false;
            }
        });
    }

    public Update(): void {
        // Pomakni igrača s obzirom da pritisnute tipke
        if (this._pressedKeys[0]) this._x -= this._speed;
        if (this._pressedKeys[1]) this._y -= this._speed;
        if (this._pressedKeys[2]) this._x += this._speed;
        if (this._pressedKeys[3]) this._y += this._speed;
    }

    public Render(r2d: Renderer2D): void {
        // Nacrtaj igrača na njegovoj poziciji s time da želimo da centar pravokutnika bude njegova pozicija
        r2d.DrawFillRectWithShadow(this._x - (this._size / 2), this._y - (this._size / 2), this._size, this._size, this._playerColour, 'black', 20);
    }
}

class Asteroid extends Object {
    private _directionX: number; // jedinični vektor za pomak na x osi
    private _directionY: number; // jedinični vektor za pomak na y osi

    constructor(x: number, y: number) {
        super(x, y);

        this._size = Math.floor(Math.random() * 80 + 20); // nasumično generirana veličina asteroida

        // Izaberi random jedinicni vectora za smjer u kojem se bude asteroid kretal
        const randomAngle = Math.random() * 360;
        this._directionX = Math.cos(ToRadian(randomAngle));
        this._directionY = Math.sin(ToRadian(randomAngle));

        // Izaberi random brzinu za asteroida
        this._speed = Math.random() * 5;
    }

    public Update(): void {
        // Pomakni asteroida u njegovom smjeru
        this._x += this._directionX * this._speed;
        this._y += this._directionY * this._speed;

        // TODO Limitiraj me u canvasu
    }
    public Render(r2d: Renderer2D): void {
        // Nacrtaj asteroida
        r2d.DrawFillRectWithShadowAndBorder(this._x - (this._size / 2), this._y - (this._size / 2), this._size, this._size, 'grey', 'black', 20, 'black', 1);
    }

    public IsOutOfBounds(maxDistanceFromCenterOfCanvas: number, canvasCenterX: number, canvasCenterY: number) {
        const distanceFromCenter = Math.sqrt(Math.pow(this._x - canvasCenterX, 2) + Math.pow(this._y - canvasCenterY, 2));
        return distanceFromCenter > maxDistanceFromCenterOfCanvas;
    }
}

class Game {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _animationFrameId: number | undefined;

    private _asteroids: Asteroid[] = [];
    private _maxAsteroids: number = 10;
    private _asteroidSpawnDelay: number = 5;
    private _asteroidSpawnDelayIntervalId: number | undefined;
    private _player!: Player;

    private _timer: number = 0;
    private _oldTime: number = Date.now();

    private _done: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;

        this.InitialiseGame();
    }

    private InitialiseGame() {
        // Igrač je na početku u centru ekrana
        this._player = new Player(this._canvas.width / 2, this._canvas.height / 2);

        // Makni sve stare asteroide
        this._asteroids = [];

        // Stvori astroide na nasumičnim pozicijama izvan ekrana
        for (let i = 0; i < this._maxAsteroids; i++) {
            this.SpawnAsteroid();
        }

        // Resetiraj timer
        this._timer = 0;

        // Makni prijasnji interval ako postoji
        if (this._asteroidSpawnDelayIntervalId) clearInterval(this._asteroidSpawnDelayIntervalId);
        // Postavi interval stvaranja asteroida, mozemo stvoriti ako nemamo maks broj
        this._asteroidSpawnDelayIntervalId = setInterval(() => this._asteroids.length < this._maxAsteroids ? this.SpawnAsteroid() : undefined, 1000 * this._asteroidSpawnDelay);
    }

    public Start() {
        if (this._animationFrameId) return; // igra je već započeta prvo ju treba zaustaviti
        this._animationFrameId = requestAnimationFrame(() => this.Loop());
        this._done = false;
    }

    public Stop() {
        if (!this._animationFrameId) return; // igra nije započeta treba ju prvo zapoečeti
        cancelAnimationFrame(this._animationFrameId);
        this._done = true;
    }

    private SpawnAsteroid() {
        // TODO Stvori asteroida izvan canvasa
        const randomX = Math.floor(Math.random() * this._canvas.width);
        const randomY = Math.floor(Math.random() * this._canvas.height);
        this._asteroids.push(new Asteroid(randomX, randomY));
    }

    // Mjenjanje pozicije / collision / stvaranje asteroida
    private Update() {
        this._player.Update();
        for (const asteroid of this._asteroids) {
            asteroid.Update();
        }

        // Provjeri koliziju igrača sa asteroidima
        for (const asteroid of this._asteroids) {
            if (this._player.Collides(asteroid)) {
                // Igra je gotova odnosno korisnik je izgubio
                this._done = true;
                console.log("kolizija");
                // Spremi highscore ako je
                const currentHighscore = localStorage.getItem('highscore');
                if (!currentHighscore) { // Ako ne postoji highscore
                    localStorage.setItem('highscore', JSON.stringify(this._timer));
                } else { // Ako postoji
                    const current = Number.parseInt(currentHighscore);
                    if (current < this._timer) { // Ako je trenutni highscore lošiji od trenutnog vremena odnosno manji od trenutnog
                        localStorage.setItem('highscore', JSON.stringify(this._timer));
                    }
                    // U suprotnom ostavi trenutni highscore
                }
                return;
            }
        }

        // Provjeri ako je asteroid izašao iz ekrana i možemo ga obrisati
        const deleteAsteroids: Asteroid[] = [];
        for (const asteroid of this._asteroids) {
            const canvasCenterX = this._canvas.width / 2;
            const canvasCenterY = this._canvas.height / 2;
            if (asteroid.IsOutOfBounds(canvasCenterX + canvasCenterY, canvasCenterX, canvasCenterY)) {
                deleteAsteroids.push(asteroid);
            }
        }
        for (const asteroid of deleteAsteroids) {
            this._asteroids.splice(this._asteroids.indexOf(asteroid), 1);
        }
    }

    // Crtanje po canvasu
    private Render() {
        const r2d = new Renderer2D(this._ctx);

        r2d.Clear('#515151');

        this._player.Render(r2d);
        for (const asteroid of this._asteroids) {
            asteroid.Render(r2d);
        }

        // Ispiši trenutni broj asteroida
        this._ctx.textAlign = 'start'; // default vrijednost
        this._ctx.textBaseline = 'middle'; // pozicija teksta ovisi o y centru teksta
        r2d.DrawFillText(`Asteroids: ${this._asteroids.length}`, 32, 32, 32);

        // Ispiši trenutni timer i najbolje vrijeme
        this._ctx.textAlign = 'right'; // tekst se nalazi ljevo od zadane pozicije
        r2d.DrawFillText(`Najbolje vrijeme: ${localStorage.getItem('highscore') ? FormatTimeToString(Number.parseInt(localStorage.getItem('highscore') as string)) : 'N/A'}`, r2d.Width() - 32, 32, 32);
        r2d.DrawFillText(`Vrijeme: ${FormatTimeToString(this._timer)}`, r2d.Width() - 32, 80, 32);
    }

    private Loop() {
        // Izracunaj deltaTime (setInterval ne može raditi na 1ms, saznal na teži način)
        const currentTime = Date.now();
        const deltaTime = currentTime - this._oldTime;
        this._timer += deltaTime; // dodaj vrijeme prjeđeno u timer
        this._oldTime = currentTime;

        this.Update();
        this.Render();

        if (this._done) this.Stop(); // Ako je igra zavrsila zaustavi
        else this._animationFrameId = requestAnimationFrame(() => this.Loop()); // u suprotnom nastavi petlju igre
    }
}

// Kada se učita DOM
window.onload = function () {
    function fullscreenCanvas(canvas: HTMLCanvasElement) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Dohvati canvas element unutra body
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    // Postavi fullscreen canvas i promijeni ako se velicina prozora mijenja
    fullscreenCanvas(canvas);
    window.onresize = () => fullscreenCanvas(canvas);

    const game = new Game(canvas);
    game.Start();
}
