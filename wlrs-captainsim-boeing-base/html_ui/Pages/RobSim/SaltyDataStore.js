Include.addScript("/JS/dataStorage.js");

class SaltyDataStore {
    static get(key, defaultVal) {
        const val = GetStoredData(`Salty747_${key}`);
        if (!val) {
            return defaultVal;
        }
        return val;
    }

    static set(key, val) {
        SetStoredData(`Salty747_${key}`, val);
    }
}

class B777DataStore {
    static get(key, defaultVal) {
        const val = GetStoredData(`B777_${key}`);
        if (!val) {
            return defaultVal;
        }
        return val;
    }

    static set(key, val) {
        SetStoredData(`B777_${key}`, val);
    }
}