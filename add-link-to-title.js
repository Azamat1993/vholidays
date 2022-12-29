const fs = require('fs');
const outputLinksFile = require('./files/output_links.json');

const copyOutputLinks = JSON.parse(JSON.stringify(outputLinksFile));

const order = [
    'krishna',
    'vedic',
    'wiki'
];

for (let i = 0; i < copyOutputLinks.length; i++) {
    const contents = copyOutputLinks[i].contents;
    const links = copyOutputLinks[i].links;
    if (!links) {
        continue;
    }
    let linkToUse = '';
    let titleToAlter = '';

    const linksMap = {};

    for(let j = 0; j < links.length; j++) {
        if (!linksMap[links[j].title]) {
            linksMap[links[j].title] = [];
        }
        linksMap[links[j].title].push(links[j]);
    }
    Object.keys(linksMap).forEach(key => {
        const links = linksMap[key];

        for (let o = 0; o < order.length; o++) {
            for (let k = 0; k < links.length; k++) {
                if (links[k].link.includes(order[o])) {
                    linkToUse = links[k].link;
                    titleToAlter = links[k].title
                }
            }
            if (linkToUse) {
                break;
            }
        }
        if (!linkToUse) {
            linkToUse = links[0];
        }
        if (titleToAlter) {
            for (let j = 0; j < copyOutputLinks[i].contents.length; j++) {
                if (copyOutputLinks[i].contents[j].includes(titleToAlter)) {
                    copyOutputLinks[i].contents[j] = formatTitle(copyOutputLinks[i].contents[j], titleToAlter, linkToUse);
                }
            }   
        }
    });
}

for (let i = 0; i < copyOutputLinks.length; i++) {
    delete copyOutputLinks[i].links;
}

fs.writeFileSync('./files/output_title_links.json', JSON.stringify(copyOutputLinks) ,{encoding:'utf8',flag:'w'})

function formatTitle(originalText, reg, link) {
    const href = `<a target="_blank" href="${link}">${reg}</a>`;
    return originalText.replace(reg, href);
}