let startTime = process.argv[2],
  endTime = process.argv[3];

startTime = startTime ? Number(startTime) : 19;
endTime = endTime ? Number(endTime) : 21;

const doSth = () => {
    setTimeout(() => {
        console.log({ startTime, endTime });
    }, 1000)
};

module.exports = {
  doSth,
};
