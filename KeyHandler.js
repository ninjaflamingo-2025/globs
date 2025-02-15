class Keyhandler extends EventTarget {
  constructor(){
    super();  // Initialize EventTarget
    this.init()
  }
  
  init() {
    window.addEventListener("keydown", (e) => this.emit(e));
    window.addEventListener("keyup", (e) => this.emit(e));
  }
  
  emit(e) {
    this.dispatchEvent(new CustomEvent(e.type, { detail: e.key }));
  }
}
