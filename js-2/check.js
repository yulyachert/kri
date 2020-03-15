'use strict';

exports.init = function () {
    return;
};

function isValidType(obj) {
    return (typeof obj === 'object' || Array.isArray(obj)) && obj !== null;
}

function containsKeys(keys, obj) {
    return keys.every(key => key in obj);
}

function hasKeys(keys, obj) {
    const objKeys = Object.keys(obj);

    return keys.every(key => key in obj && objKeys.length === keys.length);
}

function containsValues(values, obj) {
    let objValues = Object.values(obj);

    return values.every(value => objValues.includes(value));
}

function hasValues(values, obj) {
    let objValues = Object.values(obj);

    return values.every(value => objValues.includes(value)) && values.length === objValues.length;
}

function hasValueType(key, type, obj) {
    const types = [String, Function, Number, Array];

    return types.includes(type) && key in obj && obj[key].constructor === type;
}

function hasLength(length, obj) {
    return obj.length === length;
}

function hasParamsCount(count, obj) {
    return obj.length === count;
}

function hasWordsCount(count, obj) {
    let result;
    result = obj.split(' ').filter((sym) => sym !== '');

    return result.length === count;
}

Object.defineProperty(Object.prototype, 'check', {
    get: function () {
        return {
            containsKeys: (keys) => containsKeys(keys, this),
            hasKeys: (keys) => hasKeys(keys, this),
            containsValues: (values) => containsValues(values, this),
            hasValues: (values) => hasValues(values, this),
            hasValueType: (key, type) => hasValueType(key, type, this),
            not: {
                containsKeys: (keys) => !containsKeys(keys, this),
                hasKeys: (keys) => !hasKeys(keys, this),
                containsValues: (values) => !containsValues(values, this),
                hasValues: (values) => !hasValues(values, this),
                hasValueType: (key, type) => !hasValueType(key, type, this)
            }
        };
    }
});

Object.defineProperty(Array.prototype, 'check', {
    get: function () {
        return {
            containsKeys: (keys) => containsKeys(keys, this),
            hasKeys: (keys) => hasKeys(keys, this),
            containsValues: (values) => containsValues(values, this),
            hasValues: (values) => hasValues(values, this),
            hasValueType: (key, type) => hasValueType(key, type, this),
            hasLength: (length) => hasLength(length, this),
            not: {
                containsKeys: (keys) => !containsKeys(keys, this),
                hasKeys: (keys) => !hasKeys(keys, this),
                containsValues: (values) => !containsValues(values, this),
                hasValues: (values) => !hasValues(values, this),
                hasValueType: (key, type) => !hasValueType(key, type, this),
                hasLength: (length) => !hasLength(length, this)
            }
        };
    }
});

Object.defineProperty(Function.prototype, 'check', {
    get: function () {
        return {
            hasParamsCount: (count) => hasParamsCount(count, this),
            not: {
                hasParamsCount: (count) => !hasParamsCount(count, this)
            }
        };
    }
});

Object.defineProperty(String.prototype, 'check', {
    get: function () {
        return {
            hasLength: (length) => hasLength(length, this),
            hasWordsCount: (count) => hasWordsCount(count, this),
            not: {
                hasLength: (length) => !hasLength(length, this),
                hasWordsCount: (count) => !hasWordsCount(count, this)
            }
        };
    }
});

exports.wrap = function (obj) {
    return {
        containsKeys: (keys) => {
            return isValidType(obj) && containsKeys(keys, obj);
        },
        hasKeys: (keys) => {
            return isValidType(obj) && hasKeys(keys, obj);
        },
        containsValues: (values) => {
            return isValidType(obj) && containsValues(values, obj);
        },
        hasValues: (values) => {
            return isValidType(obj) && hasValues(values, obj);
        },
        hasValueType: (key, type) => {
            return isValidType(obj) && hasValueType(key, type, obj);
        },
        hasLength: (length) => {
            return (Array.isArray(obj) || typeof obj === 'string') && hasLength(length, obj);
        },
        hasParamsCount: (count) => {
            return obj !== null && typeof obj === 'function' && hasParamsCount(count, obj);
        },
        hasWordsCount: (count) => {
            return obj !== null && typeof obj === 'string' && hasWordsCount(count, obj);

        },
        isNull: () => {
            return obj === null;
        },
        not: {
            containsKeys: (keys) => {
                return !(isValidType(obj) && containsKeys(keys, obj));
            },
            hasKeys: (keys) => {
                return !(isValidType(obj) && hasKeys(keys, obj));
            },
            containsValues: (values) => {
                return !(isValidType(obj) && containsValues(values, obj));
            },
            hasValues: (values) => {
                return !(isValidType(obj) && hasValues(values, obj));
            },
            hasValueType: (key, type) => {
                return !(isValidType(obj) && hasValueType(key, type, obj));
            },
            hasLength: (length) => {
                return !(typeof obj === 'string' && Array.isArray(obj) && hasLength(length, obj));
            },
            hasParamsCount: (count) => {
                return !(typeof obj === 'function' && hasParamsCount(count, obj));
            },
            hasWordsCount: (count) => {
                return !(typeof obj === 'string' && hasWordsCount(count, obj));
            },
            isNull: () => {
                return obj !== null;
            }
        }
    };
};
