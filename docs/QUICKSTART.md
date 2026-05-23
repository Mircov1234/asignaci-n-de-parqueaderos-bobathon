# 🚀 Quick Start Guide

Get the Smart Parking Assignment System running in **under 5 minutes**!

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- [ ] Docker Compose installed (included with Docker Desktop)
- [ ] Monday.com account with API access
- [ ] Your Monday.com API Key
- [ ] Your Monday.com Board ID

---

## Step 1: Get Your Monday.com Credentials (2 minutes)

### Get API Key

1. Log in to Monday.com
2. Click your **profile picture** (bottom left)
3. Select **Admin**
4. Go to **API** section
5. Click **Generate** or copy existing token
6. **Save this token** - you'll need it in Step 4

### Get Board ID

1. Open your parking management board
2. Look at the browser URL:
   ```
   https://yourcompany.monday.com/boards/1234567890
   ```
3. The number `1234567890` is your **Board ID**
4. **Save this number** - you'll need it in Step 4

---

## Step 2: Clone the Repository (30 seconds)

```bash
git clone https://github.com/yourusername/parking-assignment-bobathon.git
cd parking-assignment-bobathon
```

---

## Step 3: Start the Application (30 seconds)

```bash
docker-compose up -d
```

Wait for the message:
```
✔ Container parking-assignment-app  Started
```

---

## Step 4: Configure the Application (1 minute)

1. Open your browser and go to:
   ```
   http://localhost:8080
   ```

2. In the **Configuration** section:
   - Paste your **Monday.com API Key**
   - Enter your **Board ID**
   - Click **Save Configuration**

You should see: ✅ "Configuration saved successfully!"

---

## Step 5: Run Your First Assignment (1 minute)

### Load Data
1. Select today's date (or any date you want to assign parking for)
2. Click **"Load Data from Monday.com"**
3. Wait for the data to load (you'll see statistics update)

### Run Assignment
1. Click **"Run Auto-Assignment"**
2. View the assignments in the dashboard
3. Review the parking assignments

### Update Monday.com
1. Click **"Update Monday.com Board"**
2. Open your Monday.com board in another tab
3. See the parking assignments updated! 🎉

---

## Verification Checklist

After completing the steps, verify:

- [ ] Application is accessible at http://localhost:8080
- [ ] Configuration is saved (refresh page to check)
- [ ] Data loads from Monday.com
- [ ] Statistics show correct numbers
- [ ] Assignments are generated
- [ ] Monday.com board is updated

---

## Common First-Time Issues

### "Cannot connect to Docker daemon"
**Solution**: Make sure Docker Desktop is running

### "Port 8080 already in use"
**Solution**: Stop other services using port 8080, or change the port:
```bash
# Edit docker-compose.yml and change:
ports:
  - "8081:80"  # Use 8081 instead
```

### "API key not configured"
**Solution**: Make sure you clicked "Save Configuration" after entering credentials

### "No data loaded"
**Solution**: 
- Check your API key is correct
- Verify your Board ID is correct
- Ensure your board has the correct date columns (format: "01-Jan", "02-Jan", etc.)

---

## Next Steps

Now that you're up and running:

1. **Explore the Dashboard** - Check out all the features
2. **Try Different Dates** - Assign parking for different days
3. **Review the Algorithm** - See how parking is prioritized
4. **Read the Full README** - Learn about advanced features

---

## Quick Commands Reference

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart the application
docker-compose restart

# Rebuild after changes
docker-compose up --build -d

# Check container status
docker-compose ps
```

---

## Demo Mode (For Presentations)

If you're demoing this for Bobathon:

1. **Pre-load** your configuration before the demo
2. **Select a date** with known data
3. **Practice** the workflow once before presenting
4. **Have Monday.com open** in another tab to show real-time updates
5. **Highlight** the statistics and visual assignments

### Demo Script (2 minutes)

```
"Let me show you how this works..."

1. [Show dashboard] "Clean, modern interface"
2. [Click Load Data] "Connects to Monday.com API"
3. [Show statistics] "53 parking lots, 600 employees"
4. [Click Run Assignment] "Intelligent algorithm assigns parking"
5. [Show assignments] "Visual representation of assignments"
6. [Click Update Board] "Updates Monday.com in real-time"
7. [Switch to Monday.com tab] "See? Parking assigned automatically!"
```

---

## Support

Need help?
- Check the [main README](../README.md)
- Review the [Troubleshooting section](../README.md#troubleshooting)
- Open an issue on GitHub

---

**You're all set! Happy parking assignment! 🚗**