export const handler = async (event, context) => {
    const targetUrl = 'http://13.249.231.126'; // Target server

    try {
        const start = Date.now();
        // We use 'HEAD' to check reachability without downloading the whole page
        const response = await fetch(targetUrl, { 
            method: 'HEAD', 
            signal: AbortSignal.timeout(2000) 
        });
        const end = Date.now();

        return {
            statusCode: 200,
            body: JSON.stringify({ status: "Online", time: `${end - start} ms` }),
        };
    } catch (error) {
        return {
            statusCode: 200,
            body: JSON.stringify({ status: "Unreachable", time: "Timeout/Error" }),
        };
    }
};