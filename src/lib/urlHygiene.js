/**
 * Sanitizes URLs to ensure they are HTTPS and strips tracking query parameters.
 */
function sanitizeUrl(inputUrl) {
    try {
        const urlObj = new URL(inputUrl);
        
        // Ensure HTTPS
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
            throw new Error('Invalid protocol. Must be http or https.');
        }

        // List of common tracking parameters to strip
        const trackingParams = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'fbclid', 'gclid', 'ref', 'aff_id'
        ];

        trackingParams.forEach(param => {
            urlObj.searchParams.delete(param);
        });

        return urlObj.toString();
    } catch (error) {
        throw new Error('Invalid URL provided.');
    }
}

module.exports = { sanitizeUrl };
