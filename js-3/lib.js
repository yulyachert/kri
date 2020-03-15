'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
Iterator.prototype.getCircles = function () {
    let circles = [];
    let visited = new Set(this.friends.filter(friend => friend.best).map(f => f.name));
    circles.push(this.friends.filter(friend => friend.best));
    circles[0].sort((a, b) => a.name.localeCompare(b.name));
    if (circles[0].length === 0) {
        return [];
    }
    while (circles[circles.length - 1].length !== 0) {
        circles.push(this.createNextCircle(visited, circles[circles.length - 1]));
        circles[circles.length - 1].sort((a, b) => a.name.localeCompare(b.name));
    }

    return circles;
};

Iterator.prototype.createNextCircle = function (visited, circle) {
    let nextCircle = [];
    for (let friend of circle) {
        friend.friends.forEach((name) => {
            if (!visited.has(name)) {
                visited.add(name);
                nextCircle.push(this.friends.find(fr => fr.name === name));
            }
        });
    }

    return nextCircle;
};

Iterator.prototype.next = function () {
    if (!this.done()) {
        return this.tempCircles.shift();
    }

    return null;
};

Iterator.prototype.done = function () {
    return this.tempCircles.length === 0;
};

function Iterator(friends, filter) {
    if (! (filter instanceof Filter)) {
        throw new TypeError();
    }
    this.friends = friends;
    this.filter = filter;
    this.circles = this.getCircles(friends);
    this.tempCircles = this.circles.flat().filter(friend => this.filter.filter(friend));
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    if (maxLevel < 0) {
        maxLevel = 0;
    }
    if (! (filter instanceof Filter)) {
        throw new TypeError();
    }
    this.friends = friends;
    this.filter = filter;
    this.circles = this.getCircles(friends);
    this.tempCircles = this.getCircles(friends).slice(0, maxLevel)
        .flat()
        .filter(friend => filter.filter(friend));

}
LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */

function MaleFilter() {}
MaleFilter.prototype = Object.create(new Filter(),
    {
        constructor: {
            value: MaleFilter
        },
        filter: {
            value: (friend) => friend.gender === 'male'
        }
    });

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {}
FemaleFilter.prototype = Object.create(new Filter(),
    {
        constructor: {
            value: FemaleFilter
        },
        filter: {
            value: (friend) => friend.gender === 'female'
        }
    });

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
