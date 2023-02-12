const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')
const scoreElement = document.querySelector('#scoreElement')

canvas.width = innerWidth
canvas.height = innerHeight

//boundaries class
class Boundary {
    static width = 40
    static height = 40

    constructor({position, image}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    draw() {
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

//player class
class Pacman {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.rate = 0.12
        this.rotation = 0
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if (this.radians < 0 || this.radians > 0.75)
            this.rate = -this.rate
        this.radians += this.rate
    }
}

//enemy class
class Ghost {
    static speed = 2

    constructor({position, velocity, color = 'red'}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Pellet {
    constructor({position}) {
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
    }
}

class PowerUp {
    constructor({position}) {
        this.position = position
        this.radius = 8
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}


const pellets = []
const boundaries = []
const powerUps = []

//creating the ghosts
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 8 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
    }),
    new Ghost({
        position: {
            x: Boundary.width * 9 + Boundary.width / 2,
            y: Boundary.height * 7 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'purple'
    }),
    new Ghost({
        position: {
            x: Boundary.width * 12 + Boundary.width / 2,
            y: Boundary.height * 15 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'pink'
    }),
    new Ghost({
        position: {
            x: Boundary.width * 2 + Boundary.width / 2,
            y: Boundary.height * 19 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'green'
    })
]

//creating pacman
const pacman = new Pacman({
    position: {
        x: Boundary.width + Boundary.width / 2, //pozicioniranje na centarot
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let lastKey = ''
let score = 0

const map = [
    ['1', '-', '-', '-', '-', '-', '-', '7', '-', '-', '-', '7', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '1', '-', '-', ']', '.', '_', '.', '^', '.', '_', '.', '[', '-', '-', '2', '.', '|'],
    ['|', '.', '_', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '_', '.', '|'],
    ['|', '.', '.', '.', '^', '.', '[', ']', '.', '_', '.', '[', ']', '.', '^', '.', '.', '.', '|'],
    ['6', '-', ']', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '[', '-', '8'],
    ['|', '.', '.', '.', '4', ']', '.', '[', '-', '-', '-', ']', '.', '[', '3', '.', '.', '.', '|'],
    ['|', '.', '^', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '^', '.', '|'],
    ['|', '.', '4', ']', '.', '^', '.', '1', ']', '.', '[', '2', '.', '^', '.', '[', '3', '.', '|'],
    ['|', '.', '.', '.', '.', '|', '.', '|', '.', '.', 'p', '|', '.', '|', '.', '.', '.', '.', '|'],
    ['|', '.', '^', '.', '[', '3', '.', '4', '-', '-', '-', '3', '.', '4', ']', '.', '^', '.', '|'],
    ['|', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '|'],
    ['|', '.', '4', ']', '.', '1', '-', ']', '.', '^', '.', '[', '-', '2', '.', '[', '3', '.', '|'],
    ['|', '.', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '.', '|'],
    ['6', ']', '.', '^', '.', '_', '.', '[', '-', '5', '-', ']', '.', '_', '.', '^', '.', '[', '8'],
    ['|', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '|'],
    ['|', '.', '[', '3', '.', '1', '-', ']', '.', '^', '.', '[', '-', '2', '.', '4', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '|', '.', '[', '-', '5', '-', ']', '.', '|', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '|', 'p', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '5', '-', '-', '-', '-', '-', '-', '-', '5', '-', '-', '-', '-', '3']
]

function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}

map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeHorizontal.png')
                }))
                break
            case '|':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeVertical.png')
                }))
                break
            case '1':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner1.png')
                }))
                break
            case '2':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner2.png')
                }))
                break
            case '3':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner3.png')
                }))
                break
            case '4':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner4.png')
                }))
                break
            case 'b':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./img/block.png')
                    })
                )
                break
            case '[':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capLeft.png')
                    })
                )
                break
            case ']':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capRight.png')
                    })
                )
                break
            case '_':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capBottom.png')
                    })
                )
                break
            case '^':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/capTop.png')
                    })
                )
                break
            case '+':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/pipeCross.png')
                    })
                )
                break
            case '5':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./img/pipeConnectorTop.png')
                    })
                )
                break
            case '6':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./img/pipeConnectorRight.png')
                    })
                )
                break
            case '7':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./img/pipeConnectorBottom.png')
                    })
                )
                break
            case '8':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./img/pipeConnectorLeft.png')
                    })
                )
                break
            //creating pellets
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break
            //creating power ups
            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break
        }
    })
})

//COLLISION DETECTION CODE
function circleCollidesWithRectangle({circle, rectangle}) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && //is the top side of the pacman colliding with the bottom side of the boundary
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && //is the right side of the pacman colliding with the left side of the boundary
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && //is the bottom side of the pacman colliding with the top side of the boundary
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding) //is the left side of the pacman colliding with the right side of the boundary
}

let animationId

