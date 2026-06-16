const net = require('net');

exports.handler = async (event, context) => {
    const targetIp = '13.249.231.126';
    const port = 80; // Assuming HTTP. Change to 443 for HTTPS or any relevant port.

    return new Promise((resolve) => {
        const start = Date.now();
        const socket = new net.Socket();
        
        socket.setTimeout(2000); // 2-second timeout

        socket.on('connect', () => {
            const end = Date.now();
            socket.destroy();
            resolve({
                statusCode: 200,
                body: JSON.stringify({ status: "Online", time: `${end - start} ms` }),
            });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({
                statusCode: 200,
                body: JSON.stringify({ status: "Unreachable", time: "Timeout" }),
            });
        });

        socket.on('error', () => {
            resolve({
                statusCode: 200,
                body: JSON.stringify({ status: "Unreachable", time: "Error" }),
            });
        });

        socket.connect(port, targetIp);
    });
};