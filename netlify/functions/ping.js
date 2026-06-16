exports.handler = async (event, context) => {
    const targetUrl = 'http://13.249.231.126'; // Target destination to test
    
    // 1. Grab the client's actual public IP from incoming Netlify routing headers
    const clientIp = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || '';
    
    // 2. Measure Server-Side Network Latency
    const start = Date.now();
    let pingStatus = "Unreachable";
    try {
        // Send a lightweight HEAD request to check if the target machine answers
        await fetch(targetUrl, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        pingStatus = "Online";
    } catch (e) {
        pingStatus = "Unreachable";
    }
    const end = Date.now();
    const pingTime = pingStatus === "Online" ? `${end - start} ms` : "Timeout";

    // 3. Fetch user geolocation data safely via server-side proxy
    let ip = clientIp || "Unavailable";
    let isp = "Unknown ISP";
    
    try {
        // Query the API using the explicit client IP extracted from the network header
        const ipApiUrl = clientIp ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/';
        const ipResponse = await fetch(ipApiUrl);
        
        if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ip = ipData.ip || ip;
            isp = ipData.org || isp;
        }
    } catch (e) {
        console.error("Backend failed to look up IP metadata:", e);
    }

    // 4. Return unified JSON data structure back to the index.html page
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" // Eradicates frontend CORS rules completely
        },
        body: JSON.stringify({
            ip: ip,
            isp: isp,
            pingStatus: pingStatus,
            pingTime: pingTime
        })
    };
};