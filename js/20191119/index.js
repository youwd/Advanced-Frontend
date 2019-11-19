class LazyManClass {
    constructor(name) {
      this.name = name
      this.queue = []
      console.log(`Hi I am ${name}`)
      setTimeout(() => {
        this.next()
      },0)
    }
  
    sleepFirst(time) {
      const fn = () => {
        setTimeout(() => {
          console.log(`等待了${time}秒...`)
          this.next()
        }, time)
      }
      this.queue.unshift(fn)
      return this
    }
  
    sleep(time) {
      const fn = () => {
        setTimeout(() => {
          console.log(`等待了${time}秒...`)
          this.next()
        },time)
      }
      this.queue.push(fn)
      return this
    }
  
    eat(food) {
      const fn = () => {
        console.log(`I am eating ${food}`)
        this.next()
      }
      this.queue.push(fn)
      return this
    }
  
    next() {
      const fn = this.queue.shift()
      fn && fn()
    }
  }
  
  function LazyMan(name) {
    return new LazyManClass(name)
  }
  
  LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(4).eat('junk food');