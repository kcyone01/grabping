// netlify/functions/ping.js
exports.handler = async (event, context) => {
    const targetUrl = 'http://13.249.231.126'; // Target server to ping
    
    // 1. Measure latency to the target
    const start = Date.now();
    let status = "Unreachable";
    try {
        await fetch(targetUrl, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        status = "Online";
    } catch (e) {
        status = "Unreachable";
    }

    // 2. Proxy IP info to avoid CORS errors
    let ipData = { ip: "N/A", org: "N/A" };
    try {
        const ipRes = await fetch('https://ipapi.co/json/');
        ipData = await ipRes.json();
    } catch (e) {}

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            status, 
            time: `${Date.now() - start} ms`,
            ip: ipData.ip,
            isp: ipData.org
        }),
    };
};