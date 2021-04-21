/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-04-20 11:36:30
 * @LastEditTime: 2021-04-20 16:41:33
 */
const images = require('images')
// let png = images('../assets/imgs/small.png')

let smallPic = '../assets/imgs/small1.png'
let bigPic = '../assets/imgs/big1.png' // 145


var getPixels = require("get-pixels")

getPixels(smallPic, function (err, pixels) {
    if (err) {
        console.log(err);
        console.log("Bad image path")
        return
    }
    let [width, height, channels] = pixels.shape
    console.log({
        width,
        height,
        channels
    });
    let data = pixels.data
    let startIdx, targetPixel
    // 寻找行号
    for (let i = height - 1; i >= 0; i--) {
        let idx = (i * width + 10) * channels
        if (data[idx] > 0) {
            // console.log(data[idx]);
            targetPixel = data.slice(idx, idx + 4)
            startIdx = i
            console.log(`缺口高度在 ${startIdx} 的位置`);
            console.log(`目标像素为 ${targetPixel}`);
            break;
        }
    }

    for (let i = 0; i < width; i++) {
        let idx = (startIdx * width + i) * channels
        // targetPixel = [data[idx + 1], data[idx + 2], data[idx + 3]]

        // console.log(data.slice(idx, idx + 4));
    }
    getPixels(bigPic, (err, res) => {
        if (err) {
            console.log('读取图像出错');
            return;
        }
        let [w, h, c] = res.shape
        console.log({
            w,
            h,
            c
        });

        let d = res.data
        for (let i = 0; i < w; i++) {
            let idx = (startIdx * w + i) * c
            // if (d[idx] > 240) {
            //     console.log(`缺口移动位置在 ${i} 的位置`);
            //     // console.log(i);
            //     break;
            // }
            if (i > 92 && i < 92 + 42)
                console.log(d.slice(idx, idx + 4));
        }
    })
})


// console.log(png.height());