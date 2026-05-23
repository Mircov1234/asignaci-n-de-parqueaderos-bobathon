/**
 * Monday.com API Client
 * Handles all interactions with Monday.com GraphQL API
 */

class MondayClient {
    constructor() {
        this.apiUrl = 'https://api.monday.com/v2';
        this.apiVersion = '2024-01';
    }

    /**
     * Make a GraphQL request to Monday.com API
     */
    async query(query, variables = {}) {
        const apiKey = config.getApiKey();
        
        if (!apiKey) {
            throw new Error('API key not configured');
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                    'API-Version': this.apiVersion
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            return data.data;
        } catch (error) {
            console.error('Monday.com API Error:', error);
            throw error;
        }
    }

    /**
     * Get board data including all items and columns
     */
    async getBoardData(boardId) {
        const query = `
            query ($boardId: [ID!], $cursor: String) {
                boards(ids: $boardId) {
                    id
                    name
                    columns {
                        id
                        title
                        type
                    }
                    items_page(limit: 100, cursor: $cursor) {
                        cursor
                        items {
                            id
                            name
                            column_values {
                                id
                                text
                                value
                            }
                        }
                    }
                }
            }
        `;

        let allItems = [];
        let cursor = null;
        let hasMore = true;

        // Fetch all items using pagination
        while (hasMore) {
            const variables = {
                boardId: [boardId],
                cursor: cursor
            };

            const data = await this.query(query, variables);
            const board = data.boards[0];
            
            if (board.items_page.items.length > 0) {
                allItems = allItems.concat(board.items_page.items);
            }

            cursor = board.items_page.cursor;
            hasMore = cursor !== null;

            console.log(`Fetched ${allItems.length} items so far...`);
        }

        console.log(`✅ Total items fetched: ${allItems.length}`);

        // Return board with all items
        const variables = { boardId: [boardId], cursor: null };
        const finalData = await this.query(query, variables);
        const finalBoard = finalData.boards[0];
        finalBoard.items_page.items = allItems;

        return finalBoard;
    }

    /**
     * Resolve a board reference that may be an ID or a board name
     */
    async resolveBoardId(boardReference) {
        const reference = String(boardReference || '').trim();

        if (!reference) {
            throw new Error('Board reference is empty');
        }

        if (/^\d+$/.test(reference)) {
            return { id: reference, name: '' };
        }

        const query = `
            query {
                boards(limit: 100) {
                    id
                    name
                }
            }
        `;

        const data = await this.query(query);
        const normalizedReference = reference.toLowerCase();
        const matchingBoard = data.boards.find(board => board.name.toLowerCase() === normalizedReference) ||
            data.boards.find(board => board.name.toLowerCase().includes(normalizedReference));

        if (!matchingBoard) {
            throw new Error(`Board not found: ${reference}`);
        }

        return {
            id: matchingBoard.id,
            name: matchingBoard.name
        };
    }

    /**
     * Get parking lots from board
     * Identifies items that represent parking spots (C1-C20, V1-V2, etc.)
     */
    async getParkingLots(boardId, date) {
        const board = await this.getBoardData(boardId);
        const parkingLots = [];

        // Find date column
        const dateColumn = this.findDateColumn(board.columns, date);
        
        if (!dateColumn) {
            throw new Error(`Date column not found for ${date}`);
        }

        // Process items to identify parking lots
        for (const item of board.items_page.items) {
            // Check if item name matches parking lot pattern (C1-C20, V1-V2, etc.)
            if (this.isParkingLot(item.name)) {
                const parkingLot = this.parseParkingLot(item, dateColumn.id);
                parkingLots.push(parkingLot);
            }
        }

        return parkingLots;
    }

    /**
     * Get employees from board
     * Identifies items that represent employees
     */
    async getEmployees(boardId, date) {
        const board = await this.getBoardData(boardId);
        const employees = [];

        // Find date column
        const dateColumn = this.findDateColumn(board.columns, date);
        
        if (!dateColumn) {
            throw new Error(`Date column not found for ${date}`);
        }

        // Process items to identify employees
        for (const item of board.items_page.items) {
            // Check if item is NOT a parking lot (employees have different naming)
            if (!this.isParkingLot(item.name)) {
                const employee = this.parseEmployee(item, dateColumn.id);
                employees.push(employee);
            }
        }

        return employees;
    }

    /**
     * Get writable text/status-like columns
     */
    getWritableAssignmentColumns(columns) {
        const blockedTypes = ['formula', 'mirror', 'board-relation', 'dependency', 'creation_log', 'auto_number'];
        return columns.filter(column => !blockedTypes.includes(column.type));
    }

    /**
     * Find a suggested parking assignment column
     */
    findAssignmentColumn(columns) {
        const normalizedCandidates = ['parqueadero', 'parking', 'parking lot', 'asignacion', 'assignment', 'puesto'];
        return this.getWritableAssignmentColumns(columns).find(column =>
            normalizedCandidates.some(candidate => column.title.toLowerCase().includes(candidate))
        ) || null;
    }

