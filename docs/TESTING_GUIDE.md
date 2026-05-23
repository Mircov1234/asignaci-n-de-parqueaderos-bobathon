# 🧪 Testing & Deployment Guide

Complete guide for testing and deploying the Smart Parking Assignment System.

---

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] Monday.com account with admin access
- [ ] API key generated
- [ ] Board ID identified
- [ ] Test data prepared in Monday.com board

### Monday.com Board Requirements

Your Monday.com board should have:

1. **Parking Lot Items** (53 items)
   - Names: C1, C2, C3... C20, V1, V2, etc.
   - Columns: Zona, Tipo, Capacidad
   - Date columns: 01-Jan, 02-Jan, 03-Jan, etc.

2. **Employee Items** (600 items)
   - Columns: Nombre, Apellido, Sodigo_Empleado, Campaña, Horario
   - Date columns with status: Libre/Ocupado

3. **Date Column Format**
   - Format: "DD-MMM" (e.g., "01-Jan", "15-Feb")
   - Status values: "Libre" or "Ocupado"

---

## 🔧 Local Testing

### Step 1: Clone and Build

```bash
# Clone repository
git clone https://github.com/yourusername/parking-assignment-bobathon.git
cd parking-assignment-bobathon

# Build Docker image
docker-compose build

# Expected output:
# Successfully built [image-id]
# Successfully tagged parking-assignment-bobathon_parking-app:latest
```

### Step 2: Start Application

```bash
# Start container
docker-compose up -d

# Verify container is running
docker-compose ps

# Expected output:
# NAME                     STATUS    PORTS
# parking-assignment-app   Up        0.0.0.0:8080->80/tcp
```

### Step 3: Access Application

```bash
# Open in browser
http://localhost:8080

# Check health endpoint
curl http://localhost:8080/health

# Expected output: "healthy"
```

### Step 4: Test Configuration

1. Open application in browser
2. Enter test API key
3. Enter test Board ID
4. Click "Save Configuration"
5. Refresh page - configuration should persist

**Expected Result**: ✅ Configuration saved successfully

### Step 5: Test Data Loading

1. Select a date (e.g., today)
2. Click "Load Data from Monday.com"
3. Wait for data to load

**Expected Results**:
- ✅ Status message: "Data loaded successfully"
- ✅ Statistics update with correct numbers
- ✅ Parking lots appear in list
- ✅ Employees appear in list

### Step 6: Test Assignment Algorithm

1. Click "Run Auto-Assignment"
2. Review generated assignments

**Expected Results**:
- ✅ Status message: "Assignment complete"
- ✅ Assignments appear in cards
- ✅ Statistics show assigned count
- ✅ Employees marked as assigned

### Step 7: Test Board Update

1. Click "Update Monday.com Board"
2. Open Monday.com in another tab
3. Check the board

**Expected Results**:
- ✅ Status message: "Successfully updated"
- ✅ Monday.com board shows parking assignments
- ✅ Date column updated with parking lot names

---

## 🧪 Functional Testing

### Test Case 1: Configuration Management

**Test**: Save and load configuration
```
1. Enter API key and Board ID
2. Click Save
3. Refresh page
4. Verify configuration persists
```
**Expected**: Configuration loads automatically

### Test Case 2: Data Validation

**Test**: Load data with invalid credentials
```
1. Enter invalid API key
2. Click Load Data
3. Observe error handling
```
**Expected**: Error message displayed, no crash

### Test Case 3: Empty Data Handling

**Test**: Load data for date with no employees
```
1. Select date with no "Ocupado" employees
2. Click Load Data
3. Click Run Assignment
```
**Expected**: "No employees coming to office" message

### Test Case 4: Capacity Overflow

**Test**: More employees than parking spots
```
1. Load data where employees > parking capacity
2. Run assignment
3. Check unassigned count
```
**Expected**: Warning message, some employees unassigned

### Test Case 5: Filter Functionality

**Test**: Filter parking lots and employees
```
1. Load data
2. Toggle "Show Available Only" filter
3. Toggle "Show Unassigned Only" filter
```
**Expected**: Lists update correctly

### Test Case 6: Date Selection

**Test**: Change date and reload
```
1. Load data for Date A
2. Change to Date B
3. Load data again
```
**Expected**: Data updates for new date

### Test Case 7: Assignment Priority

**Test**: Verify priority algorithm
```
1. Load data with mixed campaigns
2. Run assignment
3. Verify Campaign 1 employees get priority
```
**Expected**: Lower campaign numbers assigned first

### Test Case 8: Zone Priority

**Test**: Verify zone-based assignment
```
1. Load data with multiple zones
2. Run assignment
3. Check which zones filled first
```
**Expected**: Sótano filled before N1, N1 before N2

---

## 🔍 Integration Testing

### Monday.com API Tests

#### Test 1: Authentication
```bash
# Test API key validity
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id name } }"}'
```
**Expected**: Returns user information

#### Test 2: Board Access
```bash
# Test board access
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ boards(ids: YOUR_BOARD_ID) { id name } }"}'
```
**Expected**: Returns board information

