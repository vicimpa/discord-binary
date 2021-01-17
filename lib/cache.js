const path = require('path');
const fs = require('fs');

const cacheFolder = path.join(process.cwd(), "cache");
const cacheTypes = {
    USER: 'USER',
    VOICE: 'VOICE',
    AUTOKICK: "AUTOKICK",
    OTHER: 'OTHER'
};

exports.cacheTypes = cacheTypes
exports.cacheFolder = cacheFolder

/**
 * @description Записывает в кэш данные из data иначе, если data является falsy, то берём данные из кэша
 * 
 * @param {string} id Cache id
 * @param {keyof cacheTypes} cacheType Cache type
 * @param {Record<string, any>} [data] JSON Data to cache
 * 
 * @returns {Promise<Record<string, any> | undefined | boolean>}
 */
module.exports = async (id, cacheType, data = false) => {
    const type = cacheType.toLowerCase();

    const folder = path.join(cacheFolder, type);
    const file = path.join(cacheFolder, type, `${id}.json`);

    fs.mkdirSync(folder, {
        recursive: true
    });

    if (data) {
        try {
            JSON.parse(JSON.stringify(data));
        } catch(e) {
            throw new Error(`Данные не являются json значением`, e.message);
        }

        try {
            fs.writeFileSync(file, JSON.stringify(data));
        } catch (e) {
            console.warn('Не смогли записать данные в кэш: ', e.message);
            return false;
        }

        return true;
    }

    try {
        const fileData = fs.readFileSync(file, "utf8").toString();
        return JSON.parse(fileData);
    } catch(e) {}
}