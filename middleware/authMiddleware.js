// Middleware to protect routes with an API key
const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'Access denied. No API key provided.' });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: 'Access denied. Invalid API key.' });
    }

    next(); // Key is valid, proceed to the actual route
};

module.exports = requireApiKey;
