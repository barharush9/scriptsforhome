# MongoDB Installation Script for Windows

## Option 1: Install MongoDB Community Server (Recommended)

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows x64" and download the MSI installer

2. **Install MongoDB:**
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install as a Service (recommended)
   - Install MongoDB Compass (optional GUI)

3. **Verify Installation:**
   ```powershell
   # Test if MongoDB is running
   Get-Service -Name MongoDB
   
   # Or try connecting
   mongo --version
   ```

## Option 2: Use Docker (Alternative)

If you have Docker installed:

```bash
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name apartment-scanner-db mongo:latest

# To stop the container
docker stop apartment-scanner-db

# To start it again
docker start apartment-scanner-db
```

## Option 3: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get the connection string
5. Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apartment_scanner
   ```

## Verification

Once MongoDB is running, restart the backend:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
```

## Troubleshooting

**MongoDB won't start:**
- Check Windows Services for "MongoDB" service
- Try running `mongod` in command prompt
- Check if port 27017 is available

**Connection refused:**
- Make sure MongoDB service is running
- Check firewall settings
- Verify the connection string in `.env`

**Still having issues?**
The application will work without MongoDB for demonstration purposes, but you won't be able to save listings or use the scraping features.
