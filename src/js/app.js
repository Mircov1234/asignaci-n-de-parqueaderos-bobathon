/**
 * Main Application Logic
 * Handles UI interactions and orchestrates the parking assignment workflow
 */

class ParkingApp {
    constructor() {
        this.currentDate = null;
        this.assignmentColumn = null;
        this.bulkAssignments = [];
        this.loadedBoards = {
            parking: null,
            employee: null
        };
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.loadSavedConfig();
        this.setDefaultDates();
        this.renderAssignments();
        this.renderBulkAssignments();
    }

    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        document.getElementById('saveConfig').addEventListener('click', () => this.saveConfiguration());

        document.getElementById('loadData').addEventListener('click', () => this.loadDataFromMonday());
        document.getElementById('runAssignment').addEventListener('click', () => this.runAssignment());
        document.getElementById('runBulkAssignment').addEventListener('click', () => this.runBulkAssignment());
        document.getElementById('updateBoard').addEventListener('click', () => this.updateMondayBoard());

        document.getElementById('filterAvailable').addEventListener('change', () => this.renderParkingLots());
        document.getElementById('filterUnassigned').addEventListener('change', () => this.renderEmployees());

        document.getElementById('assignmentDate').addEventListener('change', () => {
            this.currentDate = document.getElementById('assignmentDate').value;
        });

        document.getElementById('shortcutToday').addEventListener('click', () => this.applyShortcut('today'));
        document.getElementById('shortcutPrevWeek').addEventListener('click', () => this.applyShortcut('prevWeek'));
        document.getElementById('shortcutNextWeek').addEventListener('click', () => this.applyShortcut('nextWeek'));
        document.getElementById('shortcutMonth').addEventListener('click', () => this.applyShortcut('month'));

        document.getElementById('openUsersCrud').addEventListener('click', () => this.togglePanel('usersCrudPanel', true));
        document.getElementById('closeUsersCrud').addEventListener('click', () => this.togglePanel('usersCrudPanel', false));
        document.getElementById('openParkingCrud').addEventListener('click', () => this.togglePanel('parkingCrudPanel', true));
        document.getElementById('closeParkingCrud').addEventListener('click', () => this.togglePanel('parkingCrudPanel', false));

