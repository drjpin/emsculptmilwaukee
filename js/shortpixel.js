// ShortPixel Image Optimization
// Automatically optimizes images using ShortPixel CDN

(function() {
    'use strict';
    
    // Configuration
    const SHORTPIXEL_CDN = 'cdn.shortpixel.ai';
    const QUALITY = 'lossy'; // lossy, glossy, or lossless
    const CONVERT_TO_WEBP = true;
    const SITE_URL = 'https://emsculptmilwaukee.com';
    
    // Function to optimize image URL
    function optimizeImageUrl(originalUrl, img) {
        // Skip if already using ShortPixel
        if (originalUrl.includes(SHORTPIXEL_CDN)) {
            return originalUrl;
        }
        
        // Skip data URLs and SVGs
        if (originalUrl.startsWith('data:') || originalUrl.endsWith('.svg')) {
            return originalUrl;
        }
        
        // Make sure URL is absolute
        let fullUrl = originalUrl;
        if (!originalUrl.startsWith('http')) {
            fullUrl = SITE_URL + '/' + originalUrl.replace(/^\//, '');
        }
        
        // Get image dimensions from element
        const width = img.naturalWidth || img.width || '';
        
        // Build ShortPixel URL
        // Format: https://cdn.shortpixel.ai/spai/w_WIDTH+q_QUALITY+ret_img+to_webp/ORIGINAL_URL
        let params = [];
        
        if (width) {
            params.push(`w_${Math.ceil(width)}`);
        }
        
        params.push(`q_${QUALITY}`);
        params.push('ret_img');
        
        if (CONVERT_TO_WEBP) {
            params.push('to_webp');
        }
        
        const shortpixelUrl = `https://${SHORTPIXEL_CDN}/spai/${params.join('+')}/${fullUrl}`;
        
        return shortpixelUrl;
    }
    
    // Process all images with data-shortpixel or data-fastpix attribute
    function processImages() {
        const images = document.querySelectorAll('img[data-shortpixel], img[data-fastpix]');
        
        images.forEach(img => {
            // Skip if already processed
            if (img.hasAttribute('data-shortpixel-processed')) {
                return;
            }
            
            const originalSrc = img.getAttribute('src');
            if (originalSrc && !originalSrc.includes('placeholder')) {
                // Only optimize non-placeholder images
                const optimizedUrl = optimizeImageUrl(originalSrc, img);
                img.src = optimizedUrl;
                img.setAttribute('data-shortpixel-processed', 'true');
            } else {
                // Mark placeholder as processed but don't optimize
                img.setAttribute('data-shortpixel-processed', 'true');
            }
            
            // Handle srcset if present
            const originalSrcset = img.getAttribute('srcset');
            if (originalSrcset) {
                const srcsetParts = originalSrcset.split(',').map(part => {
                    const [url, descriptor] = part.trim().split(/\s+/);
                    const optimizedUrl = optimizeImageUrl(url, img);
                    return descriptor ? `${optimizedUrl} ${descriptor}` : optimizedUrl;
                });
                img.srcset = srcsetParts.join(', ');
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processImages);
    } else {
        processImages();
    }
    
    // Re-process when new images are added
    const observer = new MutationObserver(processImages);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
