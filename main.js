kontra.init();
kontra.initKeys();

const ctx = kontra.getContext();
const can = kontra.getCanvas();

const world = {
    width: 10000,
    height: 10000
};

const viewport = {
    x: 0,
    y: 0,
    width: 800,
    height: 800
};

const numberOfStars = 10000;
const stars = new Array(numberOfStars);
for (let i = 0; i < numberOfStars; i++) {
    const x = Math.random() * world.width;
    const y = Math.random() * world.height;
    stars[i] = {x, y};
}

const numberOfPlanets = 10;
const planets = new Array(numberOfPlanets);
for (let i = 0; i < numberOfPlanets; i++) {
    const x = Math.random() * world.width;
    const y = Math.random() * world.height;
    const radius = Math.random() * (200 - 50) + 50;
    const mass = Math.random() * (20000 - 5000) + 5000;
    const color = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
    const render = function() {
        this.context.save();

        this.context.fillStyle = this.color;
        this.context.translate(this.x, this.y);

        this.context.beginPath();
        this.context.arc(0, 0, this.radius, 0, 2*Math.PI);
        this.context.fill();

        this.context.restore();
    };
    planets[i] = kontra.Sprite({x, y, radius, mass, color, render});
}

/*
const planet = kontra.Sprite({
    x: 2000,
    y: 2000,
    radius: 500,
    mass: 10000,
    horizon: 500,
    color: 'purple',
    render() {
        this.context.save();

        this.context.fillStyle = this.color;
        this.context.translate(this.x, this.y);

        this.context.beginPath();
        this.context.arc(0, 0, this.radius, 0, 2*Math.PI);
        this.context.fill();

        this.context.restore();
    }
});
*/

const ship = kontra.Sprite({
    x: 1000,
    y: 1000,
    width: 6,
    gravitateTowards(other) {
        const factor = other.mass / Math.pow(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2), 1.5);
        this.ddx += (other.x - this.x) * factor;
        this.ddy += (other.y - this.y) * factor;
    },
    update() {
        /*
        // gravitate towards planet
        const distance = Math.sqrt(Math.pow(planet.x - ship.x, 2), Math.pow(planet.y - ship.y, 2));
        if (distance < Infinity) {
            const factor = GRAVITATIONAL_CONSTANT * planet.mass / Math.pow(distance, 2);
            ship.ddx += (planet.x - ship.x) * factor;
            ship.ddy += (planet.y - ship.y) * factor;
        }
        */

        // update speed
        this.dx += this.ddx;
        this.dy += this.ddy;

        // limit speed
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (speed > 10) {
            this.dx *= 10 / speed;
            this.dy *= 10 / speed;
        }
        console.log(Math.sqrt(this.dx * this.dx + this.dy * this.dy));

        // update position
        this.x += this.dx;
        this.y += this.dy;

        // reset acceleration
        this.ddx = this.ddy = 0;
    },
    render() {
        this.context.save();

        this.context.strokeStyle = 'white';
        this.context.translate(this.x, this.y);
        this.context.rotate(this.rotation);

        this.context.beginPath();
        this.context.moveTo(-3, -5);
        this.context.lineTo(12, 0);
        this.context.lineTo(-3, 5);

        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }
});

const loop = kontra.GameLoop({
    update() {
        // update ship
        if (kontra.keyPressed('up')) {
            const x = 0.1 * Math.cos(ship.rotation);
            const y = 0.1 * Math.sin(ship.rotation);
            ship.ddx += x;
            ship.ddy += y;
        }
        if (kontra.keyPressed('down')) {
            const x = 0.1 * Math.cos(ship.rotation);
            const y = 0.1 * Math.sin(ship.rotation);
            ship.ddx -= x;
            ship.ddy -= y;
        }
        if (kontra.keyPressed('left')) {
            ship.rotation -= 0.1;
        }
        if (kontra.keyPressed('right')) {
            ship.rotation += 0.1;
        }

        // gravitate
        planets.map(planet => ship.gravitateTowards(planet));

        ship.update();

        // center viewport on ship
        viewport.x = ship.x - viewport.width / 2;
        viewport.y = ship.y - viewport.height / 2;

        // limit viewport
        if (viewport.x < 0) {
            viewport.x = 0;
        }
        if (viewport.x > world.width - viewport.width) {
            viewport.x = world.width - viewport.width;
        }
        if (viewport.y < 0) {
            viewport.y = 0;
        }
        if (viewport.y > world.height - viewport.height) {
            viewport.y = world.height - viewport.height;
        }
    },
    render() {
        ctx.save();

        // translate according to viewport
        ctx.translate(-viewport.x, -viewport.y);
        
        // render stars
        ctx.fillStyle = 'white';
        stars.map(star => {
            ctx.fillRect(star.x, star.y, 2, 2);
        });

        planets.map(planet => planet.render());

        ship.render();

        ctx.restore();
    }
});

loop.start();