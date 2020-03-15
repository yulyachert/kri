'use strict';

/**
 * Телефонная книга
 */
const phoneBook = new Map();

function createContact(name) {
    if (!phoneBook.has(name)) {
        phoneBook.set(name, { phone: [], email: [] });
    }
}

function processCreateCommand(commandsSep, querySep, command) {
    if (commandsSep[1] !== 'контакт') {
        syntaxError(querySep.indexOf(command) + 1, commandsSep[0].length + 2);
    }
    createContact(commandsSep.slice(2).join(' '));
}

function deleteContact(name) {
    phoneBook.delete(name);
}

function processSimpleDeleteCommand(commandsSep, querySep, command) {
    if (commandsSep[1] !== 'контакт') {
        syntaxError(querySep.indexOf(command) + 1, commandsSep[0].length + 2);
    }
    deleteContact(commandsSep.slice(2).join(' '));
}

function countSymbolsBeforeMistake(commandsSep, index) {
    let sum = 0;
    for (let i = 0; i <= index; i++) {
        sum += commandsSep[i].length + 1;
    }

    return sum;
}

function deleteContactByRequest(request) {
    if (request === '') {
        return;
    }
    for (const contacts of phoneBook) {
        if (contacts[0].includes(request) ||
            contacts[1].email.some(email => email.includes(request)) ||
            contacts[1].phone.some(phone => phone.includes(request))) {
            deleteContact(contacts[0]);
        }
    }
}

function deletePhoneAndMailToContact(name, mails, phones) {
    let contact = phoneBook.get(name);

    if (typeof contact !== 'undefined') {
        deleteInfo(mails, contact, 'email');
        deleteInfo(phones, contact, 'phone');
    }
}

function deleteInfo(list, contact, listType) {
    for (const elem of list) {
        if (contact[listType].includes(elem)) {
            contact[listType].splice(contact[listType].indexOf(elem), 1);
        }
    }
}

function processDeleteWithRequestCommand(commandsSep, querySep, command) {
    if (commandsSep[1] !== 'контакты,') {
        syntaxError(querySep.indexOf(command) + 1, countSymbolsBeforeMistake(commandsSep, 0) + 1);
    }

    if (commandsSep[2] !== 'где') {
        syntaxError(querySep.indexOf(command) + 1, countSymbolsBeforeMistake(commandsSep, 1) + 1);
    }

    if ((commandsSep[3]) !== 'есть') {
        syntaxError(querySep.indexOf(command) + 1, countSymbolsBeforeMistake(commandsSep, 2) + 1);
    }

    deleteContactByRequest(commandsSep.slice(4).join(' '));
}

function processDeleteInfoOfCommand(commandSep, querySep, command) {
    let params = commandSep.slice(1, commandSep.indexOf('для'));
    let previousIndex = commandSep.indexOf('для');
    const parsedParams = parseParams(params, querySep, command, commandSep);

    if (commandSep[previousIndex + 1] !== 'контакта') {
        syntaxError(querySep.indexOf(command) + 1,
            countSymbolsBeforeMistake(commandSep, previousIndex) + 1);
    }
    let query = commandSep.slice(previousIndex + 2).join(' ');

    deletePhoneAndMailToContact(query, parsedParams[0], parsedParams[1]);
}

function processDeleteCommand(commandSep, querySep, command) {
    if (commandSep[1] === 'контакт') {
        processSimpleDeleteCommand(commandSep, querySep, command);
    } else if (commandSep[1] === 'контакты,') {
        processDeleteWithRequestCommand(commandSep, querySep, command);
    } else {
        processDeleteInfoOfCommand(commandSep, querySep, command);
    }

}

function unionChecking(command, commandSep, querySep, params) {
    const validParams = ['имя', 'почты', 'телефоны'];
    let resultParams = [];
    let currentSymbol = 1;
    for (const param of params) {
        if (validParams.includes(param) && currentSymbol % 2 === 1) {
            resultParams.push(param);
            currentSymbol++;
        } else if (param === 'и' && currentSymbol % 2 === 0) {
            currentSymbol++;
        } else {
            syntaxError(querySep.indexOf(command) + 1,
                countSymbolsBeforeMistake(commandSep, currentSymbol - 1) + 1);
        }
    }

    return resultParams;
}

