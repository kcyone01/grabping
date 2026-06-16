exports.handler = async (event, context) => {
    const targetUrl = 'http://13.249.231.126'; // Your target destination
    
    // 1. Measure latency to the target destination
    const start = Date.now();
    let status = "Unreachable";
    try {
        // HEAD request checks if the server responds without downloading its full HTML page
        await fetch(targetUrl, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        status = "Online";
    } catch (e) {
        status = "Unreachable";
    }
    const end = Date.now();

    // 2. Safely fetch IP data server-side to prevent browser CORS and Rate Limiting (429)
    let ipData = { ip: "Limit Exceeded/Error", org: "Unknown ISP" };
    try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
            ipData = await ipRes.json();
        }
    } catch (e) {
        console.error("IP API Fetch failed:", e);
    }

    return {
        statusCode: 200,
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ 
            status: status, 
            time: status === "Online" ? `${end - start} ms` : "Timeout",
            ip: ipData.ip,
            isp: ipData.org
        }),
    };
};