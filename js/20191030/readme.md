### 数组的插入排序
```
function insertSort(list = []) {
    for(let i = 1 , len = list.length; i < len; i++){
        let j = i - 1;
        let temp = list[ i ];
        while (j >= 0 && list[ j ] > temp){
            list[j + 1] = list[ j ];
            j = j - 1;
        }
        list[j + 1] = temp;
    }
    return list;
}
```

### 链表的插入排序
```
let insertionSortList = function (head) {
   if(!head || !head.next){
       return head;
   }
   let res = new ListNode(-1);
   while (head){
       let next = head.next;
       let cur = res;
       while (cur.next && cur.next.val <= head.val){
           cur = cur.next;
       }
       head.next = cur.next;
       cur.next = head;
       head = next;
   }
   return res.next;
};
```


### 冒泡排序
```
function bubbleSort(list = []) {
    for(let i = 0,len = list.length; i < len - 1; i++){
        for(let j = 0; j<len - 1- i;j++){
            if(list[j] > list[j+1]){
                let temp = list[j];
                list[j] = list[j+1];
                list[j+1] = temp;
            }
        }
    }
    return list;
}
```

### 冒泡排序递归版本--最简实现
```
function merge(left, right) {
    let tmp = [];
    while (left.length && right.length) {
        if (left[0] < right[0]){
            tmp.push(left.shift()); // 此处损耗性能严重
        }
        else{
            tmp.push(right.shift()); // 此处损耗性能严重
        }
    }
    return tmp.concat(left, right);
}

function mergeSort(list = []) {
    let len = list.length;
    if (len <= 1){
        return list;
    }
    let mid = parseInt(len / 2),
        left = list.slice(0, mid),
        right = list.slice(mid);

    return merge(mergeSort(left), mergeSort(right));
}

console.time('merge1');
mergeSort(list); // merge1: 620.807861328125ms
console.timeEnd('merge1');
```

### 冒泡排序递归版本--避免使用数组方法，提高性能
```
function merge(left,right) {
    let leftLen = left.length,
        rightLen = right.length,
        leftIndex = 0,
        rightIndex = 0,
        temp = [];
    for(let i = 0; i<leftLen + rightLen; i++){
        if(leftIndex === leftLen){
            temp[i] = right[rightIndex++];
        }else if(rightIndex === rightLen){
            temp[i] = left[leftIndex++];
        }else {
            temp[i] = left[leftIndex] < right[rightIndex] ? left[leftIndex++] : right[rightIndex ++]
        }
    }
    return temp;
}
function mergeSort(list = []) {
    let len = list.length;
    if(len <= 1){
        return list;
    }
    let mid = parseInt(len/2),
        left = [],
        right = [];
    for(let i = 0; i<len; i++){
        if(i<mid){
            left[i] = list[i];
        }else{
            right[i - mid] = list[i];
        }
    }
    return merge(mergeSort(left),mergeSort(right));
}

console.time('merge2');
mergeSort(list); // merge2: 47.4619140625ms
console.timeEnd('merge2');
```

### 冒泡排序非递归版本--避免栈溢出，性能对比递归方式，性能稍差
```
function merge(left = [],right = []) {
    let leftLen = left.length,
        rightLen = right.length,
        leftIndex = 0,
        rightIndex = 0,
        temp = [];
    for(let i = 0; i<leftLen + rightLen; i++){
        if(leftIndex === leftLen){
            temp[i] = right[rightIndex++];
        }else if(rightIndex === rightLen){
            temp[i] = left[leftIndex++];
        }else {
            temp[i] = left[leftIndex] < right[rightIndex] ? left[leftIndex++] : right[rightIndex ++]
        }
    }
    return temp;
}

function mergeSort(list = []) {
    let len = list.length;
    if(len <= 1){
        return list;
    }
    let works = [];
    //将原数组分解成多个小数组
    for(let i = 0; i < len; i++){
        works[i] = [list[i]]
    }
    //为避免奇数项整除舍弃最后一项，默认在数组后添加一项空
    works[len] = [];

    while (len > 1){ // 存在需要合并的子数组
        let j = 0;
        for(let i = 0; i < len; i = i + 2,j++){
            works[j] = merge(works[i],works[i+1])
        }
        works[j] = [];
        len = j;
    }
    return works[0];
}

console.time('merge3');
mergeSort(list); // merge3: 76.687744140625ms
console.timeEnd('merge3');
```