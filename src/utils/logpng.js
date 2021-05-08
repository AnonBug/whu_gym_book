/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-04 21:50:52
 * @LastEditTime: 2021-05-04 22:52:31
 */
const fs = require('fs')
const canvas = require('canvas')
const cv = require('opencv4nodejs')

const createPng = function (mat, filename) {
    try {

        // 创建输出任务
        const out = fs.createWriteStream('../test/dist/' + filename)
        // 从 mat 获取像素数据
        const img = mat.channels === 1 ?
            mat.cvtColor(cv.COLOR_GRAY2RGBA) :
            mat.cvtColor(cv.COLOR_BGR2RGBA)
        // 使用 img 的宽高创建 canvas
        const ctx = canvas.createCanvas(img.cols, img.rows)
        const stream = ctx.createPNGStream({
            palette: new Uint8ClampedArray(img.getData()),
            backgroundIndex: 1 // optional, defaults to 0
        })

        // 传输
        stream.pipe(out)
        // 完成事件
        out.on('finish', () => console.log(`${filename} file was created.`))
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    createPng
}