function parseShowParams(params, commandSep, querySep, command) {
    let resultParams = [];
    let currentSymbol = 1;
    resultParams = unionChecking(command, commandSep, querySep, params);
    if (params[params.length - 1] === 'и') {
        syntaxError(querySep.indexOf(command) + 1,
            countSymbolsBeforeMistake(commandSep, currentSymbol - 1) + 1);
    }

    return resultParams;
}

function processShowInfoOfContact(commandSep, querySep, command) {
    let params = commandSep.slice(1, commandSep.indexOf('для'));
    let previousIndex = commandSep.indexOf('для');
    let parsedParams = parseShowParams(params, commandSep, querySep, command);

    if (commandSep[previousIndex + 1] !== 'контактов,') {
        syntaxError(querySep.indexOf(command) + 1,
            countSymbolsBeforeMistake(commandSep, previousIndex) + 1);
    }

    if (commandSep[previousIndex + 2] !== 'где') {
        syntaxError(querySep.indexOf(command) + 1,
            countSymbolsBeforeMistake(commandSep, previousIndex + 1) + 1);
    }

    if (commandSep[previousIndex + 3] !== 'есть') {
        syntaxError(querySep.indexOf(command) + 1,
            countSymbolsBeforeMistake(commandSep, previousIndex + 2) + 1);
    }

    let query = commandSep.slice(previousIndex + 4).join(' ');

    return showNameOrMailOrPhone(query, parsedParams) || [];
}

function validatePhone(phone) {
    const regExp = /^\d{10}$/;

    return (phone.match(regExp));
}

function deleteNestingMail(params, commandSep, index, i) {
    if (i + 1 === params.length) {
        syntaxError(index + 1,
            countSymbolsBeforeMistake(commandSep, i + 1) + 1);
    }
}

function deleteNestingPhone(params, commandSep, index, i) {
    if (i + 1 === params.length || !validatePhone(params[i + 1])) {
        syntaxError(index + 1,
            countSymbolsBeforeMistake(commandSep, i + 1) + 1);
    }
}

function sepChecking(params, querySep, command, commandSep) {
    if (params[params.length - 1] === 'и') {
        syntaxError(querySep.indexOf(command) + 1,
            countSymbolsBeforeMistake(commandSep, params.length - 1) + 1);
    }
}

function parseParamsCheck(params, currentSymbol, i, type) {
    return params[i] === type && currentSymbol % 2 === 1;
}

function tooManyStatements(listType, params, i, currentSymbol) {
    listType.push(params[i + 1]);
    currentSymbol++;
    i++;

    return [currentSymbol, i];
}

function parseParams(params, querySep, command, commandSep) {
    let phoneList = [];
    let mailList = [];
    let currentSymbol = 1;
    for (let i = 0; i < params.length; i++) {
        if (parseParamsCheck(params, currentSymbol, i, 'почту')) {
            deleteNestingMail(params, commandSep, querySep.indexOf(command), i);
            [currentSymbol, i] = tooManyStatements(mailList, params, i, currentSymbol);
        } else if (parseParamsCheck(params, currentSymbol, i, 'телефон')) {
            deleteNestingPhone(params, commandSep, querySep.indexOf(command), i);
            [currentSymbol, i] = tooManyStatements(phoneList, params, i, currentSymbol);
        } else if (params[i] === 'и' && currentSymbol % 2 === 0) {
            currentSymbol++;
        } else {
            syntaxError(querySep.indexOf(command) + 1,
                countSymbolsBeforeMistake(commandSep, i) + 1);
        }
    }
    sepChecking(params, querySep, command, commandSep);

    return [mailList, phoneList];
}

