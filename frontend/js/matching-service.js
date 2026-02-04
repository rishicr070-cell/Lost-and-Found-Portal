/**
 * Smart Matching Service
 * Uses Levenshtein Distance, keyword matching, and synonyms to find similar items
 */

class SmartMatcher {
    constructor() {
        this.SIMILARITY_THRESHOLD = 0.5; // Lowered to 50% for better matching

        // Synonym Dictionary - Maps related terms together
        this.synonyms = {
            // Audio devices
            'airpods': ['earphones', 'earbuds', 'headphones', 'headset', 'earpiece', 'buds', 'pods', 'wireless earphones', 'bluetooth earphones', 'tws'],
            'earphones': ['airpods', 'earbuds', 'headphones', 'headset', 'earpiece', 'buds', 'pods', 'wireless earphones'],
            'headphones': ['earphones', 'airpods', 'earbuds', 'headset', 'audio', 'beats', 'sony'],

            // Bags & Wallets
            'wallet': ['purse', 'billfold', 'pocketbook', 'money clip', 'card holder', 'cardholder'],
            'purse': ['wallet', 'handbag', 'bag', 'clutch', 'pouch'],
            'backpack': ['bag', 'rucksack', 'schoolbag', 'knapsack', 'bookbag'],
            'bag': ['backpack', 'handbag', 'purse', 'satchel', 'tote', 'duffel'],

            // Electronics
            'laptop': ['notebook', 'computer', 'macbook', 'chromebook', 'pc'],
            'phone': ['mobile', 'cellphone', 'smartphone', 'iphone', 'android', 'cell'],
            'iphone': ['phone', 'mobile', 'smartphone', 'apple phone', 'cell'],
            'charger': ['adapter', 'cable', 'charging cable', 'power adapter', 'usb cable'],
            'pendrive': ['usb', 'flash drive', 'thumb drive', 'usb drive', 'memory stick'],
            'usb': ['pendrive', 'flash drive', 'thumb drive', 'usb drive'],

            // Keys & Cards
            'keys': ['key', 'keychain', 'key ring', 'keyring', 'car keys', 'house keys'],
            'id': ['id card', 'identity card', 'identification', 'student id', 'college id'],
            'card': ['id', 'credit card', 'debit card', 'atm card', 'bank card'],

            // Accessories
            'watch': ['wristwatch', 'smartwatch', 'timepiece', 'apple watch', 'fitbit'],
            'glasses': ['spectacles', 'eyeglasses', 'sunglasses', 'specs', 'shades'],
            'sunglasses': ['glasses', 'shades', 'goggles', 'eyewear'],
            'umbrella': ['parasol', 'brolly'],

            // Clothing
            'jacket': ['coat', 'hoodie', 'sweater', 'blazer', 'windbreaker'],
            'hoodie': ['jacket', 'sweatshirt', 'pullover'],

            // Stationery
            'bottle': ['water bottle', 'flask', 'thermos', 'tumbler', 'sipper'],
            'notebook': ['diary', 'journal', 'notepad', 'register', 'copy'],
            'calculator': ['calc', 'scientific calculator'],

            // Documents
            'document': ['documents', 'papers', 'file', 'certificate', 'marksheet'],
            'book': ['textbook', 'novel', 'reading book', 'library book']
        };
    }

    /**
     * Check if two words are synonyms
     */
    areSynonyms(word1, word2) {
        word1 = word1.toLowerCase().trim();
        word2 = word2.toLowerCase().trim();

        if (word1 === word2) return true;

        // Check direct synonym match
        if (this.synonyms[word1] && this.synonyms[word1].includes(word2)) {
            return true;
        }
        if (this.synonyms[word2] && this.synonyms[word2].includes(word1)) {
            return true;
        }

        // Check if word1 is contained in word2 or vice versa
        if (word1.includes(word2) || word2.includes(word1)) {
            return true;
        }

        return false;
    }

