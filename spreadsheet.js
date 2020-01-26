const GoogleSpreadSheet = require('google-spreadsheet');
const {promisify} = require('util');

const creds = require('./client_secret.json');
var fs = require('fs');
var dbFile = './sqlite.db'; // Our database file
var exists = fs.existsSync(dbFile); // Sync is okay since we're booting up
var sqlite3 = require('sqlite3').verbose(); // For long stack traces
var db = new sqlite3.Database(dbFile);
db.run('CREATE TABLE IF NOT EXISTS Students (id TEXT, studentname TEXT, gender  TEXT, classlevel  TEXT, homestate  TEXT, major  TEXT, extracurricularactivity TEXT,  UNIQUE(id))');

//insert or replace student in db
function addStudent(student){
    db.run('INSERT OR REPLACE INTO Students(id, studentname, gender , classlevel , homestate , major , extracurricularactivity) VALUES(?, ?, ?, ?, ?, ?, ?)', [student.id, student.studentname, student.gender , student.classlevel , student.homestate , student.major , student.extracurricularactivity], (err) => {
        if(err) {
            return console.log(err.message); 
        }
        console.log(`${student.studentname} was added to the table`);
    })
}

function showData(){
    let sql = `SELECT * FROM Students ORDER BY studentname`;

    db.all(sql, [], (err, rows) => {
    if (err) {
        throw err;
    }
    rows.forEach((row) => {
    console.log(row);
    });
    });

}

async function accessSpreadsheet() {
    const doc = new GoogleSpreadSheet('1B43eHiw_GfEibSeNS1xhDyY1hlkaks4zZ4kvVwB8gJs');
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    const sheet = info.worksheets[0];
    
    const rows = await promisify(sheet.getRows)({
        offset: 1
    });

    rows.forEach(student => {
        addStudent(student);
    });
    showData();
    
}
accessSpreadsheet();