function processAddInfoOfCommand(commandSep, querySep, command) {
    let params = commandSep.slice(1, commandSep.indexOf('для'));
    let previousIndex = commandSep.indexOf('для');
    const parsedParams = parseParams(params, querySep, command, commandSep);

    if (commandSep[previousIndex + 1] !== 'контакта') {
        syntaxError(querySep.indexOf(command) + 1,
            countSymbolsBeforeMistake(commandSep, previousIndex) + 1);
    }
    let query = commandSep.slice(previousIndex + 2).join(' ');

    addPhoneAndMailToContact(query, parsedParams[0], parsedParams[1]);
}

function addPhoneAndMailToContact(name, mails, phones) {
    let contact = phoneBook.get(name);

    if (typeof contact !== 'undefined') {
        pushInfo(mails, contact, 'email');
        pushInfo(phones, contact, 'phone');
    }
}

function pushInfo(list, contact, listType) {
    for (const elem of list) {
        if (!contact[listType].includes(elem)) {
            contact[listType].push(elem);
        }
    }
}

function processPhoneCase(contacts, tempLine) {
    let formattedPhones = [];
    const phoneRegexp = /(\d{3})(\d{3})(\d{2})(\d{2})/;

    for (const phone of contacts[1].phone) {
        formattedPhones.push(phone.replace(phoneRegexp, '+7 ($1) $2-$3-$4'));
    }
    tempLine.push(formattedPhones.join(','));
}

function createInfoForContact(list, contacts) {
    let tempLine = [];
    for (const elem of list) {
        switch (elem) {
            case 'имя':
                tempLine.push(contacts[0]);
                break;
            case 'почты':
                tempLine.push(contacts[1].email.join(','));
                break;
            case 'телефоны':
                processPhoneCase(contacts, tempLine);
                break;
            default:
                return;
        }
    }

    return tempLine;
}

function pushInfoAboutContact(tempLine, request, list, result) {
    for (const contacts of phoneBook) {
        if (contacts[0].includes(request) ||
            contacts[1].email.some(email => email.includes(request)) ||
            contacts[1].phone.some(phone => phone.includes(request))) {
            tempLine = createInfoForContact(list, contacts);
        }
        if (tempLine.length !== 0) {
            result.push(tempLine.join(';'));
        }
        tempLine = [];
    }
}

function showNameOrMailOrPhone(request, list) {
    let result = [];
    let tempLine = [];

    if (request === '') {
        return;
    }
    pushInfoAboutContact(tempLine, request, list, result);

    return result;
}

/**
 * Вызывайте эту функцию, если есть синтаксическая ошибка в запросе
 * @param {number} lineNumber – номер строки с ошибкой
 * @param {number} charNumber – номер символа, с которого запрос стал ошибочным
 */
function syntaxError(lineNumber, charNumber) {
    throw new Error(`SyntaxError: Unexpected token at ${lineNumber}:${charNumber}`);
}


function edgeCase(command, querySep) {
    if (querySep.indexOf(command) === querySep.length - 1 && command === '') {

        return;
    }
    syntaxError(querySep.indexOf(command) + 1, 1);
}

function processQueryCommands(commandsSep, querySep, command, result) {

    switch (commandsSep[0]) {
        case 'Создай':
            processCreateCommand(commandsSep, querySep, command);
            break;
        case 'Удали':
            processDeleteCommand(commandsSep, querySep, command);
            break;
        case 'Добавь':
            processAddInfoOfCommand(commandsSep, querySep, command);
            break;
        case 'Покажи':
            result = result.concat(processShowInfoOfContact(commandsSep, querySep, command));
            break;
        default:
            edgeCase(command, querySep);
    }

    return result;
}

/**
 * Выполнение запроса на языке pbQL
 * @param {string} query
 * @returns {string[]} - строки с результатами запроса
 */

function run(query) {
    const querySep = query.split(';');
    let result = [];

    for (const command of querySep) {
        const commandsSep = command.split(' ');
        result = processQueryCommands(commandsSep, querySep, command, result);
    }
    if (querySep[querySep.length - 1] !== '') {
        syntaxError(querySep.length, querySep[querySep.length - 1].length + 1);
    }

    return result;
}

module.exports = { phoneBook, run };


