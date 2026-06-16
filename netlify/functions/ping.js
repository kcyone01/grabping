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

    // 3. Process IP metadata proxying safely
    let ip = clientIp || "Unavailable";
    let isp = "Unknown ISP";
    try {
        const ipApiUrl = clientIp ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/';
        const ipResponse = await fetch(ipApiUrl);
        if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ip = ipData.ip || ip;
            isp = ipData.org || isp;
        }
    } catch (e) {
        console.error("Failed to query IP api lookup context:", e);
    }

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