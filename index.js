const xslx = require('xlsx');
const fs = require('fs');

const workbook = xslx.readFile('./files/kalendar-shri-vrindavan-dham-2017-2037.xlsx');

const data = workbook.Sheets[workbook.SheetNames[0]];
const lastRowNumber = data['!ref'].split(':')[1].substring(1);

const monthAbbrToMonthNum = {
    'Янв': 1,
    'Фев': 2,
    'Мар': 3,
    'Апр': 4,
    'Мая': 5,
    'ИюН': 6,
    'ИюЛ': 7,
    'Авг': 8,
    'Сен': 9,
    'Окт': 10,
    'Ноя': 11,
    'Дек': 12,
}

const dataToWrite = [];

for(let i = 3; i <= lastRowNumber; i++) {
    const dateCol = `A${i}`;
    const contentCol = `B${i}`;
    
    if (data[dateCol].v) {
        const date = data[dateCol].v.trim();
        const formattedDate = formatDate(date);
        const year = Number(formattedDate.split('-')[0]);
        if (year > 2030) {
            break;
        }
        if (year >= 2023) {
            dataToWrite.push({
                date: date,
                formattedDate: formatDate(date),
                contents: [],
            });
        }
    }

    if (dataToWrite.length > 0) {
        const contents = data[contentCol].v.trim();
        dataToWrite[dataToWrite.length - 1].contents.push(contents);
    }
}

fs.writeFileSync('./files/output.json', JSON.stringify(dataToWrite) ,{encoding:'utf8',flag:'w'})

function formatDate(date) {
    const parts = date.split(' ');
    // 1 - day
    // 2 - month
    // 3 - year
    // 4 - day of week
    if (parts.length !== 4) {
        throw 'Date should consist of 3 parts. Given date: ' + date + ' and given length of parts: ' + parts.length;
    }
    
    const month = monthAbbrToMonthNum[parts[1]];

    if (!month) {
        throw 'Month cant be parsed. Given date: ' + date;
    }
    const year = parts[2];
    const day = parts[0];
    return `${year}-${appendZero(month)}-${appendZero(day)}`;
}

function appendZero(num) {
    if (num < 10) {
        return `0${num}`;
    }
    return num;
}