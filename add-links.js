const axios = require('axios');
const fs = require('fs');
const outputFile = require('./files/output.json');
const credentials = require('./credentials.json');

// https://www.googleapis.com/customsearch/v1?key=INSERT_YOUR_API_KEY&cx=017576662512468239146:omuauf_lfve&q=lectures

const map = {};

const outputCopy = JSON.parse(JSON.stringify(outputFile));

const prefixesToEscape = [
    'Прерыв.поста',
    '----',
    'Солнца входит',
    'молочный пост',
    'Чатурмасьи',
    'ост до полудня',
    'ост до полуночи',
    'ост на йогурт',
    'ост на зелень',
    'ост до сумерек',
    'ост до восхода',
    'ост был вчера',
    'ост на урад',
    'отальный пост',
    'ост до захода',
];

const strsToExclude = [
    {
        str: ' -- Явление',
        type: 1,
    },
    {
        str: ' - Явление',
        type: 1,
    },
    {
        str: ' -- Уход',
        type: 2,
    },
    {
        str: ' - Уход',
        type: 2,
    },
    {
        str: 'Первый день ',
        type: 3
    },
    {
        str: 'Последний день ',
        type: 4,
    },
    {
        str: 'Пост ',
        type: 5
    },
    {
        str: ' начинается',
        type: 6
    },
    {
        str: 'Начало ',
        type: 6,
    },
    {
        str: ' заканчивается',
        type: 7,
    },
    {
        str: 'Окончание ',
        type: 7
    }
];

const types = {
    1: 'Явление',
    2: 'Уход',
    3: 'Первый день',
    4: 'Последний день',
    5: 'Пост',
    6: 'Начинается',
    7: 'Заканчивается'
};

for(let i = 0; i < outputFile.length; i++) {
    const contents = outputFile[i].contents;

    for(let j = 0; j < contents.length; j++) {
        if (canBeEscaped(contents[j])) {
            continue;
        }

        const [content, type] = tryToSlice(contents[j]);

        if (!map[content]) {
            map[content] = {
                indexes: [],
                amount: 0,
                results: [],
            };
        }
    
        map[content].indexes.push(i);
        map[content].amount++;
    }
}

function canBeEscaped(str) {
    for (let i = 0; i < prefixesToEscape.length; i++) {
        if (str.includes(prefixesToEscape[i])) {
            return true;
        }
    }
    return false;
}

function tryToSlice(str) {
    for (let i = 0; i < strsToExclude.length; i++) {
        if (str.includes(strsToExclude[i].str)) {
            return [str.replace(strsToExclude[i].str, ''), strsToExclude[i].type];
        }
    }
    return [str, 0];
}

const keys = Object.keys(map);

async function traverse(keyIndex) {
    if (keyIndex === keys.length) {
        return;
    }
    console.log('sending request for', keys[keyIndex]);
    return axios
        .get(`https://www.googleapis.com/customsearch/v1?key=${credentials.google_search_api_key}&cx=${credentials.google_search_engine_id}&q=${keys[keyIndex]}`)
        .then(function(response) {
            const responseItems = response.data.items;
            const results = [];
            if (responseItems) {
                for (let i = 0; i < responseItems.length && i < 5; i++) {
                    results.push({
                        title: keys[keyIndex],
                        link: responseItems[i].link,
                    });
                }
            }
            if (results.length > 0) {
                map[keys[keyIndex]].results = results;
                const indexes = map[keys[keyIndex]].indexes;
                for (let j = 0; j < indexes.length; j++) {
                    const index = indexes[j];
                    if (!outputCopy[index].links) {
                        outputCopy[index].links = [];
                    }
    
                    for (let o = 0; o < results.length && o < 5; o++) {
                        outputCopy[index].links.push({
                            title: results[o].title,
                            link: results[o].link,
                        });
                    }
                }
            }
            return traverse(keyIndex + 1);
        })
        .catch(function(err) {
            console.log('the error is ', err);
        });
}

traverse(0).then((x) => {
    console.log('started to write');
    fs.writeFileSync('./files/output_links.json', JSON.stringify(outputCopy) ,{encoding:'utf8',flag:'w'})
});
console.log(Object.keys(map).length);