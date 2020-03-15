/* eslint-env mocha */
/* eslint-disable no-shadow */
'use strict';

const assert = require('assert');

const { getEmitter, isStar } = require('./emitter');

const students = {
    Sam: {
        focus: 100,
        wisdom: 50
    },
    Sally: {
        focus: 100,
        wisdom: 60
    },
    Bill: {
        focus: 90,
        wisdom: 50
    },
    Sharon: {
        focus: 110,
        wisdom: 40
    }
};

const lecturer = getEmitter()
    .on('begin', students.Sam, function () {
        this.focus += 10;
    })
    .on('begin', students.Sally, function () {
        this.focus += 10;
    })
    .on('begin', students.Bill, function () {
        this.focus += 10;
        this.wisdom += 5;
    })
    .on('begin', students.Sharon, function () {
        this.focus += 20;
    })
    .on('slide', students.Sam, function () {
        this.wisdom += Math.round(this.focus * 0.1);
        this.focus -= 10;
    })
    .on('slide', students.Sally, function () {
        this.wisdom += Math.round(this.focus * 0.15);
        this.focus -= 5;
    })
    .on('slide', students.Bill, function () {
        this.wisdom += Math.round(this.focus * 0.05);
        this.focus -= 10;
    })
    .on('slide', students.Sharon, function () {
        this.wisdom += Math.round(this.focus * 0.01);
        this.focus -= 5;
    })
    .on('slide.funny', students.Sam, function () {
        this.focus += 5;
        this.wisdom -= 10;
    })
    .on('slide.funny', students.Sally, function () {
        this.focus += 5;
        this.wisdom -= 5;
    })
    .on('slide.funny', students.Bill, function () {
        this.focus += 5;
        this.wisdom -= 10;
    })
    .on('slide.funny', students.Sharon, function () {
        this.focus += 10;
        this.wisdom -= 10;
    });

describe('lecturer-emitter', () => {
    it('должен всех оповестить о старте лекции', () => {
        lecturer.emit('begin');
        assert.strictEqual(
            getState(students),
            'Sam(110,50); Sally(110,60); Bill(100,55); Sharon(130,40)'
        );
    });

    it('должен донести слайды до всех', () => {
        lecturer
            .emit('slide.text')
            .emit('slide.text')
            .emit('slide.text')
            .emit('slide.funny');

        assert.strictEqual(
            getState(students),
            'Sam(75,79); Sally(95,118); Bill(65,63); Sharon(120,34)'
        );
    });

    it('не должен доносить смешные слайды до Шерон', () => {
        lecturer
            .off('slide.funny', students.Sharon)
            .emit('slide.text')
            .emit('slide.text')
            .emit('slide.funny');

        assert.strictEqual(
            getState(students),
            'Sam(50,90); Sally(85,155); Bill(40,62); Sharon(105,37)'
        );
    });

    it('не должен доносить вообще слайды до Билла', () => {
        lecturer
            .off('slide', students.Bill)
            .emit('slide.text')
            .emit('slide.text')
            .emit('slide.text');

        assert.strictEqual(
            getState(students),
            'Sam(20,102); Sally(70,191); Bill(40,62); Sharon(90,40)'
        );
    });

    it('должен тихо завершить лекцию', () => {
        lecturer.emit('end');

        assert.strictEqual(
            getState(students),
            'Sam(20,102); Sally(70,191); Bill(40,62); Sharon(90,40)'
        );
    });

    if (isStar) {
        describe('Особая лекция для Билла и Сэма', () => {
            const students = {
                Sam: {
                    focus: 100,
                    wisdom: 50
                },
                Bill: {
                    focus: 90,
                    wisdom: 50
                }
            };

            const lecturer = getEmitter()
                .several('begin', students.Sam, function () {
                    this.focus += 10;
                }, 1)
                .several('begin', students.Bill, function () {
                    this.focus += 10;
                    this.wisdom += 5;
                }, 1)
                // На Сэма действуют только нечетные слайды
                .through('slide', students.Sam, function () {
                    this.wisdom += Math.round(this.focus * 0.1);
                    this.focus -= 10;
                }, 2)
                // Концентрации Билла хватит ровно на 4 слайда
                .several('slide', students.Bill, function () {
                    this.wisdom += Math.round(this.focus * 0.05);
                    this.focus -= 10;
                }, 4)
                .on('slide.funny', students.Sam, function () {
                    this.focus += 5;
                    this.wisdom -= 10;
                })
                .several('slide.funny', students.Bill, function () {
                    this.focus += 5;
                    this.wisdom -= 10;
                }, 1);

            it('[*] должен всех оповестить о старте лекции', () => {
                lecturer.emit('begin');
                assert.strictEqual(
                    getState(students),
                    'Sam(110,50); Bill(100,55)'
                );
            });

            it('[*] не должен оповестить о старте лекции', () => {
                lecturer.emit('begin');
                assert.strictEqual(
                    getState(students),
                    'Sam(110,50); Bill(100,55)'
                );
            });

            it('[*] должен донести до Билла все слайды, а до Сэма – нечетные', () => {
                lecturer
                    .emit('slide.text')
                    .emit('slide.text')
                    .emit('slide.text')
                    .emit('slide.funny');

                assert.strictEqual(
                    getState(students),
                    'Sam(95,61); Bill(65,63)'
                );
            });

            it('[*] не должен доносить любые слайды до Билла', () => {
                lecturer
                    .emit('slide.text')
                    .emit('slide.text')
                    .emit('slide.text')
                    .emit('slide.funny');

                assert.strictEqual(
                    getState(students),
                    'Sam(80,70); Bill(65,63)'
                );
            });

            it('[*] отписка от slide для Сэма', () => {
                lecturer
                    .off('slide', students.Sam)
                    .emit('slide.text')
                    .emit('slide.text')
                    .emit('slide.text')
                    .emit('slide.funny') // от slide.funny тоже отписывается
                    .emit('slide.funny'); // от slide.funny тоже отписывается

                assert.strictEqual(
                    getState(students),
                    'Sam(80,70); Bill(65,63)'
                );
            });

            it('[*] новая подписка на begin', () => {
                lecturer
                    .through('begin', students.Sam, function () {
                        this.focus += 100;
                    }, 2)
                    .through('begin', students.Bill, function () {
                        this.focus += 100;
                        this.wisdom += 50;
                    }, 2)
                    .emit('begin')
                    .emit('begin')
                    .off('begin', students.Sam)
                    .off('begin', students.Bill);
                assert.strictEqual(
                    getState(students),
                    'Sam(180,70); Bill(165,113)'
                );
            });

            it('[*] неправильные параметры several и through', () => {
                lecturer
                    .through('begin', students.Sam, function () {
                        this.focus += 100;
                    }, 0)
                    .several('begin', students.Bill, function () {
                        this.focus += 100;
                        this.wisdom += 50;
                    }, 0)
                    .emit('begin')
                    .emit('begin')
                    .off('begin', students.Sam)
                    .off('begin', students.Bill);
                assert.strictEqual(
                    getState(students),
                    'Sam(380,70); Bill(365,213)'
                );
            });
        })
    }
})


function getState(students) {
    return Object.keys(students)
        .map(name => [
            name,
            '(',
            students[name].focus,
            ',',
            students[name].wisdom,
            ')'
        ].join(''))
        .join('; ');
}
