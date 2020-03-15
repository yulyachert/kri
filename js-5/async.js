'use strict';

/**
 * Сделано задание на звездочку.
 * Реализована остановка промиса по таймауту.
 */
const isStar = true;

/**
 * Функция паралелльно запускает указанное число промисов
 *
 * @param {Function<Promise>[]} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise<Array>}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let execJobResult = [];
    let currentJob = 0;
    let currentExecJob = 0;
    if (jobs.length === 0) {
        return Promise.resolve(jobs);
    }
    function runOneJob(indexOfJob, resolve) {
        const errorPromise = new Promise(function (_, reject) {
            setTimeout(reject, timeout, new Error('Promise timeout'));
        });
        const promise = Promise.resolve(jobs[indexOfJob]());
        Promise.race([errorPromise, promise])
            .then((res) => {
                execJobResult[indexOfJob] = res;
                currentExecJob += 1;
            })
            .catch((res) => {
                execJobResult[indexOfJob] = res;
                currentExecJob += 1;
            })
            .finally(() => {
                if (currentJob !== jobs.length) {
                    runOneJob(currentJob, resolve
                    );
                    currentJob += 1;
                }
                if (jobs.length === currentExecJob) {
                    resolve(execJobResult);
                }
            });
    }

    return new Promise(function (resolve) {
        for (let i = 0; i < parallelNum; ++i) {
            runOneJob(currentJob, resolve);
            currentJob += 1;
        }
    });
}

module.exports = {
    runParallel,
    isStar
};
