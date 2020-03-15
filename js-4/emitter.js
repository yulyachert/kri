'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        events: new Map(),

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} return object
         */
        on: function (event, context, handler) {
            if (!this.events.get(event)) {
                this.events.set(event, []);
            }
            this.events.get(event).push({ context, handler });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} return object
         */
        off: function (event, context) {
            if (!this.events.get(event)) {
                this.events.set(event, []);
            }
            Array.from(this.events.keys())
                .filter((tempEvent) => tempEvent.startsWith(event + '.') || tempEvent === event)
                .forEach((tempEvent) => {
                    this.events.set(tempEvent, this.events
                        .get(tempEvent)
                        .filter((obj) => obj.context !== context));
                });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} return object
         */
        emit: function (event) {
            const splitEvent = event.split('.');
            let mergedEvents = [];
            mergedEvents.push(splitEvent[0]);
            for (let i = 1; i < splitEvent.length; i++) {
                mergedEvents.push(mergedEvents[i - 1] + '.' + splitEvent[i]);
            }
            mergedEvents.reverse();
            for (const mergeEvent of mergedEvents) {
                if (this.events.has(mergeEvent)) {
                    this.events.get(mergeEvent).forEach((obj) => {
                        if (obj.frequency !== undefined) {
                            if (obj.count++ % obj.frequency === 0) {
                                obj.handler.call(obj.context);
                            }
                        } else if (obj.times !== undefined) {
                            if (obj.times !== 0) {
                                obj.times--;
                                obj.handler.call(obj.context);
                            }
                        } else {
                            obj.handler.call(obj.context);
                        }
                    });
                }
            }

            return this;

        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} return object
         */
        several: function (event, context, handler, times) {
            if (!this.events.get(event)) {
                this.events.set(event, []);
            }

            if (times <= 0) {
                this.on(event, context, handler);
            } else {
                this.events.get(event).push({ context, handler, times });

            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} return object
         */
        through: function (event, context, handler, frequency) {
            if (!this.events.get(event)) {
                this.events.set(event, []);
            }

            if (frequency <= 0) {
                this.on(event, context, handler);
            } else {
                this.events.get(event).push({
                    context, handler,
                    frequency, count: 0
                });
            }

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
