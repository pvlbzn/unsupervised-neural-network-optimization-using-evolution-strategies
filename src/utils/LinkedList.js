class Node {
  constructor(data) {
      this.data = data
      this.next = null
      this.prev = null
  }
}

/**
* Circular doubly linked list with sentinel for snake model.
* 
* It allows to perform snake-model related operations in O(1):
*      * insert head
*      * remove tail
* 
* LinkedList implements all standard list operation and one functional:
*      forEach(function): call function over on each list element
*/
export class LinkedList {
  constructor() {
      this.root = new Node(null)
      this.root.prev = this.root
      this.root.next = this.root
      this.length = 0
  }

  insertHead(data) {
      const n = new Node(data)

      if (this.root.next === this.root) {
          // Empty list, this node is the first
          this.root.next = n
          this.root.prev = n
          n.next = this.root
          n.prev = this.root
      } else {
          n.next = this.root.next
          this.root.next.prev = n
          this.root.next = n
          n.prev = this.root
      }

      this.length += 1

      return this
  }

  insertTail(data) {
      const n = new Node(data)

      if (this.root.prev === this.root) {
          // List is empty, this node is the firts one
          this.root.next = n
          this.root.prev = n
          n.next = this.root
          n.prev = this.root
      } else {
          n.next = this.root
          n.prev = this.root.prev
          this.root.prev = n
          n.prev.next = n
      }

      this.length += 1

      return this
  }

  removeHead() {
      this.root.next.next.prev = this.root
      this.root.next = this.root.next.next

      this.length -= 1

      return this
  }

  removeTail() {
      this.root.prev.prev.next = this.root
      this.root.prev = this.root.prev.prev

      this.length -= 1

      return this
  }

  getTail() {
      if (this.root.prev === this.root)
          return null
      return this.root.prev.data
  }

  getHead() {
      if (this.root.next === this.root)
          return null
      return this.root.next.data
  }

  forEach(f) {
      let tmpNode = this.root.next

      while (tmpNode != null && tmpNode != this.root) {
          f(tmpNode)
          tmpNode = tmpNode.next
      }

      return this
  }

  /**
   * Check whether list has element or not.
   * 
   * Performs linear search, therefore ok for unsorted data.
   * 
   * @param {*} elem must implement isEqual method
   */
  has(elem) {
      let tmpNode = this.root.next

      while (tmpNode != null && tmpNode != this.root) {
          if (tmpNode.data.isEqual(elem))
              return true
          tmpNode = tmpNode.next
      }

      return false
  }

  toString() {
      let res = ''
      let tmpNode = this.root.next

      while (tmpNode != null && tmpNode != this.root) {
          res += tmpNode.data
          if (tmpNode.next != null && tmpNode.next != this.root)
              res += ' '
          tmpNode = tmpNode.next
      }

      return res
  }
}
