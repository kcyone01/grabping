// netlify/functions/ping.js
exports.handler = async (event, context) => {
    const targetUrl = 'http://13.249.231.126'; // Target node
    
    // 1. Unpack client's connection IP directly from global gateway headers
    const clientIp = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || '';
    
    // 2. Perform HTTP availability test
    const start = Date.now();
    let status = "Unreachable";
    try {
        await fetch(targetUrl, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        status = "Online";
    } catch (e) {
        status = "Unreachable";
    }
    const end = Date.now();
    const pingTime = status === "Online" ? `${end - start} ms` : "Timeout";

    // 3. Process IP metadata proxying safely using ip-api.com
    let ip = clientIp || "Unavailable";
    let isp = "Unknown ISP";
    
    if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
        try {
            // We use HTTP here because ip-api.com allows unlimited server-side requests over HTTP
            const ipResponse = await fetch(`http://ip-api.com/json/${clientIp}`);
            if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                if (ipData.status === "success") {
                    ip = ipData.query || ip;
                    isp = ipData.isp || ipData.org || isp;
                }
            }
        } catch (e) {
            console.error("Backend failed to query alternative IP lookup:", e);
        }
    }

    // 4. Return unified JSON data structure back to the index.html page
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            ip: ip,
            isp: isp,
            time: pingTime
        })
    };
};
