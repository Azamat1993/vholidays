const xslx = require('xlsx');
const fs = require('fs');

const workbook = xslx.readFile('./files/kalendar-shri-vrindavan-dham-2017-2037.xlsx');

const data = workbook.Sheets[workbook.SheetNames[0]];
const lastRowNumber = data['!ref'].split(':')[1].substring(1);

const monthAbbrToMonthNum = {
    'Янв': '01',
    'Фев': '02',
    'Мар': '03',
    'Апр': '04',
    'Мая': '05',
    'ИюН': '06',
    'ИюЛ': '07',
    'Авг': '08',
    'Сен': '09',
    'Окт': '10',
    'Ноя': '11',
    'Дек': '12',
}

const dataToWrite = [];

for(let i = 3; i <= lastRowNumber; i++) {
    const dateCol = `A${i}`;
    const contentCol = `B${i}`;
    
    if (data[dateCol].v) {
        dataToWrite.push({
            date: data[dateCol].v,
            formattedDate: formatDate(data[dateCol].v),
            contents: [],
        });
    }

    dataToWrite[dataToWrite.length - 1].contents.push(data[contentCol].v);
}

fs.writeFileSync('./files/output.json', JSON.stringify(dataToWrite) ,{encoding:'utf8',flag:'w'})

function formatDate(date) {
    const parts = date.trim().split(' ');
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
    return `${year}-${month}-${day}`;
}