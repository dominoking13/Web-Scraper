const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');

class ContentCache {
    constructor(cacheDir = '.cache') {
        this.cacheDir = cacheDir;
        this.cacheFile = path.join(cacheDir, 'content-hashes.json');
    }

    /**
     * Initialize cache directory and file
     */
    async init() {
        await fs.ensureDir(this.cacheDir);
        if (!await fs.pathExists(this.cacheFile)) {
            await fs.writeJson(this.cacheFile, {});
        }
    }

    /**
     * Generate hash for content
     * @param {string} content - Content to hash
     * @returns {string} SHA-256 hash
     */
    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Check if content has changed for a site
     * @param {string} siteName - Name of the site
     * @param {string} content - Current content
     * @returns {boolean} True if content has changed or no previous hash exists
     */
    async hasContentChanged(siteName, content) {
        try {
            const cache = await fs.readJson(this.cacheFile);
            const currentHash = this.generateHash(content);
            const previousHash = cache[siteName];

            return previousHash !== currentHash;
        } catch (error) {
            // If cache doesn't exist or can't be read, assume content has changed
            console.log(`Cache check failed for ${siteName}, assuming content changed:`, error.message);
            return true;
        }
    }

    /**
     * Update cache with new content hash
     * @param {string} siteName - Name of the site
     * @param {string} content - Content to cache
     */
    async updateCache(siteName, content) {
        try {
            const cache = await fs.readJson(this.cacheFile);
            cache[siteName] = this.generateHash(content);
            await fs.writeJson(this.cacheFile, cache, { spaces: 2 });
            console.log(`✅ Cache updated for ${siteName}`);
        } catch (error) {
            console.error(`❌ Failed to update cache for ${siteName}:`, error.message);
        }
    }

    /**
     * Get cache statistics
     * @returns {object} Cache statistics
     */
    async getStats() {
        try {
            const cache = await fs.readJson(this.cacheFile);
            return {
                sites: Object.keys(cache),
                totalSites: Object.keys(cache).length,
                cacheFile: this.cacheFile
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Clear cache for all sites or specific site
     * @param {string} siteName - Optional: specific site to clear, if not provided clears all
     */
    async clearCache(siteName = null) {
        try {
            if (siteName) {
                const cache = await fs.readJson(this.cacheFile);
                delete cache[siteName];
                await fs.writeJson(this.cacheFile, cache, { spaces: 2 });
                console.log(`🗑️ Cache cleared for ${siteName}`);
            } else {
                await fs.writeJson(this.cacheFile, {});
                console.log('🗑️ All cache cleared');
            }
        } catch (error) {
            console.error('❌ Failed to clear cache:', error.message);
        }
    }
}

module.exports = ContentCache;