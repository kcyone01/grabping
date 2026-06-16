// netlify/functions/ping.js
exports.handler = async (event, context) => {
    // We use a public, reliable URL to test reachability
    const targetUrl = 'http://13.249.231.126';

    try {
        const start = Date.now();
        // Use 'HEAD' request to minimize bandwidth; set a timeout
        const response = await fetch(targetUrl, { 
            method: 'HEAD', 
            signal: AbortSignal.timeout(2000) 
        });
        const end = Date.now();

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({ status: "Online", time: `${end - start} ms` }),
        };
    } catch (error) {
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({ status: "Unreachable", time: "Timeout/Error" }),
        };
    }
};