function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    //movement
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, velocity: {
                        x: 0,
                        y: -5
                    }
                },
                rectangle: boundary
            })) {
                pacman.velocity.y = 0
                break
            } else {
                pacman.velocity.y = -5
            }
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, velocity: {
                        x: -5,
                        y: 0
                    }
                },
                rectangle: boundary
            })) {
                pacman.velocity.x = 0
                break
            } else {
                pacman.velocity.x = -5
            }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, velocity: {
                        x: 0,
                        y: 5
                    }
                },
                rectangle: boundary
            })) {
                pacman.velocity.y = 0
                break
            } else {
                pacman.velocity.y = 5
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, velocity: {
                        x: 5,
                        y: 0
                    }
                },
                rectangle: boundary
            })) {
                pacman.velocity.x = 0
                break
            } else {
                pacman.velocity.x = 5
            }
        }
    }

    //collecting power ups
    for (let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i]
        powerUp.draw()

        if (Math.hypot(powerUp.position.x - pacman.position.x, powerUp.position.y - pacman.position.y) < powerUp.radius + pacman.radius) {
            powerUps.splice(i, 1)

            //make ghosts scared if pacman gets the power up
            ghosts.forEach((ghost) => {
                ghost.scared = true

                setTimeout(() => {
                    ghost.scared = false
                }, 5000)
            })
        }
    }

    //collecting pellets
    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()

        if (Math.hypot(pellet.position.x - pacman.position.x, pellet.position.y - pacman.position.y) < pellet.radius + pacman.radius) {
            pellets.splice(i, 1)
            score += 10
            scoreElement.innerHTML = score
        }
    }

    //drawing the boundaries
    boundaries.forEach((boundary) => {
        boundary.draw()

        if (circleCollidesWithRectangle({
            circle: pacman,
            rectangle: boundary
        })) {
            pacman.velocity.x = 0
            pacman.velocity.y = 0
        }
    })

    pacman.update()

    //drawing the ghosts
    ghosts.forEach((ghost) => {
        ghost.update()

        const collisions = []

        //ghost movement
        boundaries.forEach((boundary) => {
            if (!collisions.includes('right') && circleCollidesWithRectangle({
                circle: {
                    ...ghost, velocity: {
                        x: ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })) {
                collisions.push('right')
            }
            if (!collisions.includes('left') && circleCollidesWithRectangle({
                circle: {
                    ...ghost, velocity: {
                        x: -ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })) {
                collisions.push('left')
            }
            if (!collisions.includes('up') && circleCollidesWithRectangle({
                circle: {
                    ...ghost, velocity: {
                        x: 0,
                        y: -ghost.speed
                    }
                },
                rectangle: boundary
            })) {
                collisions.push('up')
            }
            if (!collisions.includes('down') && circleCollidesWithRectangle({
                circle: {
                    ...ghost, velocity: {
                        x: 0,
                        y: ghost.speed
                    }
                },
                rectangle: boundary
            })) {
                collisions.push('down')
            }
        })
        //comparing the current collisions and previous collisions
        if (collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions
        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            if (ghost.velocity.x > 0)
                ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0)
                ghost.prevCollisions.push('left')
            else if (ghost.velocity.y < 0)
                ghost.prevCollisions.push('up')
            else if (ghost.velocity.y > 0)
                ghost.prevCollisions.push('down')

            const pathways = ghost.prevCollisions.filter((collision) => {
                return !collisions.includes(collision)
            })

            //random direction
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break
            }

            ghost.prevCollisions = []
        }

    })


    //which direction is pacman facing
    if (pacman.velocity.x > 0) //right
        pacman.rotation = 0
    else if (pacman.velocity.x < 0) //left
        pacman.rotation = Math.PI
    else if (pacman.velocity.y < 0) //up
        pacman.rotation = Math.PI * 1.5
    else if (pacman.velocity.y > 0) //down
        pacman.rotation = Math.PI / 2

    //detect collision between ghosts and pacman
    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i]
        //GHOST TOUCHES PACMAN
        if (Math.hypot(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius) {
            if (ghost.scared) {
                ghosts.splice(i, 1)
                score += 20
                scoreElement.innerHTML = score
            }
            //lose condition
            else {
                cancelAnimationFrame(animationId)
                c.font = "80px Verdana";
                let gradient = c.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, " magenta");
                gradient.addColorStop(0.5, "blue");
                gradient.addColorStop(1.0, "red");
                // Fill with gradient
                c.fillStyle = 'white';

                c.fillText("Game Over!", canvas.width / 14, canvas.height / 2);
            }
        }
    }

    //win condition
    if (pellets.length === 0) {
        cancelAnimationFrame(animationId)
        c.font = "80px Verdana";
        let gradient = c.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, " magenta");
        gradient.addColorStop(0.5, "blue");
        gradient.addColorStop(1.0, "red");
        // Fill with gradient
        c.fillStyle = 'white';

        c.fillText("You win!!!", canvas.width / 14, canvas.height / 2);

    }
}

animate()


addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})