    /**
     * Format value according to Monday column type
     */
    formatColumnValue(column, value) {
        if (!column) {
            throw new Error('Assignment column metadata not found');
        }

        const stringValue = String(value ?? '').trim();

        switch (column.type) {
            case 'text':
            case 'long_text':
                return stringValue;
            case 'status':
            case 'dropdown':
                return { label: stringValue };
            default:
                return stringValue;
        }
    }

    /**
     * Update item column value
     */
    async updateColumnValue(boardId, itemId, column, value) {
        const query = `
            mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
                change_column_value(
                    board_id: $boardId,
                    item_id: $itemId,
                    column_id: $columnId,
                    value: $value
                ) {
                    id
                }
            }
        `;

        const variables = {
            boardId: boardId,
            itemId: itemId,
            columnId: column.id,
            value: JSON.stringify(this.formatColumnValue(column, value))
        };

        return await this.query(query, variables);
    }

    /**
     * Update parking assignment on Monday.com board
     */
    async updateParkingAssignment(boardId, employeeItemId, parkingLotName, assignmentColumn) {
        return await this.updateColumnValue(
            boardId,
            employeeItemId,
            assignmentColumn,
            parkingLotName
        );
    }

    /**
     * Helper: Check if item name matches parking lot pattern
     */
    isParkingLot(name) {
        // Parking lots: C (Carro), V (Visitante), M (Moto) followed by numbers
        // Examples: C1-C20, V1-V5, M1-M28
        return /^[CVM]\d+$/i.test(name.trim());
    }

    /**
     * Helper: Parse parking lot data from item
     */
    parseParkingLot(item, dateColumnId) {
        const getColumnValue = (columnTitle) => {
            const col = item.column_values.find(cv => 
                cv.id.toLowerCase().includes(columnTitle.toLowerCase()) ||
                cv.text?.toLowerCase().includes(columnTitle.toLowerCase())
            );
            return col ? col.text : '';
        };

        const dateStatus = item.column_values.find(cv => cv.id === dateColumnId);

        return {
            id: item.id,
            name: item.name,
            zona: getColumnValue('zona'),
            tipo: getColumnValue('tipo'),
            capacidad: parseInt(getColumnValue('capacidad')) || 1,
            status: dateStatus ? dateStatus.text : 'Libre',
            available: dateStatus ? dateStatus.text.toLowerCase() === 'libre' : true
        };
    }

    /**
     * Helper: Parse employee data from item
     */
    parseEmployee(item, dateColumnId) {
        const getColumnValue = (columnTitle) => {
            const col = item.column_values.find(cv => 
                cv.id.toLowerCase().includes(columnTitle.toLowerCase()) ||
                cv.text?.toLowerCase().includes(columnTitle.toLowerCase())
            );
            return col ? col.text : '';
        };

        const dateStatus = item.column_values.find(cv => cv.id === dateColumnId);

        return {
            id: item.id,
            nombre: getColumnValue('nombre') || item.name,
            apellido: getColumnValue('apellido'),
            codigo: getColumnValue('codigo') || getColumnValue('sodigo'),
            campana: getColumnValue('campana') || getColumnValue('campaña'),
            horario: getColumnValue('horario'),
            status: dateStatus ? dateStatus.text : 'Libre',
            comingToOffice: dateStatus ? dateStatus.text.toLowerCase() === 'ocupado' : false,
            assignedParking: null
        };
    }

    /**
     * Helper: Find date column by date
     */
    findDateColumn(columns, date) {
        // Convert date to format used in Monday.com (e.g., "01-Jan", "02-Jan")
        // Parse date string directly to avoid timezone issues
        const [year, month, day] = date.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(month) - 1;
        const dateFormat = `${day}-${monthNames[monthIndex]}`;

        console.log(`Looking for date column: "${dateFormat}" from date: ${date}`);
        console.log('Available columns:', columns.map(c => c.title).join(', '));

        // Find column that matches the date format
        const foundColumn = columns.find(col =>
            col.title.includes(dateFormat) ||
            col.title.includes(date)
        );

        if (foundColumn) {
            console.log(`✅ Found matching column: "${foundColumn.title}"`);
        } else {
            console.log(`❌ No matching column found for: "${dateFormat}"`);
        }

        return foundColumn;
    }

    /**
     * Batch update multiple assignments
     */
    async batchUpdateAssignments(boardId, assignments, assignmentColumn) {
        const results = [];

        for (const assignment of assignments) {
            try {
                const result = await this.updateParkingAssignment(
                    boardId,
                    assignment.employeeId,
                    assignment.parkingLotName,
                    assignmentColumn
                );
                results.push({ success: true, assignment, result });
            } catch (error) {
                results.push({ success: false, assignment, error: error.message });
            }
        }

        return results;
    }
}

// Create global Monday client instance
const mondayClient = new MondayClient();

// Made with Bob
