/**
 * Configuration Management
 * Handles API keys and board configuration
 */

class Config {
    constructor() {
        this.apiKey = '';
        this.parkingBoardId = '';
        this.employeeBoardId = '';
        this.parkingBoardName = '';
        this.employeeBoardName = '';
        this.assignmentColumnId = '';
        this.loadFromStorage();
    }

    /**
     * Load configuration from localStorage
     */
    loadFromStorage() {
        const savedConfig = localStorage.getItem('parkingAppConfig');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                this.apiKey = config.apiKey || '';
                this.parkingBoardId = config.parkingBoardId || config.boardId || ''; // Backward compatibility
                this.employeeBoardId = config.employeeBoardId || '';
                this.parkingBoardName = config.parkingBoardName || '';
                this.employeeBoardName = config.employeeBoardName || '';
                this.assignmentColumnId = config.assignmentColumnId || '';
            } catch (error) {
                console.error('Error loading config:', error);
            }
        }
    }

    /**
     * Save configuration to localStorage
     */
    saveToStorage() {
        const config = {
            apiKey: this.apiKey,
            parkingBoardId: this.parkingBoardId,
            employeeBoardId: this.employeeBoardId,
            parkingBoardName: this.parkingBoardName,
            employeeBoardName: this.employeeBoardName,
            assignmentColumnId: this.assignmentColumnId
        };
        localStorage.setItem('parkingAppConfig', JSON.stringify(config));
    }

    /**
     * Set API key
     */
    setApiKey(key) {
        this.apiKey = key;
        this.saveToStorage();
    }

    /**
     * Set Parking Board ID
     */
    setParkingBoardId(id) {
        this.parkingBoardId = id;
        this.saveToStorage();
    }

    /**
     * Set Employee Board ID
     */
    setEmployeeBoardId(id) {
        this.employeeBoardId = id;
        this.saveToStorage();
    }

    /**
     * Set Parking Board Name
     */
    setParkingBoardName(name) {
        this.parkingBoardName = name;
        this.saveToStorage();
    }

    /**
     * Set Employee Board Name
     */
    setEmployeeBoardName(name) {
        this.employeeBoardName = name;
        this.saveToStorage();
    }

    /**
     * Set Assignment Column ID
     */
    setAssignmentColumnId(id) {
        this.assignmentColumnId = id;
        this.saveToStorage();
    }

    /**
     * Get API key
     */
    getApiKey() {
        return this.apiKey;
    }

    /**
     * Get Parking Board ID
     */
    getParkingBoardId() {
        return this.parkingBoardId;
    }

    /**
     * Get Employee Board ID
     */
    getEmployeeBoardId() {
        return this.employeeBoardId;
    }

    /**
     * Get Parking Board Name
     */
    getParkingBoardName() {
        return this.parkingBoardName;
    }

    /**
     * Get Employee Board Name
     */
    getEmployeeBoardName() {
        return this.employeeBoardName;
    }

    /**
     * Get Assignment Column ID
     */
    getAssignmentColumnId() {
        return this.assignmentColumnId;
    }

    /**
     * Get Board ID (backward compatibility)
     */
    getBoardId() {
        return this.parkingBoardId;
    }

    /**
     * Set Board ID (backward compatibility)
     */
    setBoardId(id) {
        this.setParkingBoardId(id);
    }

    /**
     * Check if configuration is complete
     */
    isConfigured() {
        return this.apiKey && this.parkingBoardId && this.employeeBoardId;
    }

    /**
     * Clear configuration
     */
    clear() {
        this.apiKey = '';
        this.parkingBoardId = '';
        this.employeeBoardId = '';
        this.parkingBoardName = '';
        this.employeeBoardName = '';
        this.assignmentColumnId = '';
        localStorage.removeItem('parkingAppConfig');
    }
}

// Create global config instance
const config = new Config();

// Made with Bob
