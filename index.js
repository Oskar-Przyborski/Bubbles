const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight - 60

let gravity = 0
let friction = 0.99
let bubbles = 60
let radius = 30
let radiusDiversity = 5

function randomColor(){
    return `hsla(${Math.random() * 360},70%,70%,80%)`
}
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function distance(x1,y1,x2,y2){
    const xDistance = x2-x1
    const yDistance = y2-y1
    return Math.sqrt(Math.pow(xDistance,2) + Math.pow(yDistance,2))
}
/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

 function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

class Circle{
    constructor(x,y,radius,color,mass,velocity){
        this.x = x,
        this.y = y,
        this.radius = radius,
        this.color = color,
        this.mass = mass,
        this.velocity = velocity
    }

    //draw a circle
    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        ctx.closePath()
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.stroke()
    }

    //call it every frame
    update(){
        this.draw()

        //wall bouncing
        if(this.x - this.radius < 0 || this.x + this.radius + this.velocity.x > canvas.width) {this.velocity.x = -this.velocity.x*friction}
        if(this.y - this.radius < 0 || this.y + this.radius + this.velocity.y > canvas.height){this.velocity.y = -this.velocity.y * friction}//inverse velocity on touch
        else{ this.velocity.y += gravity}//gravity
        
        //if out of a screen
        if(this.x - this.radius < 0) this.x=this.radius
        if(this.x + this.radius + this.velocity.x > canvas.width) this.x = canvas.width - this.radius
        if(this.y - this.radius < 0) this.y=this.radius
        if(this.y + this.radius + this.velocity.y > canvas.height) this.y = canvas.height - this.radius

        //set pos by velocity
        this.x += this.velocity.x
        this.y += this.velocity.y
        
        for(let i = 0; i <objects.length;i++){
            if(this===objects[i]) continue
            if(distance(this.x,this.y,objects[i].x,objects[i].y)-this.radius-objects[i].radius<0){
                resolveCollision(this,objects[i])
            }
        }
    }
}
let objects = []
function init(){
    objects = []
    for (let i = 0; i <bubbles; i++) {
        const objRadius = randomInt(radius-radiusDiversity,radius+radiusDiversity)
        let x = randomInt(radius,canvas.width-radius)
        let y = randomInt(radius,canvas.height-radius)
        const color = randomColor()
        const mass = 1
        const velocity = {
            x: randomInt(-5,5),
            y: randomInt(-5,5)
        }
       
        if(i!==0){
            let antyInfiniteLooper = 0
            for(let j = 0;  j < objects.length;j++){
                if(distance(x,y,objects[j].x,objects[j].y) - radius - objects[j].radius < 0){
                    x = randomInt(radius,canvas.width-radius)
                    y = randomInt(radius,canvas.height-radius)
                    j= -1
                    antyInfiniteLooper+=1
                    if(antyInfiniteLooper===100) break
                }
            }
        }
        objects.push(new Circle(x,y,Math.abs(objRadius),color,mass,velocity))
    }
}


function animate(){
    requestAnimationFrame(animate)
    ctx.clearRect(0,0,canvas.width,canvas.height)
    objects.forEach(obj=>{
        if(obj.update==null)return
        obj.update()
    })
}

function shake(){
    objects.forEach(obj=>{obj.velocity.x=randomInt(-40,40); obj.velocity.y = randomInt(-40,40)})
}
function slow(){
    objects.forEach(obj=>{obj.velocity.x=randomInt(-2,2); obj.velocity.y = randomInt(-2,2)})
}
init()
animate()