/**
 * Assignment Engine
 * Handles the logic for automatically assigning parking lots to employees
 */

class AssignmentEngine {
    constructor() {
        this.parkingLots = [];
        this.employees = [];
        this.assignments = [];
    }

    /**
     * Load data for assignment
     */
    loadData(parkingLots, employees) {
        this.parkingLots = parkingLots;
        this.employees = employees;
        this.assignments = [];
    }

    /**
     * Run the auto-assignment algorithm
     * Assigns available parking lots to employees coming to office
     */
    runAssignment() {
        this.assignments = [];
        
        // Filter available parking lots
        const availableLots = this.parkingLots.filter(lot => lot.available);
        
        // Filter employees coming to office
        const employeesNeedingParking = this.employees.filter(emp => emp.comingToOffice);

        // Sort parking lots by priority (zone, capacity)
        const sortedLots = this.sortParkingLots(availableLots);
        
        // Sort employees by priority (campaign, schedule)
        const sortedEmployees = this.sortEmployees(employeesNeedingParking);

        // Track used parking capacity
        const lotCapacity = new Map();
        sortedLots.forEach(lot => {
            lotCapacity.set(lot.id, {
                total: lot.capacidad,
                used: 0,
                assignedTo: []
            });
        });

        // Assign parking lots to employees
        let lotIndex = 0;
        
        for (const employee of sortedEmployees) {
            if (lotIndex >= sortedLots.length) {
                // No more parking lots available
                console.warn(`No parking available for employee: ${employee.nombre} ${employee.apellido}`);
                continue;
            }

            const lot = sortedLots[lotIndex];
            const capacity = lotCapacity.get(lot.id);

            // Create assignment
            const assignment = {
                employeeId: employee.id,
                employeeName: `${employee.nombre} ${employee.apellido}`,
                employeeCode: employee.codigo,
                parkingLotId: lot.id,
                parkingLotName: lot.name,
                zona: lot.zona,
                tipo: lot.tipo,
                campana: employee.campana,
                horario: employee.horario
            };

            this.assignments.push(assignment);
            
            // Update employee with assignment
            employee.assignedParking = lot.name;

            // Update capacity tracking
            capacity.used++;
            capacity.assignedTo.push(employee.nombre);

            // Move to next lot if current one is full
            if (capacity.used >= capacity.total) {
                lotIndex++;
            }
        }

        return this.assignments;
    }

    /**
     * Sort parking lots by priority
     * Priority: Zone (Sótano > N1 > N2), then by name
     */
    sortParkingLots(lots) {
        const zoneOrder = { 'sótano': 1, 'sotano': 1, 'n1': 2, 'n2': 3 };
        
        return [...lots].sort((a, b) => {
            // Sort by zone first
            const zoneA = zoneOrder[a.zona.toLowerCase()] || 999;
            const zoneB = zoneOrder[b.zona.toLowerCase()] || 999;
            
            if (zoneA !== zoneB) {
                return zoneA - zoneB;
            }
            
            // Then by capacity (higher capacity first for efficiency)
            if (a.capacidad !== b.capacidad) {
                return b.capacidad - a.capacidad;
            }
            
            // Finally by name
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Sort employees by priority
     * Priority: Campaign number, then by schedule (earlier start time first)
     */
    sortEmployees(employees) {
        return [...employees].sort((a, b) => {
            // Sort by campaign first
            const campA = this.extractCampaignNumber(a.campana);
            const campB = this.extractCampaignNumber(b.campana);
            
            if (campA !== campB) {
                return campA - campB;
            }
            
            // Then by schedule start time
            const timeA = this.extractStartTime(a.horario);
            const timeB = this.extractStartTime(b.horario);
            
            if (timeA !== timeB) {
                return timeA - timeB;
            }
            
            // Finally by name
            return a.nombre.localeCompare(b.nombre);
        });
    }

    /**
     * Extract campaign number from campaign string
     */
    extractCampaignNumber(campana) {
        if (!campana) return 999;
        const match = campana.match(/\d+/);
        return match ? parseInt(match[0]) : 999;
    }

    /**
     * Extract start time from schedule string (e.g., "10am - 6pm" -> 10)
     */
    extractStartTime(horario) {
        if (!horario) return 999;
        
        // Match patterns like "10am", "6am", "7am"
        const match = horario.match(/(\d+)\s*(am|pm)/i);
        if (!match) return 999;
        
        let hour = parseInt(match[1]);
        const period = match[2].toLowerCase();
        
        // Convert to 24-hour format
        if (period === 'pm' && hour !== 12) {
            hour += 12;
        } else if (period === 'am' && hour === 12) {
            hour = 0;
        }
        
        return hour;
    }

    /**
     * Get assignment statistics
     */
    getStatistics() {
        const totalParkingLots = this.parkingLots.length;
        const availableLots = this.parkingLots.filter(lot => lot.available).length;
        const totalEmployees = this.employees.length;
        const employeesInOffice = this.employees.filter(emp => emp.comingToOffice).length;
        const assignedCount = this.assignments.length;
        const unassignedCount = employeesInOffice - assignedCount;

        return {
            totalParkingLots,
            availableLots,
            totalEmployees,
            employeesInOffice,
            assignedCount,
            unassignedCount
        };
    }

    /**
     * Get assignments
     */
    getAssignments() {
        return this.assignments;
    }

    /**
     * Get unassigned employees
     */
    getUnassignedEmployees() {
        return this.employees.filter(emp => 
            emp.comingToOffice && !emp.assignedParking
        );
    }

    /**
     * Clear all data
     */
    clear() {
        this.parkingLots = [];
        this.employees = [];
        this.assignments = [];
    }

    /**
     * Generate assignment report
     */
    generateReport() {
        const stats = this.getStatistics();
        const unassigned = this.getUnassignedEmployees();

        let report = `📊 Assignment Report\n\n`;
        report += `Total Parking Lots: ${stats.totalParkingLots}\n`;
        report += `Available Lots: ${stats.availableLots}\n`;
        report += `Employees Coming to Office: ${stats.employeesInOffice}\n`;
        report += `Successfully Assigned: ${stats.assignedCount}\n`;
        report += `Unassigned: ${stats.unassignedCount}\n\n`;

        if (unassigned.length > 0) {
            report += `⚠️ Unassigned Employees:\n`;
            unassigned.forEach(emp => {
                report += `- ${emp.nombre} ${emp.apellido} (${emp.codigo})\n`;
            });
        }

        return report;
    }

    /**
     * Validate assignment feasibility
     */
    validateAssignment() {
        const availableLots = this.parkingLots.filter(lot => lot.available);
        const employeesNeedingParking = this.employees.filter(emp => emp.comingToOffice);
        
        // Calculate total capacity
        const totalCapacity = availableLots.reduce((sum, lot) => sum + lot.capacidad, 0);
        
        const validation = {
            feasible: totalCapacity >= employeesNeedingParking.length,
            totalCapacity,
            employeesNeedingParking: employeesNeedingParking.length,
            deficit: Math.max(0, employeesNeedingParking.length - totalCapacity)
        };

        return validation;
    }
}

// Create global assignment engine instance
const assignmentEngine = new AssignmentEngine();

// Made with Bob
