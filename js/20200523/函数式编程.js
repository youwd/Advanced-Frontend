
//// 高阶函数
const insideFn = logger => message => logger(message.toUpperCase() + "!!!");

const scream = insideFn(message => console.log(message))

scream("deqweqewq");


/// 综合应用：构建一个时钟
/// 获取当前时间，格式化为 hh:mm:ss am
/// 小于10 前面自动补0
const oneSecond = () => 1000;
const getCurrentTime = () => new Date();
const clear = () => console.clear();
const log = (message) => console.log(message);

/**
 * 格式化时间，构造一个包含时 分 秒的对象
 * @param {*} date 
 */
const serializeClockTime = date => ({
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
})

/**
 * 超过12点，例如13点 => 转换为下午1点
 * @param {*} clockTime 
 */
const civilianHours = clockTime => ({
    ...clockTime,
    hours: clockTime.hours > 12 ?
        clockTime.hours -= 12 :
        clockTime.hours
})

/**
 * 计算是上午还是下午
 * @param {*} clockTime 
 */
const appendAMPM = clockTime => ({
    ...clockTime,
    ampm : clockTime.hours > 12 ?
    "AM" : "PM"
})
/**
 *  获取目标函数，返回的函数会把时间发送到目标
 */
const display = target => time => target(time);

/**
 * 获得一个模版字符串，对时钟时间进行相应格式化
 * 格式化模版：hh:mm:ss tt
 * @param {*} format 
 */
const formatClick = format => 
    time => 
        format.replace('hh',time.hours)
              .replace('mm',time.minutes)
              .replace('ss',time.seconds)
              .replace('tt',time.ampm)

/**
 * 将小于10的数字 前面补0
 * @param {*} key 
 */
const appendZero = key => clockTime =>({
    ...clockTime,
    [key]:(clockTime[key] < 10)? 
        '0' + clockTime[key] :
        clockTime[key]
})

/// 项目的基本函数已经准备好，现在需要将它们进行组合
/**
 * 函数compose接受函数作为参数，并且会返回一个独立的函数
 * 每个函数被调用后的结果累计就是上一个函数的输出结果。
 * 总之，最后一个函数被调用并返回类最终的结果
 * @param  {...any} fns 
 */
const compose = (...fns) =>
    (arg) =>
        fns.reduce(
            (composed, f) => f(composed),
            arg
        )

/**
 * 转换为本地时间
 * @param {*} clockTime 
 */
const convertToCivilianTime = clockTime => 
            compose(
                civilianHours,
                appendAMPM
            )(clockTime)

/**
 * 获取本地时间，保证时、分、秒是以双位数格式显示的，必要的情况下补0
 * @param {*} civilianTime 
 */
const doubleDigits = civilianTime => 
                compose(
                    appendZero("hours"),
                    appendZero("minutes"),
                    appendZero("seconds")
                )(civilianTime)

/**
 * 设置时间间隔启动时钟程序
 * 每隔一秒，控制台都会被清空、获取当前时间、转换格式化对象、本地化、格式化、显示
 */
const startTicking = () => 
                    setInterval(
                        compose(
                            clear,
                            getCurrentTime,
                            serializeClockTime,
                            convertToCivilianTime,
                            doubleDigits,
                            formatClick("hh:mm:ss tt"),
                            display(log)
                        ),
                        oneSecond()
                    )
 startTicking();