#### Test 3: Query Items
```bash
# Test item query
curl -X POST https://api.monday.com/v2 \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ boards(ids: YOUR_BOARD_ID) { items_page { items { id name } } } }"}'
```
**Expected**: Returns list of items

---

## 🐳 Docker Testing

### Container Health Check

```bash
# Check container health
docker inspect parking-assignment-app | grep -A 5 Health

# Expected: "Status": "healthy"
```

### Container Logs

```bash
# View logs
docker-compose logs -f

# Should show:
# - Nginx startup messages
# - No error messages
# - Access logs when using app
```

### Resource Usage

```bash
# Check resource usage
docker stats parking-assignment-app

# Expected:
# CPU: < 5%
# Memory: < 50MB
```

### Port Binding

```bash
# Verify port is accessible
netstat -an | grep 8080

# Expected: Port 8080 listening
```

---

## 🌐 Browser Testing

### Supported Browsers

Test in the following browsers:

- [ ] Chrome/Edge (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Browser Console Tests

Open browser console (F12) and verify:

```javascript
// Check if config is loaded
console.log(config.isConfigured());

// Check Monday client
console.log(mondayClient);

// Check assignment engine
console.log(assignmentEngine);
```

### Responsive Design Tests

Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🚀 Deployment Testing

### Production Deployment Checklist

- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] Health check passes
- [ ] Application accessible via browser
- [ ] Configuration saves correctly
- [ ] Data loads from Monday.com
- [ ] Assignments generate correctly
- [ ] Board updates successfully
- [ ] Error handling works
- [ ] Logs are clean

### Performance Testing

```bash
# Test load time
time curl http://localhost:8080

# Expected: < 1 second

# Test health endpoint
time curl http://localhost:8080/health

# Expected: < 100ms
```

### Security Testing

- [ ] API keys not visible in network tab
- [ ] No credentials in Docker image
- [ ] HTTPS used for Monday.com API
- [ ] XSS protection headers present
- [ ] No sensitive data in logs

---

## 🐛 Common Issues & Solutions

### Issue 1: Container Won't Start

**Symptoms**: `docker-compose up` fails

**Solutions**:
```bash
# Check Docker is running
docker info

# Check port availability
netstat -an | grep 8080

# Rebuild image
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue 2: API Connection Fails

**Symptoms**: "Error loading data" message

**Solutions**:
1. Verify API key is correct
2. Check Board ID is correct
3. Verify internet connection
4. Check Monday.com API status
5. Review browser console for CORS errors

### Issue 3: No Data Loads

**Symptoms**: Empty lists after loading

**Solutions**:
1. Verify board has items
2. Check date column exists
3. Verify item naming (C1, C2, etc.)
4. Check column names match expected format

### Issue 4: Assignments Don't Update

**Symptoms**: Board doesn't update after clicking button

**Solutions**:
1. Check API key has write permissions
2. Verify date column ID is correct
3. Review browser console for errors
4. Check Monday.com API rate limits

---

## 📊 Test Data Setup

### Sample Parking Lots

Create these items in Monday.com:

```
C1  | Sótano | Carro | 1
C2  | Sótano | Carro | 1
C3  | Sótano | Carro | 1
...
C20 | Sótano | Carro | 1
V1  | N1     | Visitante (Carro/Moto) | 3
V2  | N1     | Visitante (Carro/Moto) | 3
```

### Sample Employees

Create these items in Monday.com:

```
Name: Luis Perez
Code: EMP1002
Campaign: Campaña 4
Schedule: 10am - 6pm
01-Jan: Libre
02-Jan: Ocupado
```

### Test Scenarios

#### Scenario 1: Normal Day
- 20 parking spots available
- 15 employees coming to office
- Expected: All assigned

#### Scenario 2: Busy Day
- 20 parking spots available
- 25 employees coming to office
- Expected: 20 assigned, 5 unassigned

#### Scenario 3: Light Day
- 20 parking spots available
- 5 employees coming to office
- Expected: All assigned, 15 spots remain

---

## ✅ Final Verification

Before considering deployment complete:

- [ ] All test cases pass
- [ ] No errors in browser console
- [ ] No errors in Docker logs
- [ ] Performance is acceptable
- [ ] Security checks pass
- [ ] Documentation is accurate
- [ ] Demo script works smoothly

---

## 📝 Test Report Template

```markdown
# Test Report - [Date]

## Environment
- Docker Version: [version]
- Browser: [browser and version]
- Monday.com Board ID: [board-id]

## Test Results
- Configuration: ✅/❌
- Data Loading: ✅/❌
- Assignment Algorithm: ✅/❌
- Board Update: ✅/❌
- Error Handling: ✅/❌

## Issues Found
1. [Issue description]
2. [Issue description]

## Performance
- Load Time: [time]
- Assignment Time: [time]
- Update Time: [time]

## Conclusion
[Pass/Fail] - [Notes]
```

---

## 🎯 Success Criteria

The system is ready for Bobathon when:

✅ All functional tests pass
✅ All integration tests pass
✅ Docker deployment works
✅ Demo runs smoothly
✅ Documentation is complete
✅ No critical bugs
✅ Performance is acceptable

---

**Ready to deploy! 🚀**