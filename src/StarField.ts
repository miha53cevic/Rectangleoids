// Jedan stari vlastiti projekt prije nekoliko godina za stvaranje hyper drive doživljaja
// Nadam se da nije problem iskoristiti vlasitit stari kod za dodatnu funkcionalnost :) odnosno pozadinu igre
import Renderer2D from "./Renderer2D";

// https://github.com/miha53cevic/WebApps/blob/master/StarFieldJS/StarField.js
// Pregled kako izgleda
// https://miha53cevic.github.io/WebApps/StarFieldJS/index.html
class Star {
    public x: number;
    public y: number;
    public z: number;
    public oldX: number;
    public oldY: number;
    private r2d: Renderer2D;

    constructor(r2d: Renderer2D) {
        this.r2d = r2d;

        // X, Y are positions on the screen
        // Z is the radius of the star or the DEPTH
        this.x = 0;
        this.y = 0;
        this.z = 0;
        
        // Keeps track of the last position after updating it
        this.oldX = 0;
        this.oldY = 0;
        
        // Get random starting positions
        this.resetStar();
    }
    
    resetStar() {
        // Set random starting position and make sure it isn't in the middle of the screen
        // because later if the position is on the middle of the screen that means it is
        // 0, 0 in the normal coordinate system and multiplying it won't move it and it will
        // be stuck in the middle of the screen
        do {
        
            this.x = Math.floor(Math.random() * this.r2d.Width());
            this.y = Math.floor(Math.random() * this.r2d.Height());
        
        } while (this.x == this.r2d.Width() / 2 && this.y == this.r2d.Height() / 2);
        
        // Set starting DEPTH / RADIUS
        this.z = 1;
        
        // On reset the old positions are the same as the current
        this.oldX = this.x;
        this.oldY = this.y;
    }
    
    update(fSpeed: number) {
        // Translate to the normal coordinate system aka move the coordinate system
        // so that 0, 0 is in the middle of the screen
        // Multiply it by a speed factor, this will move the point towards the edge
        // of the coordinate system if the middle is 0,0
        // Afterwards translate it back to our coordinate system middle(WIDTH / 2, HEIGHT / 2)
        const newX = (this.x - (this.r2d.Width() / 2)) * fSpeed + (this.r2d.Width() / 2);
        const newY = (this.y - (this.r2d.Height() / 2)) * fSpeed + (this.r2d.Height() / 2);
        
        // Save old positions
        this.oldX = this.x;
        this.oldY = this.y;
        
        // Update old coordinates to the new ones
        this.x = newX;
        this.y = newY;
        this.z += 0.01;
        
        // Draw the star
        //drawArc(newX, newY, this.z, 0, 2 * Math.PI);
        this.r2d.Line(this.oldX, this.oldY, newX, newY);
        
        // If the star is out of bounds of the screen reset it
        if (newX < 0 || newX >= this.r2d.Width() || newY < 0 || newY >= this.r2d.Height()) {
            this.resetStar();
        }
    }
}

class StarField {
    public starCount: number;
    public fSpeed: number;
    public stars: Star[];
    private r2d: Renderer2D;

    constructor(starCount = 100, fSpeed = 1.01, r2d: Renderer2D) {
        this.r2d = r2d;

        this.starCount  = starCount;
        this.fSpeed     = fSpeed;

        // Create stars array
        this.stars = [];

        // Fill the array with stars
        for (let i = 0; i < starCount; i++) {
            this.stars.push(new Star(r2d));
        }
    }

    run() {
        // Clear screen
        this.r2d.Clear('#515151');
    
        // Iterate through every star and update and display it
        for (let star of this.stars) {
            star.update(this.fSpeed);
        }
    }
}

export default StarField;