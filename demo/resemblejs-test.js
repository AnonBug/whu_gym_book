/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-04-17 11:38:07
 * @LastEditTime: 2021-04-17 11:43:21
 */
const resemble = require('resemblejs')
const fs = require('fs')

const small = fs.readFileSync('../assets/imgs/small.png')
const big = fs.readFileSync('../assets/imgs/big.png')

var api = resemble(big).onComplete(function (data) {
    console.log(data);
    /*
	{
	  red: 255,
	  green: 255,
	  blue: 255,
	  brightness: 255
	}
	*/
});

var diff = resemble(big)
    .compareTo(small)
    .ignoreColors()
    .onComplete(function (data) {
        console.log(data);
        /*
	{
	  misMatchPercentage : 100, // %
	  isSameDimensions: true, // or false
	  dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
	  getImageDataUrl: function(){}
	}
	*/
    });