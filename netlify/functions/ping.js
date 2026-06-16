// netlify/functions/ping.js
const { exec } = require("child_process");

exports.handler = async (event, context) => {
    // Note: 'ping' command availability can vary by environment. 
    // This uses a standard Linux ping execution.
    return new Promise((resolve) => {
        exec("ping -c 1 13.249.231.126", (error, stdout) => {
            if (error) {
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ status: "Unreachable", time: "N/A" }),
                });
                return;
            }
            const match = stdout.match(/time=([\d.]+)/);
            resolve({
                statusCode: 200,
                body: JSON.stringify({ 
                    status: "Online", 
                    time: match ? `${match[1]} ms` : "Success" 
                }),
            });
        });
    });
};