const str = ' we weq ';
const POSITION = Object.freeze({
    left: Symbol(),
    right: Symbol(),
    both: Symbol(),
    center: Symbol(),
    all: Symbol()
});

function trim(str, position = POSITION.both) {

    if (!!POSITION[position]) throw new Error('unexpected position value')

    switch (position) {
        case POSITION.left:
            str = str.replace(/^\s+/, '');
            break;
        case POSITION.right:
            str = str.replace(/\s+$/, '');
            break;
        case POSITION.both:
            str = str.replace(/^\s+/, '').replace(/\s+$/, '');
            break;
        case (POSITION.center):
            while (str.match(/\w\s+\w/)) {
                str = str.replace(/(\w)(\s+)(\w)/, `$1$3`)
            }
            break;
        case (POSITION.all):
            str = str.replace(/\s/g, '')
            break;
        default:
            break;
    }

    return str;
}

const result = trim(str, POSITION.all);

console.log(`|${result}|`);