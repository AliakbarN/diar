const path = require('path');

module.exports = {
    getView (file) {
        return path.normalize(`${__dirname}/../views/pages/${file}.ejs`);
    },
    comparison: class CalculateStrComparison {
        constructor (levenshtein) {
            this.levenshtein = levenshtein;
        }
    
        #clearStr (str) {
            let arr = str.split(' ').map( word => word.toLowerCase())
            const regex = /[A-Za-z0-9_]+/;
            
            let pureArr = arr.filter( word => {
                if (word.length >= 3 & regex.test(word)) return true;
            });
        
            return { text: pureArr.join(' '), arr: pureArr };
        };
    
        #checkSuitable (substr, str) {
            let result = [];
        
            substr.arr.forEach( subWord => {
                let arr = [];
        
                str.arr.forEach( word => {
                    arr.push([ this.levenshtein(subWord, word, { insWeight: 0.5 }), word, subWord ])
                });
    
                result.push(arr.sort( (a, b) => a[0] - b[0])[0])
            });
        
            return { separately: result, general: this.levenshtein(substr.text, str.text, { insWeight: 0.5 }) };
        };
    
        get (substr, str) {
            substr = this.#clearStr(substr.toLowerCase());
            str = this.#clearStr(str.toLowerCase());
    
            const { separately, general } = this.#checkSuitable(substr, str);
            let sumSep = 0;
            
            separately.forEach( arr => {
                sumSep += arr[0];
            })
            // console.log(separately, general, id);
            const diff = general - sumSep;
            return general / (diff === 0 ? 1 : diff);
        }
    }
}