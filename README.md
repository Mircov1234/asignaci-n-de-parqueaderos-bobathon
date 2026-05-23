# 🚗 Smart Parking Assignment System

**Bobathon 2026 Project**

An automated parking lot management system that integrates with Monday.com to intelligently assign parking spaces to employees based on their office attendance.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Docker Deployment](#docker-deployment)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Smart Parking Assignment System solves the challenge of managing 53 parking lots for 600 employees across 5 different projects with varying work schedules. The system:

- **Reads** parking lot availability from Monday.com board
- **Identifies** employees coming to the office (marked as "Ocupado")
- **Automatically assigns** available parking spots using an intelligent algorithm
- **Updates** Monday.com board with parking assignments

### Key Statistics
- 🅿️ **53 Parking Lots** (Zones: Sótano, N1, N2)
- 👥 **600 Employees** across 5 campaigns
- 📅 **Automated Daily Assignment**
- ⚡ **Real-time Monday.com Integration**

---

## ✨ Features

### Core Functionality
- ✅ **Automatic Assignment Algorithm** - Intelligently assigns parking based on availability and priority
- ✅ **Monday.com Integration** - Direct API connection for reading and updating data
- ✅ **Zone-Based Priority** - Prioritizes parking zones (Sótano > N1 > N2)
- ✅ **Campaign & Schedule Aware** - Considers employee campaigns and work schedules
- ✅ **Capacity Management** - Handles parking lots with multiple capacities
- ✅ **Real-time Dashboard** - Visual interface showing assignments and statistics

### Technical Features
- 🐳 **Docker Ready** - One-command deployment
- 🌐 **Browser-Based** - No backend server required (runs in browser)
- 🔒 **Secure** - API keys stored locally in browser
- 📊 **Statistics Dashboard** - Real-time metrics and reporting
- 🎨 **Modern UI** - Clean, responsive interface

---

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Monday.com account with API access
- Board ID from your Monday.com parking management board

### Installation (3 Steps)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/parking-assignment-bobathon.git
cd parking-assignment-bobathon
```

2. **Start with Docker**
```bash
docker-compose up -d
```

3. **Open in browser**
```
http://localhost:8080
```

That's it! The application is now running.

---

## 🔧 How It Works

### Workflow

```
1. Load Data from Monday.com
   ↓
2. Identify Available Parking Lots (Status: "Libre")
   ↓
3. Identify Employees Coming to Office (Status: "Ocupado")
   ↓
4. Run Assignment Algorithm
   ↓
5. Display Assignments in Dashboard
   ↓
6. Update Monday.com Board with Assignments
```

### Assignment Algorithm

The system uses an intelligent algorithm that:

1. **Filters** available parking lots (marked as "Libre")
2. **Filters** employees coming to office (marked as "Ocupado")
3. **Sorts parking lots** by priority:
   - Zone (Sótano → N1 → N2)
   - Capacity (higher capacity first)
   - Name (alphabetically)
4. **Sorts employees** by priority:
   - Campaign number (1 → 5)
   - Schedule start time (earlier first)
   - Name (alphabetically)
5. **Assigns** parking lots to employees respecting capacity limits
6. **Reports** any unassigned employees if parking is insufficient

---

## ⚙️ Configuration

### Getting Your Monday.com Credentials

#### 1. Get API Key
1. Go to Monday.com
2. Click your profile picture → Admin
3. Navigate to API section
4. Generate or copy your API token

#### 2. Get Board ID
1. Open your parking management board in Monday.com
2. Look at the URL: `https://yourcompany.monday.com/boards/1234567890`
3. The number `1234567890` is your Board ID

### Configure the Application

1. Open the application in your browser: `http://localhost:8080`
2. Enter your **Monday.com API Key**
3. Enter your **Board ID**
4. Click **Save Configuration**

The configuration is saved in your browser's local storage and persists between sessions.

---

## 📖 Usage Guide

### Step-by-Step Process

#### Step 1: Configure API Access
- Enter your Monday.com API Key and Board ID
- Click "Save Configuration"

#### Step 2: Select Date
- Choose the date you want to assign parking for
- The system will look for the corresponding date column in Monday.com

#### Step 3: Load Data
- Click "Load Data from Monday.com"
- The system fetches all parking lots and employees
- Statistics are displayed in the dashboard

#### Step 4: Run Assignment
- Click "Run Auto-Assignment"
- The algorithm assigns parking lots to employees
- View assignments in the dashboard

#### Step 5: Update Monday.com
- Review the assignments
- Click "Update Monday.com Board"
- The system updates the board with parking assignments

### Dashboard Sections

#### Statistics Cards
- **Total Parking Lots**: All parking spaces in the system
- **Available Lots**: Parking marked as "Libre"
- **Total Employees**: All employees in the board
- **Coming to Office**: Employees marked as "Ocupado"
- **Assigned**: Successfully assigned employees
- **Unassigned**: Employees without parking (if capacity exceeded)

#### Parking Lots List
- Shows all parking lots with their details
- Filter to show only available lots
- Color-coded by status (Green = Available, Red = Occupied)

#### Employees List
- Shows employees coming to office
- Filter to show only unassigned employees
- Displays campaign, schedule, and assignment status

#### Assignments List
- Visual cards showing each parking assignment
- Employee details and parking lot information
- Zone and schedule information

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Access the Application

- **URL**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### Docker Configuration

The application uses:
- **Base Image**: nginx:alpine (lightweight)
- **Port**: 8080 (mapped to container port 80)
- **Health Check**: Automatic monitoring every 30 seconds
- **Restart Policy**: Automatically restarts if it crashes

---

## 🏗️ Architecture

### Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API**: Monday.com GraphQL API
- **Server**: Nginx (for serving static files)
- **Container**: Docker with Alpine Linux
- **Storage**: Browser LocalStorage (for configuration)

### File Structure

```
parking-assignment-bobathon/
├── src/
│   ├── index.html              # Main dashboard
│   ├── css/
│   │   └── styles.css          # Styling
│   ├── js/
│   │   ├── config.js           # Configuration management
│   │   ├── mondayClient.js     # Monday.com API client
│   │   ├── assignmentEngine.js # Assignment algorithm
│   │   └── app.js              # Main application logic
│   └── assets/                 # Images and resources
├── docker/
│   └── nginx.conf              # Nginx configuration
├── docs/
│   └── QUICKSTART.md           # Quick start guide
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Docker orchestration
├── .gitignore                  # Git exclusions
├── .dockerignore               # Docker exclusions
└── README.md                   # This file
```

### Data Flow

```
Browser → Monday.com API → Fetch Data
                ↓
        Assignment Engine
                ↓
        Generate Assignments
                ↓
Monday.com API ← Update Board
```

---

## 🔍 Troubleshooting

### Common Issues

#### "API key not configured"
- **Solution**: Enter your Monday.com API key in the configuration section

#### "Date column not found"
- **Solution**: Ensure your Monday.com board has a column matching the selected date format (e.g., "01-Jan", "02-Jan")

#### "No parking lots found"
- **Solution**: Check that your board has items with names like C1, C2, V1, etc. (parking lot naming pattern)

#### "CORS Error"
- **Solution**: Monday.com API should allow CORS. If issues persist, check your API key permissions

#### Docker container won't start
- **Solution**: 
  ```bash
  docker-compose down
  docker-compose up --build
  ```

#### Port 8080 already in use
- **Solution**: Change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "8081:80"  # Use port 8081 instead
  ```

### Debug Mode

Open browser console (F12) to see detailed logs:
- API requests and responses
- Assignment algorithm steps
- Error messages with stack traces

---

## 🎤 Bobathon Demo Script

### Demo Flow (5 minutes)

1. **Introduction** (30 seconds)
   - "Managing 53 parking lots for 600 employees manually is time-consuming"
   - "Our solution automates this using Monday.com as the database"

2. **Show the Dashboard** (1 minute)
   - Open the application
   - Show the clean, modern interface
   - Highlight the statistics section

3. **Configure** (30 seconds)
   - Enter API key and Board ID
   - "Configuration is saved locally in the browser"

4. **Load Data** (1 minute)
   - Select today's date
   - Click "Load Data from Monday.com"
   - Show the statistics update in real-time

5. **Run Assignment** (1 minute)
   - Click "Run Auto-Assignment"
   - Show the assignments appear
   - Highlight the algorithm's intelligence (zone priority, capacity management)

6. **Update Board** (1 minute)
   - Click "Update Monday.com Board"
   - Open Monday.com in another tab
   - Show the board updated with parking assignments

7. **Wrap Up** (30 seconds)
   - "Automated, intelligent, and integrated with Monday.com"
   - "Runs in Docker - deploy anywhere in minutes"

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Make your changes in the `src/` directory
3. Test locally by opening `src/index.html` in a browser
4. Build and test with Docker
5. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 🏆 Bobathon 2026

This project was created for the Bobathon 2026 hackathon, demonstrating:
- ✅ Integration with Monday.com API
- ✅ Intelligent automation algorithms
- ✅ Docker containerization
- ✅ Clean, professional code
- ✅ Comprehensive documentation

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the Monday.com API documentation

---

**Made with ❤️ for Bobathon 2026**