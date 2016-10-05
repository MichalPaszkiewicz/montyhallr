const fs = require("fs");
const exec = require('child_process').exec;

fs.watch("./index.ts", (eventType, filename)=>{
    console.log("event type: " + eventType + "\r\nfile name: " + filename + "\r\n");

    exec("tsc index.ts", (error, stdout, stderr)=>{
        if(error){
            console.error(error);
        }
    });

});