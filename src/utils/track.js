/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 13:17:17
 * @LastEditTime: 2021-05-05 13:46:14
 */

/**
 * @description: 根据待滑动的距离获取滑动轨迹
 * @param {Number} distance
 * @return {Number[]}
 */
const getMoveTrack = distance => {
    const track = []
    let current = 0
    let mid = Math.floor(distance * 4 / 5)
    let a = 0
    let move = 0

    while (true) {
        a = Math.round(Math.random() * 10)
        // 根据减速阈值，决定是加是减
        move = current <= mid ? move + a : move - 1

        if (current + move < distance) {
            track.push(move)
        } else {
            track.push(distance - current)
            break;
        }
        current += move
    }
    return track
}

module.exports = {
    getMoveTrack
}
