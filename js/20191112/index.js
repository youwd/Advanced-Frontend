function Fn(){
    var a = 1;
    return function(){
        console.log(a);
    }
}

const b = Fn();
b();
