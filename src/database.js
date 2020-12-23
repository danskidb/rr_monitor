const fs = require('fs');
const path = require('path');

var database = {

    // cache db here maybe?

    readDB: function() {
        var data = fs.readFileSync(path.join(__dirname, "../runtimedb.json"));
        return JSON.parse(data.toString());
    },
    
    saveDB: function(db){
        const data = JSON.stringify(db);
    
        fs.writeFile(path.join(__dirname, "../runtimedb.json"), data, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        });
    }
}

module.exports = database;