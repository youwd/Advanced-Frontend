
/***
 * ES6之前创建类的方法
 */
function Vacation(des,location){
    this.des = des;
    this.location = location;
}
Vacation.prototype.print = function(){
    console.log(`${this.des} +++ ${this.location}`);
}
const mani = new Vacation("weq","aaaa");
mani.print();


/**
 * ES6 class
 */
class Vacation2 {
    constructor(des,location){
        this.des = des;
        this.location = location;
    }
    print(){
        console.log(`${this.des} +++ ${this.location}`);
    }
}
const mani2 = new Vacation2("11111","222222");
mani2.print();

class EVacation2 extends Vacation2 {
    constructor(des,location,gear){
        super(des,location);
        this.gear = gear;
    }
    print(){
        super.print()
        console.log(`bring your ${this.gear}`);
    }
}
const emani = new EVacation2(111,222,333);
emani.print();