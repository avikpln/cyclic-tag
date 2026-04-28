/* --- EXPORTS --- */
export { LinkedList as default };

/*
 * CLASS: LinkedList
 *****************************************************************************/
const LinkedList = class {
  /* --- INNER: Node --- */
  static Node = class {
    constructor(data, next = null, prev = null) {
      this.data = data;
      this.next = next;
      this.prev = prev;
    }
  };

  /* --- C'TOR: constructor --- */
  constructor() {
    this.clear();
  }

  /* --- METHOD: clear --- */
  clear() {
    this.head = this.tail = null;
    this.size = 0;
  }

  /* --- METHOD: isEmpty --- */
  isEmpty() {
    return this.size == 0;
  }

  /* --- METHOD: pushFront --- */
  pushFront(data) {
    const newNode = new LinkedList.Node(data, this.head, null);
    if (this.isEmpty()) {
      this.head = this.tail = newNode;
    } else {
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  /* --- METHOD: pushBack --- */
  pushBack(data) {
    const newNode = new LinkedList.Node(data, null, this.head);
    if (this.isEmpty()) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
  }

  /* --- METHOD: peekFront --- */
  peekFront() {
    if (this.isEmpty()) {
      console.error(`ERROR: Trying to access an empty list`);
      return undefined;
    }
    return this.head.data;
  }

  /* --- METHOD: peekBack --- */
  peekBack() {
    if (this.isEmpty()) {
      console.error(`ERROR: Trying to access an empty list`);
      return undefined;
    }
    return this.tail.data;
  }

  /* --- METHOD: popFront --- */
  popFront() {
    if (this.isEmpty()) {
      console.error(`ERROR: Cannot pop an empty list`);
      return undefined;
    }
    const data = this.head.data;
    this.head = this.head.next;
    if (this.head == null) {
      this.tail = null;
    } else {
      this.head.prev = null;
    }
    this.size--;
    return data;
  }

  /* --- METHOD: popBack --- */
  popBack() {
    if (this.isEmpty()) {
      console.error(`ERROR: Cannot pop an empty list`);
      return undefined;
    }
    const data = this.tail.data;
    this.tail = this.tail.prev;
    if (this.tail == null) {
      this.head = null;
    } else {
      this.tail.next = null;
    }
    this.size--;
    return data;
  }

  /* --- METHOD: forEach --- */
  forEach(callback) {
    // NOTE: Trversal order is from head to tail.
    if (!(typeof callback === "function")) {
      console.error(`ERROR: Callback is not a function`);
      return;
    }
    let curr = this.head;
    while (curr !== null) {
      callback(curr.data);
      curr = curr.next;
    }
  }

  /* --- METHOD: map --- */
  map(callback) {
    if (!(typeof callback === "function")) {
      console.error(`ERROR: Callback is not a function`);
      return;
    }
    const llist = new LinkedList();
    this.forEach((data) => {
      llist.pushBack(callback(data));
    });
    return llist;
  }
};
