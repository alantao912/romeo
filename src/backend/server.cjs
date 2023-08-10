const express = require('express');
var cors = require('cors');
const app = express();
app.use(cors());

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const spawn = require('child_process').spawn;

app.post('/chess', jsonParser, function(req, res, next) {
    const child = spawn('./src/backend/juliette', ['cli'], {
        detached: false,
        stdio: ['pipe', 'pipe', process.stderr]
    });
    child.stdin.setDefaultEncoding('utf-8');
    child.stdin.write("uci\n");
    child.stdin.write("ucinewgame\n");
    child.stdin.write("position " + req.body.position + " \n");
    child.stdin.write("go movetime " + String(req.body.remainingTime) + "\n");
    child.stdout.on('data', function(data) {
        const flag = "bestmove: ";
        let flagIndex = data.toString().indexOf(flag);
        if (flagIndex !== -1) {
            res.json({"bestmove" : data.toString().substring(flagIndex + flag.length).trim()});
        }
    });
});


const portNo = 3000;
app.listen(portNo);
console.log("Server initialized successfully! Listening on port " + portNo);