    /**
     * Get all synonyms for a word
     */
    getSynonyms(word) {
        word = word.toLowerCase().trim();
        const result = new Set([word]);

        if (this.synonyms[word]) {
            this.synonyms[word].forEach(syn => result.add(syn));
        }

        // Also check if this word appears in any synonym list
        Object.entries(this.synonyms).forEach(([key, values]) => {
            if (values.includes(word)) {
                result.add(key);
                values.forEach(v => result.add(v));
            }
        });

        return Array.from(result);
    }

    /**
     * Calculate Levenshtein Distance between two strings
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
                    track[j][i - 1] + 1,
                    track[j - 1][i] + 1,
                    track[j - 1][i - 1] + indicator,
                );
            }
        }

        return track[str2.length][str1.length];
    }

    /**
     * Calculate Similarity Score (0 to 1) - Now with synonym support!
     */
    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;

        str1 = str1.toLowerCase().trim();
        str2 = str2.toLowerCase().trim();

        if (str1 === str2) return 1;

        // Check for synonym match - HIGH SCORE!
        if (this.areSynonyms(str1, str2)) {
            return 0.9; // 90% match for synonyms
        }

        // Check each word for synonyms
        const words1 = str1.split(/\s+/);
        const words2 = str2.split(/\s+/);

        for (const w1 of words1) {
            for (const w2 of words2) {
                if (this.areSynonyms(w1, w2)) {
                    return 0.85; // 85% match for partial synonym
                }
            }
        }

        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1.0;

        const distance = this.levenshteinDistance(str1, str2);
        return 1 - (distance / maxLength);
    }

    /**
     * Keyword matching score - Now with synonym support!
     * Checks how many significant words match between descriptions
     */
    keywordMatchScore(desc1, desc2) {
        if (!desc1 || !desc2) return 0;

        const stopWords = ['a', 'an', 'the', 'is', 'at', 'in', 'on', 'with', 'and', 'or', 'of', 'my', 'i', 'lost', 'found'];

        const getTokens = (text) => text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        const tokens1 = new Set(getTokens(desc1));
        const tokens2 = new Set(getTokens(desc2));

        if (tokens1.size === 0 || tokens2.size === 0) return 0;

        let matchCount = 0;

        tokens1.forEach(token1 => {
            // Direct match
            if (tokens2.has(token1)) {
                matchCount++;
                return;
            }

            // Synonym match
            tokens2.forEach(token2 => {
                if (this.areSynonyms(token1, token2)) {
                    matchCount += 0.8; // 80% credit for synonym match
                }
            });
        });

        // Use Jaccard Similarity for sets
        const unionSize = new Set([...tokens1, ...tokens2]).size;
        return Math.min(1, matchCount / unionSize);
    }

    /**
     * Find matches for a new item against a list of existing items
     * Now with improved synonym matching!
     */
    findMatches(newItem, existingItems) {
        const matches = [];

        existingItems.forEach(existingItem => {
            // Category matching - now more flexible
            let categoryBonus = 0;
            const sameCategory = newItem.category === existingItem.category;

            if (sameCategory) {
                categoryBonus = 0.1; // Bonus for same category
            }

            // Name Similarity (with synonyms) - High Weight
            const nameScore = this.calculateSimilarity(newItem.name, existingItem.name);

            // Color Similarity
            const colorScore = this.calculateSimilarity(newItem.color || '', existingItem.color || '');

            // Description Keyword Match (with synonyms)
            const descScore = this.keywordMatchScore(newItem.description, existingItem.description);

            // Weighted Total Score
            let totalScore = (nameScore * 0.5) + (descScore * 0.3) + (colorScore * 0.1) + categoryBonus;

            // If name has synonym match, boost score significantly
            if (nameScore >= 0.85) {
                totalScore = Math.max(totalScore, 0.7); // Minimum 70% for synonym matches
            }

            if (totalScore >= this.SIMILARITY_THRESHOLD) {
                matches.push({
                    item: existingItem,
                    score: totalScore,
                    reasons: {
                        nameMatch: Math.round(nameScore * 100),
                        descMatch: Math.round(descScore * 100),
                        synonymMatch: nameScore >= 0.85 ? 'Yes' : 'No'
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
console.log('✓ Smart Matching Service Loaded (with Synonym Support)');
