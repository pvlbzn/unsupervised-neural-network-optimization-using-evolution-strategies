import { LinkedList }   from '../utils/LinkedList'
import Store            from '../utils/Store'

/**
 * HTML canvas has origo at top left corner.
 * 
 *      0 1 2 3 | x
 *      1
 *      2
 *      3
 *      -
 *      y
 * 
 * Like a matrix.
 */
class Node {
    constructor(x, y, maxX, maxY) {
        this.x = x
        this.y = y

        this.maxX = maxX
        this.maxY = maxY
    }

    up() {
        if (this.y - 1 < 0) return false

        this.y -= 1

        return true
    }

    down() {
        if (this.y + 1 > this.maxY - 1) return false

        this.y += 1

        return true
    }

    left() {
        if (this.x - 1 < 0) return false

        this.x -= 1

        return true
    }

    right() {
        if (this.x + 1 > this.maxX - 1) return false

        this.x += 1

        return true
    }

    clone() {
        return new Node(this.x, this.y, this.maxX, this.maxY)
    }

    isEqual(another) {
        return this.x === another.x && this.y === another.y
    }
}

/**
 * Snake
 * 
 * 
 * Direction: 
 * Snake has a direction, direction is a clock-wise enumerator
 *      0 -> right
 *      1 -> down
 *      2 -> left
 *      3 -> up
 */
export class Snake {
    constructor(id) {
        this.id = id
        this.isAlive = true
        this.isSelected = false

        this.data = new LinkedList()
        this.direction = 0
    }

    getData() {
        return this.data
    }

    getHead() {
        return this.data.getHead()
    }

    select() {
        this.isSelected = !this.isSelected
    }

    init(x, y) {
        const midX = Math.floor(x / 2)
        const midY = Math.floor(y / 2)
        this.data
            .insertHead(new Node(midX + 0, midY, x, y))
            .insertHead(new Node(midX + 1, midY, x, y))
            .insertHead(new Node(midX + 2, midY, x, y))

        return this
    }

    /**
     * Perform a snake step.
     * 
     * Snake is made out of nodes, to make one step tail should be removed
     * and 
     */
    step() {
        if (this.isAlive === false) return
        
        const newHead = this.data.getHead().clone()

        switch (this.direction) {
            case 0:
                if (newHead.right() == false)
                    Store.reactor.dispatch('collision', this)
                else
                    this.data.removeTail().insertHead(newHead)
                break;
            case 1:
                if (newHead.down() == false)
                    Store.reactor.dispatch('collision', this)
                else
                    this.data.removeTail().insertHead(newHead)
                break;
            case 2:
                if (newHead.left() == false)
                    Store.reactor.dispatch('collision', this)
                else
                    this.data.removeTail().insertHead(newHead)
                break;
            case 3:
                if (newHead.up() == false)
                    Store.reactor.dispatch('collision', this)
                else
                    this.data.removeTail().insertHead(newHead)
                break;
            default:
                console.error('>>> method=step message=unknown direction')
                return
         }

         if (this.selfCollisionCheck())
            Store.reactor.dispatch('collision', this)
    }

    selfCollisionCheck() {
        const head = this.data.getHead()
        let heads = 0
        this.data.forEach(x => { if (x.data.isEqual(head)) heads += 1 })
        return heads > 1
    }

    isCollisionOn(direction) {
        const emulatedHead = this.data.getHead().clone()

        let envCollision = null
        if (direction === 0)
            envCollision = !emulatedHead.right()
        else if (direction === 1)
            envCollision = !emulatedHead.down()
        else if (direction === 2)
            envCollision = !emulatedHead.left()
        else if (direction === 3)
            envCollision = !emulatedHead.up()
        else
            throw new Error("function=isCollisionOn message=unknown direction")

        let heads = 0
        this.data.forEach(x => { if (x.data.isEqual(emulatedHead)) heads += 1 })
        const selfCollision = heads > 0

        return (envCollision || selfCollision)
    }

    grow() {
        this.data.insertTail(this.data.getTail())
    }

    /**
     * Turn the snake left.
     * 
     *        3 ^ 
     *          |  0
     *       <- x ->
     *       2  |
     *          v 1
     * 
     * Turning left effectively means current direction value - 1.
     */
    left() {
        if      (this.direction === 0)  this.direction = 3
        else if (this.direction === 1)  this.direction = 0
        else if (this.direction === 2)  this.direction = 1
        else if (this.direction === 3)  this.direction = 2
        else throw new Error('class=Snake method=left message=unknown direction value')
    }

    emulateLeft() {
        if      (this.direction === 0)  return 3
        else if (this.direction === 1)  return 0
        else if (this.direction === 2)  return 1
        else if (this.direction === 3)  return 2
        else throw new Error('class=Snake method=left message=unknown direction value')
    }

    /**
     * Turn the snake right.
     * 
     *        3 ^ 
     *          |  0
     *       <- x ->
     *       2  |
     *          v 1
     * 
     * Turning right effectively means current direction value + 1.
     */
    right() {
        if      (this.direction === 0)  this.direction = 1
        else if (this.direction === 1)  this.direction = 2
        else if (this.direction === 2)  this.direction = 3
        else if (this.direction === 3)  this.direction = 0
        else throw new Error('class=Snake method=left message=unknown direction value')
    }

    emulateRight() {
        if      (this.direction === 0)  return 1
        else if (this.direction === 1)  return 2
        else if (this.direction === 2)  return 3
        else if (this.direction === 3)  return 0
        else throw new Error('class=Snake method=left message=unknown direction value')
    }

    // Is snake at some <x, y> cell?
    isAt(x, y) {
        const n = new Node(x, y, this.maxX, this.maxY)
        return this.data.has(n)
    }

    kill() {
        this.isAlive = false
    }
}