        document.getElementById('saveUserCrud').addEventListener('click', () => this.saveUserCrud());
        document.getElementById('saveParkingCrud').addEventListener('click', () => this.saveParkingCrud());
    }

    /**
     * Load saved configuration
     */
    loadSavedConfig() {
        const apiKeyInput = document.getElementById('apiKey');
        const parkingBoardInput = document.getElementById('parkingBoardId');
        const employeeBoardInput = document.getElementById('employeeBoardId');
        const assignmentColumnInput = document.getElementById('assignmentColumnId');

        if (apiKeyInput && config.getApiKey()) {
            apiKeyInput.value = config.getApiKey();
        }

        if (parkingBoardInput) {
            parkingBoardInput.value = config.getParkingBoardName() || config.getParkingBoardId();
        }

        if (employeeBoardInput) {
            employeeBoardInput.value = config.getEmployeeBoardName() || config.getEmployeeBoardId();
        }

        if (assignmentColumnInput && config.getAssignmentColumnId()) {
            assignmentColumnInput.value = config.getAssignmentColumnId();
        }

        if (config.isConfigured()) {
            this.showStatus('Configuración cargada desde el almacenamiento', 'success');
            document.getElementById('loadData').disabled = false;
        }
    }

    /**
     * Set default dates
     */
    setDefaultDates() {
        const today = this.formatDate(new Date());
        document.getElementById('assignmentDate').value = today;
        document.getElementById('rangeStartDate').value = today;
        document.getElementById('rangeEndDate').value = today;
        this.currentDate = today;
    }

    /**
     * Save configuration
     */
    async saveConfiguration() {
        const apiKey = document.getElementById('apiKey').value.trim();
        const parkingBoardReference = document.getElementById('parkingBoardId').value.trim();
        const employeeBoardReference = document.getElementById('employeeBoardId').value.trim();
        const assignmentColumnId = document.getElementById('assignmentColumnId').value.trim();

        if (!apiKey || !parkingBoardReference || !employeeBoardReference) {
            this.showConfigStatus('Por favor ingrese la Clave API y ambos tableros', 'error');
            return;
        }

        config.setApiKey(apiKey);

        try {
            const parkingBoard = await mondayClient.resolveBoardId(parkingBoardReference);
            const employeeBoard = await mondayClient.resolveBoardId(employeeBoardReference);

            config.setParkingBoardId(parkingBoard.id);
            config.setParkingBoardName(parkingBoard.name || parkingBoardReference);
            config.setEmployeeBoardId(employeeBoard.id);
            config.setEmployeeBoardName(employeeBoard.name || employeeBoardReference);
            config.setAssignmentColumnId(assignmentColumnId);

            document.getElementById('parkingBoardId').value = parkingBoard.name || parkingBoard.id;
            document.getElementById('employeeBoardId').value = employeeBoard.name || employeeBoard.id;

            this.showConfigStatus('¡Configuración guardada exitosamente!', 'success');
            document.getElementById('loadData').disabled = false;
        } catch (error) {
            this.showConfigStatus(`Error al resolver tableros: ${error.message}`, 'error');
        }
    }

    /**
     * Load data from Monday.com
     */
    async loadDataFromMonday() {
        if (!config.isConfigured()) {
            this.showStatus('Por favor configure la Clave API y ambos tableros primero', 'error');
            return;
        }

        if (!this.currentDate) {
            this.showStatus('Por favor seleccione una fecha', 'error');
            return;
        }

        this.showStatus('Cargando datos desde Monday.com...', 'info');
        this.disableButtons();

        try {
            const parkingBoardId = config.getParkingBoardId();
            const employeeBoardId = config.getEmployeeBoardId();

            const parkingBoard = await mondayClient.getBoardData(parkingBoardId);
            const employeeBoard = await mondayClient.getBoardData(employeeBoardId);

            this.loadedBoards.parking = parkingBoard;
            this.loadedBoards.employee = employeeBoard;

            const parkingLots = await mondayClient.getParkingLots(parkingBoardId, this.currentDate);
            const employees = await mondayClient.getEmployees(employeeBoardId, this.currentDate);

            this.assignmentColumn = this.resolveAssignmentColumn(employeeBoard.columns);

            assignmentEngine.loadData(parkingLots, employees);

            this.updateStatistics();
            this.renderParkingLots();
            this.renderEmployees();
            this.renderAssignments();
            this.renderCrudLists();

            const employeesInOffice = employees.filter(emp => emp.comingToOffice).length;
            const assignmentColumnLabel = this.assignmentColumn ? `${this.assignmentColumn.title} (${this.assignmentColumn.type})` : 'no detectada';

            this.showStatus(`✅ Datos cargados: ${parkingLots.length} parqueaderos, ${employees.length} empleados, ${employeesInOffice} vienen a la oficina. Columna de asignación: ${assignmentColumnLabel}`, 'success');

            document.getElementById('runAssignment').disabled = false;
            document.getElementById('runBulkAssignment').disabled = false;
        } catch (error) {
            this.showStatus(`❌ Error al cargar datos: ${error.message}`, 'error');
            console.error('Error al cargar datos:', error);
        } finally {
            this.enableButtons();
        }
    }

    /**
     * Resolve assignment column
     */
    resolveAssignmentColumn(columns) {
        const configuredId = config.getAssignmentColumnId();
        if (configuredId) {
            const configuredColumn = columns.find(column => column.id === configuredId);
            if (configuredColumn) {
                return configuredColumn;
            }
        }

        const suggestedColumn = mondayClient.findAssignmentColumn(columns);
        if (suggestedColumn) {
            config.setAssignmentColumnId(suggestedColumn.id);
            document.getElementById('assignmentColumnId').value = suggestedColumn.id;
        }

        return suggestedColumn;
    }

    /**
     * Run single-day assignment
     */
    async runAssignment() {
        this.showStatus('Ejecutando algoritmo de asignación automática...', 'info');

        try {
            const validation = assignmentEngine.validateAssignment();

            if (!validation.feasible) {
                this.showStatus(
                    `⚠️ Advertencia: Se necesitan ${validation.employeesNeedingParking} espacios pero solo hay ${validation.totalCapacity}. ${validation.deficit} empleados quedarán sin asignar.`,
                    'warning'
                );
            }

            const assignments = assignmentEngine.runAssignment();

            this.updateStatistics();
            this.renderParkingLots();
            this.renderEmployees();
            this.renderAssignments();

            this.showStatus(`✅ Asignación completada para ${this.currentDate}. ${assignments.length} empleados asignados.`, 'success');
            document.getElementById('updateBoard').disabled = false;
        } catch (error) {
            this.showStatus(`❌ Error al ejecutar asignación: ${error.message}`, 'error');
            console.error('Error de asignación:', error);
        }
    }

    /**
     * Run assignments across a date selection
     */
    async runBulkAssignment() {
        const dates = this.getSelectedDates();
        if (dates.length === 0) {
            this.showStatus('No hay fechas válidas para autoasignar', 'error');
            return;
        }

        const parkingBoardId = config.getParkingBoardId();
        const employeeBoardId = config.getEmployeeBoardId();

        this.bulkAssignments = [];
        this.showStatus(`Procesando autoasignación para ${dates.length} fecha(s)...`, 'info');
        this.disableButtons();

        try {
            for (const date of dates) {
                const parkingLots = await mondayClient.getParkingLots(parkingBoardId, date);
                const employees = await mondayClient.getEmployees(employeeBoardId, date);

                assignmentEngine.loadData(parkingLots, employees);
                const assignments = assignmentEngine.runAssignment();

                this.bulkAssignments.push({
                    date,
                    assignments,
                    employeesInOffice: employees.filter(emp => emp.comingToOffice).length,
                    totalParkingLots: parkingLots.length
                });
            }

            const lastDay = this.bulkAssignments[this.bulkAssignments.length - 1];
            assignmentEngine.loadData(
                await mondayClient.getParkingLots(parkingBoardId, lastDay.date),
                await mondayClient.getEmployees(employeeBoardId, lastDay.date)
            );
            assignmentEngine.runAssignment();

            this.updateStatistics();
            this.renderParkingLots();
            this.renderEmployees();
            this.renderAssignments();
            this.renderBulkAssignments();

            const totalAssigned = this.bulkAssignments.reduce((sum, entry) => sum + entry.assignments.length, 0);
            this.showStatus(`✅ Autoasignación de rango completada. ${dates.length} fecha(s), ${totalAssigned} asignaciones generadas.`, 'success');
            document.getElementById('updateBoard').disabled = false;
        } catch (error) {
            this.showStatus(`❌ Error en autoasignación por rango: ${error.message}`, 'error');
            console.error('Error en autoasignación por rango:', error);
        } finally {
            this.enableButtons();
        }
    }

    /**
     * Update Monday.com board with assignments
     */
    async updateMondayBoard() {
        if (!this.assignmentColumn) {
            this.showStatus('❌ No se encontró una columna válida para guardar la asignación.', 'error');
            return;
        }

        this.showStatus('Actualizando tablero de Monday.com...', 'info');
        this.disableButtons();

        try {
            const employeeBoardId = config.getEmployeeBoardId();
            const payload = this.bulkAssignments.length > 0
                ? this.bulkAssignments.flatMap(entry => entry.assignments)
                : assignmentEngine.getAssignments();

            if (payload.length === 0) {
                this.showStatus('No hay asignaciones para actualizar', 'warning');
                return;
            }

            const results = await mondayClient.batchUpdateAssignments(
                employeeBoardId,
                payload,
                this.assignmentColumn
            );

            const successful = results.filter(result => result.success).length;
            const failed = results.filter(result => !result.success).length;

            if (failed > 0) {
                this.showStatus(`⚠️ ${successful} asignaciones actualizadas, ${failed} fallaron. Revise la consola.`, 'warning');
                console.error('Actualizaciones fallidas:', results.filter(result => !result.success));
            } else {
                this.showStatus(`✅ ${successful} asignaciones actualizadas exitosamente en Monday.com.`, 'success');
            }
        } catch (error) {
            this.showStatus(`❌ Error al actualizar tablero: ${error.message}`, 'error');
            console.error('Error al actualizar tablero:', error);
        } finally {
            this.enableButtons();
        }
    }

    /**
     * Shortcut ranges
     */
    applyShortcut(shortcut) {
        const now = new Date();

        if (shortcut === 'today') {
            const today = this.formatDate(now);
            document.getElementById('assignmentDate').value = today;
            document.getElementById('rangeStartDate').value = today;
            document.getElementById('rangeEndDate').value = today;
            document.getElementById('rangeMode').value = 'single';
            this.currentDate = today;
            return;
        }

        if (shortcut === 'prevWeek' || shortcut === 'nextWeek') {
            const base = new Date(now);
            const currentDay = base.getDay();
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
            base.setDate(base.getDate() + mondayOffset + (shortcut === 'prevWeek' ? -7 : 7));
            const end = new Date(base);
            end.setDate(base.getDate() + 6);

            document.getElementById('rangeStartDate').value = this.formatDate(base);
            document.getElementById('rangeEndDate').value = this.formatDate(end);
            document.getElementById('assignmentDate').value = this.formatDate(base);
            document.getElementById('rangeMode').value = 'weekly';
            this.currentDate = this.formatDate(base);
            return;
        }

        if (shortcut === 'month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            document.getElementById('rangeStartDate').value = this.formatDate(start);
            document.getElementById('rangeEndDate').value = this.formatDate(end);
            document.getElementById('assignmentDate').value = this.formatDate(start);
            document.getElementById('rangeMode').value = 'monthly';
            this.currentDate = this.formatDate(start);
        }
    }

    /**
     * Get selected dates from mode and range
     */
    getSelectedDates() {
        const mode = document.getElementById('rangeMode').value;
        const assignmentDate = document.getElementById('assignmentDate').value;
        const startDate = document.getElementById('rangeStartDate').value;
        const endDate = document.getElementById('rangeEndDate').value;

        if (mode === 'single') {
            return assignmentDate ? [assignmentDate] : [];
        }

        if (!startDate || !endDate) {
            return [];
        }

        const dates = [];
        const current = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        while (current <= end) {
            dates.push(this.formatDate(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    /**
     * Render parking lots list
     */
    renderParkingLots() {
        const container = document.getElementById('parkingList');
        const filterAvailable = document.getElementById('filterAvailable').checked;

        let lots = assignmentEngine.parkingLots;

        if (filterAvailable) {
            lots = lots.filter(lot => lot.available);
        }

        if (lots.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🅿️</div><div class="empty-state-text">No se encontraron parqueaderos</div></div>';
            return;
        }

        container.innerHTML = lots.map(lot => `
            <div class="data-item ${lot.available ? 'available' : 'occupied'}">
                <div class="item-header">${lot.name}</div>
                <div class="item-details">
                    <strong>Zona:</strong> ${lot.zona}<br>
                    <strong>Tipo:</strong> ${lot.tipo}<br>
                    <strong>Capacidad:</strong> ${lot.capacidad}<br>
                    <span class="item-badge ${lot.available ? 'badge-available' : 'badge-occupied'}">${lot.status}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render employees list
     */
    renderEmployees() {
        const container = document.getElementById('employeeList');
        const filterUnassigned = document.getElementById('filterUnassigned').checked;

        let employees = assignmentEngine.employees.filter(emp => emp.comingToOffice);

        if (filterUnassigned) {
            employees = employees.filter(emp => !emp.assignedParking);
        }

        if (employees.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">No hay empleados viniendo a la oficina</div></div>';
            return;
        }

        container.innerHTML = employees.map(emp => `
            <div class="data-item ${emp.assignedParking ? 'assigned' : ''}">
                <div class="item-header">${emp.nombre} ${emp.apellido}</div>
                <div class="item-details">
                    <strong>Código:</strong> ${emp.codigo}<br>
                    <strong>Campaña:</strong> ${emp.campana}<br>
                    <strong>Horario:</strong> ${emp.horario}<br>
                    ${emp.assignedParking
                        ? `<span class="item-badge badge-assigned">Asignado: ${emp.assignedParking}</span>`
                        : `<span class="item-badge badge-occupied">Sin Asignar</span>`
                    }
                </div>
            </div>
        `).join('');
    }

    /**
     * Render assignments list
     */
    renderAssignments() {
        const container = document.getElementById('assignmentsList');
        const assignments = assignmentEngine.getAssignments();

        if (assignments.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">Aún no hay asignaciones para la fecha seleccionada.</div></div>';
            return;
        }

        container.innerHTML = assignments.map(assignment => `
            <div class="assignment-card">
                <h3>🅿️ ${assignment.parkingLotName}</h3>
                <div class="assignment-arrow">⬇️</div>
                <p><strong>👤 ${assignment.employeeName}</strong></p>
                <p>📋 Código: ${assignment.employeeCode}</p>
                <p>📁 Campaña: ${assignment.campana}</p>
                <p>🕐 Horario: ${assignment.horario}</p>
                <p>📍 Zona: ${assignment.zona}</p>
            </div>
        `).join('');
    }

    /**
     * Render bulk assignment summary
     */
    renderBulkAssignments() {
        const container = document.getElementById('bulkAssignmentsList');

        if (this.bulkAssignments.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🗓️</div><div class="empty-state-text">Todavía no se ha ejecutado autoasignación por rango.</div></div>';
            return;
        }

        container.innerHTML = this.bulkAssignments.map(entry => `
            <div class="assignment-card">
                <h3>${entry.date}</h3>
                <p><strong>Asignaciones:</strong> ${entry.assignments.length}</p>
                <p><strong>Empleados en oficina:</strong> ${entry.employeesInOffice}</p>
                <p><strong>Parqueaderos:</strong> ${entry.totalParkingLots}</p>
            </div>
        `).join('');
    }

    /**
     * Render CRUD lists
     */
    renderCrudLists() {
        this.renderUsersCrudList();
        this.renderParkingCrudList();
    }

    renderUsersCrudList() {
        const container = document.getElementById('usersCrudList');
        const employees = assignmentEngine.employees;

        if (employees.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Cargue empleados para administrarlos.</div></div>';
            return;
        }

        container.innerHTML = employees.map(employee => `
            <div class="data-item">
                <div class="item-header">${employee.nombre} ${employee.apellido}</div>
                <div class="item-details">
                    <strong>ID:</strong> ${employee.codigo}<br>
                    <strong>Campaña:</strong> ${employee.campana}<br>
                    <strong>Horario:</strong> ${employee.horario}<br>
                    <button class="btn btn-secondary btn-small" onclick="window.parkingApp.editUser('${employee.id}')">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="window.parkingApp.deleteUser('${employee.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderParkingCrudList() {
        const container = document.getElementById('parkingCrudList');
        const lots = assignmentEngine.parkingLots;

        if (lots.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Cargue parqueaderos para administrarlos.</div></div>';
            return;
        }

        container.innerHTML = lots.map(lot => `
            <div class="data-item">
                <div class="item-header">${lot.name}</div>
                <div class="item-details">
                    <strong>Zona:</strong> ${lot.zona}<br>
                    <strong>Tipo:</strong> ${lot.tipo}<br>
                    <strong>Capacidad:</strong> ${lot.capacidad}<br>
                    <button class="btn btn-secondary btn-small" onclick="window.parkingApp.editParking('${lot.id}')">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="window.parkingApp.deleteParking('${lot.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    saveUserCrud() {
        const editId = document.getElementById('userEditId').value;
        const name = document.getElementById('userName').value.trim();
        const employeeId = document.getElementById('userEmployeeId').value.trim();
        const campaign = document.getElementById('userCampaign').value.trim();
        const shift = document.getElementById('userShift').value.trim();

        if (!name || !employeeId) {
            this.showStatus('Nombre y employee id son obligatorios', 'error');
            return;
        }

        const [nombre, ...apellidoParts] = name.split(' ');
        const apellido = apellidoParts.join(' ');

        if (editId) {
            const employee = assignmentEngine.employees.find(item => item.id === editId);
            if (employee) {
                employee.nombre = nombre;
                employee.apellido = apellido;
                employee.codigo = employeeId;
                employee.campana = campaign;
                employee.horario = shift;
            }
        } else {
            assignmentEngine.employees.push({
                id: `local-user-${Date.now()}`,
                nombre,
                apellido,
                codigo: employeeId,
                campana: campaign,
                horario: shift,
                comingToOffice: true,
                assignedParking: null,
                status: 'Ocupado'
            });
        }

        this.clearUserCrudForm();
        this.renderEmployees();
        this.renderUsersCrudList();
        this.updateStatistics();
        this.showStatus('Usuario actualizado localmente. Para persistirlo en Monday se requiere crear mutaciones CRUD adicionales.', 'success');
    }

    saveParkingCrud() {
        const editId = document.getElementById('parkingEditId').value;
        const name = document.getElementById('parkingName').value.trim();
        const zone = document.getElementById('parkingZone').value.trim();
        const type = document.getElementById('parkingType').value.trim();
        const capacity = parseInt(document.getElementById('parkingCapacity').value, 10) || 1;

        if (!name) {
            this.showStatus('El nombre del parqueadero es obligatorio', 'error');
            return;
        }

        if (editId) {
            const lot = assignmentEngine.parkingLots.find(item => item.id === editId);
            if (lot) {
                lot.name = name;
                lot.zona = zone;
                lot.tipo = type;
                lot.capacidad = capacity;
            }
        } else {
            assignmentEngine.parkingLots.push({
                id: `local-lot-${Date.now()}`,
                name,
                zona: zone,
                tipo: type,
                capacidad: capacity,
                status: 'Libre',
                available: true
            });
        }

        this.clearParkingCrudForm();
        this.renderParkingLots();
        this.renderParkingCrudList();
        this.updateStatistics();
        this.showStatus('Parqueadero actualizado localmente. Para persistirlo en Monday se requiere crear mutaciones CRUD adicionales.', 'success');
    }

    editUser(id) {
        const employee = assignmentEngine.employees.find(item => item.id === id);
        if (!employee) return;

        document.getElementById('userEditId').value = employee.id;
        document.getElementById('userName').value = `${employee.nombre} ${employee.apellido}`.trim();
        document.getElementById('userEmployeeId').value = employee.codigo || '';
        document.getElementById('userCampaign').value = employee.campana || '';
        document.getElementById('userShift').value = employee.horario || '';
        this.togglePanel('usersCrudPanel', true);
    }

    deleteUser(id) {
        assignmentEngine.employees = assignmentEngine.employees.filter(item => item.id !== id);
        assignmentEngine.assignments = assignmentEngine.assignments.filter(item => item.employeeId !== id);
        this.renderEmployees();
        this.renderAssignments();
        this.renderUsersCrudList();
        this.updateStatistics();
    }

    editParking(id) {
        const lot = assignmentEngine.parkingLots.find(item => item.id === id);
        if (!lot) return;

        document.getElementById('parkingEditId').value = lot.id;
        document.getElementById('parkingName').value = lot.name || '';
        document.getElementById('parkingZone').value = lot.zona || '';
        document.getElementById('parkingType').value = lot.tipo || '';
        document.getElementById('parkingCapacity').value = lot.capacidad || 1;
        this.togglePanel('parkingCrudPanel', true);
    }

    deleteParking(id) {
        assignmentEngine.parkingLots = assignmentEngine.parkingLots.filter(item => item.id !== id);
        assignmentEngine.assignments = assignmentEngine.assignments.filter(item => item.parkingLotId !== id);
        this.renderParkingLots();
        this.renderAssignments();
        this.renderParkingCrudList();
        this.updateStatistics();
    }

    clearUserCrudForm() {
        document.getElementById('userEditId').value = '';
        document.getElementById('userName').value = '';
        document.getElementById('userEmployeeId').value = '';
        document.getElementById('userCampaign').value = '';
        document.getElementById('userShift').value = '';
    }

    clearParkingCrudForm() {
        document.getElementById('parkingEditId').value = '';
        document.getElementById('parkingName').value = '';
        document.getElementById('parkingZone').value = '';
        document.getElementById('parkingType').value = '';
        document.getElementById('parkingCapacity').value = '1';
    }

    togglePanel(panelId, visible) {
        document.getElementById(panelId).classList.toggle('hidden', !visible);
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = assignmentEngine.getStatistics();

        document.getElementById('totalParkingLots').textContent = stats.totalParkingLots;
        document.getElementById('availableLots').textContent = stats.availableLots;
        document.getElementById('totalEmployees').textContent = stats.totalEmployees;
        document.getElementById('employeesInOffice').textContent = stats.employeesInOffice;
        document.getElementById('assignedCount').textContent = stats.assignedCount;
        document.getElementById('unassignedCount').textContent = stats.unassignedCount;
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        const statusBox = document.getElementById('statusMessage');
        statusBox.textContent = message;
        statusBox.className = 'status-box';

        if (type === 'success') {
            statusBox.style.background = '#d4edda';
            statusBox.style.color = '#155724';
        } else if (type === 'error') {
            statusBox.style.background = '#f8d7da';
            statusBox.style.color = '#721c24';
        } else if (type === 'warning') {
            statusBox.style.background = '#fff3cd';
            statusBox.style.color = '#856404';
        } else {
            statusBox.style.background = '#d1ecf1';
            statusBox.style.color = '#0c5460';
        }
    }

    /**
     * Show configuration status
     */
    showConfigStatus(message, type) {
        const statusElement = document.getElementById('configStatus');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;

        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'status-message';
        }, 3000);
    }

    /**
     * Disable control buttons
     */
    disableButtons() {
        document.getElementById('loadData').disabled = true;
        document.getElementById('runAssignment').disabled = true;
        document.getElementById('runBulkAssignment').disabled = true;
        document.getElementById('updateBoard').disabled = true;
    }

    /**
     * Enable control buttons
     */
    enableButtons() {
        document.getElementById('loadData').disabled = false;
        if (assignmentEngine.parkingLots.length > 0) {
            document.getElementById('runAssignment').disabled = false;
            document.getElementById('runBulkAssignment').disabled = false;
        }
        if (assignmentEngine.getAssignments().length > 0 || this.bulkAssignments.length > 0) {
            document.getElementById('updateBoard').disabled = false;
        }
    }

    /**
     * Format date as YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.parkingApp = new ParkingApp();
    console.log('🚗 Sistema Inteligente de Asignación de Parqueaderos inicializado');
    console.log('📋 Bobathon 2026');
});

// Made with Bob
