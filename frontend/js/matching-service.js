/**
 * Smart Matching Service
 * Uses Levenshtein Distance and keyword matching to find similar items
 */

class SmartMatcher {
    constructor() {
        this.SIMILARITY_THRESHOLD = 0.6; // 60% match required
    }

    /**
     * Calculate Levenshtein Distance between two strings
     * Returns the minimum number of single-character edits required to change one string into the other
     * Time Complexity: O(n*m)
     */
    levenshteinDistance(str1, str2) {
        const track = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i += 1) {
            track[0][i] = i;
        }

        for (let j = 0; j <= str2.length; j += 1) {
            track[j][0] = j;
        }

        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator, // substitution
                );
            }
        }

        return track[str2.length][str1.length];
    }

    /**
     * Calculate Similarity Score (0 to 1)
     */
    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;

        str1 = str1.toLowerCase().trim();
        str2 = str2.toLowerCase().trim();

        if (str1 === str2) return 1;

        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1.0;

        const distance = this.levenshteinDistance(str1, str2);
        return 1 - (distance / maxLength);
    }

    /**
     * Keyword matching score
     * Checks how many significant words match between descriptions
     */
    keywordMatchScore(desc1, desc2) {
        if (!desc1 || !desc2) return 0;

        const stopWords = ['a', 'an', 'the', 'is', 'at', 'in', 'on', 'with', 'and', 'or', 'of'];

        const getTokens = (text) => text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        const tokens1 = new Set(getTokens(desc1));
        const tokens2 = new Set(getTokens(desc2));

        if (tokens1.size === 0 || tokens2.size === 0) return 0;

        let matchCount = 0;
        tokens1.forEach(token => {
            if (tokens2.has(token)) matchCount++;
        });

        // Use Jaccard Similarity for sets
        const unionSize = new Set([...tokens1, ...tokens2]).size;
        return matchCount / unionSize;
    }

    /**
     * Find matches for a new item against a list of existing items
     */
    findMatches(newItem, existingItems) {
        const matches = [];

        existingItems.forEach(existingItem => {
            // 1. Category Filter (Must match exactly) - Hard Filter
            if (newItem.category !== existingItem.category) {
                return;
            }

            // 2. Name Similarity (Levenshtein) - High Weight (50%)
            const nameScore = this.calculateSimilarity(newItem.name, existingItem.name);

            // 3. color Similarity - Medium Weight (20%)
            const colorScore = this.calculateSimilarity(newItem.color || '', existingItem.color || '');

            // 4. Description Keyword Match - Medium Weight (30%)
            const descScore = this.keywordMatchScore(newItem.description, existingItem.description);

            // Weighted Total Score
            const totalScore = (nameScore * 0.5) + (descScore * 0.3) + (colorScore * 0.2);

            if (totalScore >= this.SIMILARITY_THRESHOLD) {
                matches.push({
                    item: existingItem,
                    score: totalScore,
                    reasons: {
                        nameMatch: Math.round(nameScore * 100),
                        descMatch: Math.round(descScore * 100)
                    }
                });
            }
        });

        // Sort by score (highest match first)
        return matches.sort((a, b) => b.score - a.score);
    }
}

// Initialize and export
const smartMatcher = new SmartMatcher();
window.smartMatcher = smartMatcher;
console.log('✓ Smart Matching Service Loaded');
