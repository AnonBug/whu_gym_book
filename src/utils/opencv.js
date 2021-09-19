/*
 * @Author: zyc
 * @Description: 本滑块验证码破解方案全程参考自以下博客 
 *                  https://blog.csdn.net/weixin_44549063/article/details/112193218
 * @Date: 2021-04-25 19:43:48
 * @LastEditTime: 2021-09-19 08:10:55
 */
const cv = require('opencv4nodejs')

/**
 * @description: 从 base64 的图片链接生成 mat 实例
 * @param {String} base64text
 * @return {cv.Mat}
 */
const getMatByBase64 = base64text => {
    const base64data = base64text.replace('data:image/jpeg;base64', '')
        .replace('data:image/png;base64', ''); //Strip image type prefix
    const buffer = Buffer.from(base64data, 'base64');
    return cv.imdecode(buffer);
}

/**
 * @description: 从文件地址获取 mat 实例
 * @param {*}
 * @return {*}
 */
const getMatByFile = filepath => {
    return cv.imread(filepath)
}

/**
 * @description: 根据提供的拼图实例，获取需要滑动的距离
 * @param {cv.Mat} sMat 小拼图实例
 * @param {cv.Mat} bMat 整图实例
 * @return {Number} 滑动距离
 */
const getDistance = (sMat, bMat) => {
    // 1. 读取图片
    // 直接传参过来

    // 2. 裁剪图片
    // 2.1 裁剪小滑块的宽高，得到上下裁剪高度（根据像素值得到上下高，使用固定宽度作为滑块宽 41px）
    let data = sMat.getDataAsArray()
    let cutIdx = sMat.rows - 1
    for (; cutIdx >= 0; cutIdx--) {
        // console.log(data[i]);
        if (data[cutIdx][20][0] > 0) {
            break;
        }
    }
    
    // 2.2 根据小滑块的上下高度，裁剪
    sMat = sMat.getRegion(new cv.Rect(0, cutIdx - 38, 41, 38))
    bMat = bMat.getRegion(new cv.Rect(0, cutIdx - 38, bMat.cols, 38))


    // 3. 图片转灰度，并自适应阈值化
    if (sMat.channels !== 1) sMat = sMat.bgrToGray()
    if (bMat.channels !== 1) bMat = bMat.bgrToGray()
    // 自适应阈值化
    const sNewGray = sMat.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 7, -4)
    const bNewGray = bMat.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 7, -4)

    // 4. 模糊匹配
    let result_rows = bNewGray.rows - sNewGray.rows + 1;
    let result_cols = bNewGray.cols - sNewGray.cols + 1;
    let res = new cv.Mat(result_rows, result_cols, cv.CV_32FC1);
    res = bNewGray.matchTemplate(sNewGray, cv.TM_CCOEFF)
    // 序列化
    res.normalize(0, 1, cv.NORM_MINMAX, -1, new cv.Mat())
    let mmlr = cv.minMaxLoc(res)
    let matchLocation = mmlr.maxLoc

    // 5. 得到滑动距离
    return matchLocation.x
}

/**
 * @description: 根据传入的 base64 地址获取应当滑动的距离
 * @param {String} smallBase64text
 * @param {String} bigBase64text
 * @return {Number}
 */
const getDistanceByBase64 = (smallBase64text, bigBase64text) => {
    return getDistance(getMatByBase64(smallBase64text), getMatByBase64(bigBase64text))
}

module.exports = {
    getDistance,
    getDistanceByBase64
}
