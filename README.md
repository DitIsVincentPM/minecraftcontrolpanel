# MinecraftCP - Pterodactyl Panel Frontend

A modern, beautiful frontend for Pterodactyl Panel that provides a clean interface for managing Minecraft servers through the Pterodactyl Client API.

## Features

- **Real-time Server Management**: Start, stop, restart servers with live status updates
- **Console Interface**: Real-time console output with WebSocket connection
- **File Manager**: Browse, edit, upload, and manage server files
- **Plugin Manager**: Browse and install plugins (UI ready for integration)
- **Backup System**: Create, restore, and manage server backups
- **Activity Monitoring**: Real-time server stats and performance monitoring
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Prerequisites

- Pterodactyl Panel with API access
- Client API key from your Pterodactyl Panel
- Node.js 18+ for development

## Setup

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd minecraft-control-panel
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Pterodactyl Panel configuration:
   ```env
   VITE_PANEL_API_URL=https://game.vincentvanhoof.be
   VITE_PANEL_API_TOKEN=ptla_Fe2x9E3wDHX9f2mXJDXdSkzA2jl3IQ6hzPX9JHdd3KT
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## CORS Configuration Issues

If you're seeing CORS errors (like "405 Method Not Allowed" for OPTIONS requests), this is because your Pterodactyl Panel doesn't allow cross-origin requests from your frontend domain.

### Solution 1: Configure CORS on Pterodactyl Panel (Recommended for Production)

Add the following to your Pterodactyl Panel's configuration:

**In your panel's `.env` file:**
```env
APP_URL=https://game.vincentvanhoof.be
TRUSTED_PROXIES=*

# Add CORS configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

**Or configure your web server (Nginx/Apache) to handle CORS:**

For Nginx, add to your server block:
```nginx
location /api/ {
    add_header 'Access-Control-Allow-Origin' 'http://localhost:5173' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'http://localhost:5173' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    # Your existing proxy configuration
    proxy_pass http://localhost:80;
}
```

### Solution 2: Use a CORS Proxy (Development Only)

For development, the application will automatically use a CORS proxy. You can also use browser extensions like "CORS Unblock" or run Chrome with disabled security:

```bash
# Chrome with disabled CORS (development only)
chrome --disable-web-security --user-data-dir=/tmp/chrome_dev_session
```

### Solution 3: Browser Extension

Install a CORS browser extension like:
- "CORS Unblock" for Chrome
- "CORS Everywhere" for Firefox

**⚠️ Warning**: Only use CORS-disabling solutions for development. Never disable CORS in production.

## Authentication

Default login credentials for the demo:
- **Username**: `admin`
- **Password**: `admin`

## Pterodactyl API Integration

The frontend integrates with Pterodactyl Client API endpoints:

### Server Management
- **List Servers**: `GET /api/client`
- **Server Details**: `GET /api/client/servers/{server}`
- **Server Stats**: `GET /api/client/servers/{server}/resources`
- **Power Control**: `POST /api/client/servers/{server}/power`

### Console & Commands
- **WebSocket**: `GET /api/client/servers/{server}/websocket`
- **Send Command**: `POST /api/client/servers/{server}/command`

### File Management
- **List Files**: `GET /api/client/servers/{server}/files/list`
- **File Contents**: `GET /api/client/servers/{server}/files/contents`
- **Write File**: `POST /api/client/servers/{server}/files/write`
- **Delete Files**: `POST /api/client/servers/{server}/files/delete`

### Backups
- **List Backups**: `GET /api/client/servers/{server}/backups`
- **Create Backup**: `POST /api/client/servers/{server}/backups`
- **Download Backup**: `GET /api/client/servers/{server}/backups/{backup}/download`
- **Delete Backup**: `DELETE /api/client/servers/{server}/backups/{backup}`

## Development Mode

When running in development mode (`npm run dev`), the application includes:

1. **Mock Data Fallback**: If API requests fail due to CORS, mock data is used
2. **CORS Proxy Option**: Configurable CORS proxy for development
3. **Enhanced Error Messages**: Better debugging information for CORS issues

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Configure environment variables**
   ```env
   VITE_PANEL_API_URL=https://your-panel.example.com
   VITE_PANEL_API_TOKEN=your_production_api_token
   ```

3. **Deploy the `dist` folder** to your web server

4. **Configure CORS** on your Pterodactyl Panel to include your production domain

## Troubleshooting

### CORS Issues
- **Error**: "405 Method Not Allowed" for OPTIONS requests
- **Solution**: Configure CORS on your Pterodactyl Panel or use a development proxy
- **Check**: Ensure your panel URL is correct and accessible

### API Authentication Issues
- **Error**: "Invalid API token"
- **Solution**: Verify the API token is correct and has proper permissions
- **Check**: Ensure you're using a Client API token, not Application API token

### WebSocket Connection Issues
- **Error**: WebSocket connection failed
- **Solution**: Verify WebSocket connections are allowed through your firewall
- **Check**: Ensure SSL is properly configured for WebSocket connections

### Development vs Production
- **Development**: Uses mock data fallback when CORS fails
- **Production**: Requires proper CORS configuration on the panel

## Security Considerations

- Always use HTTPS in production
- Secure your API tokens and never expose them in client-side code
- Configure CORS properly on your Pterodactyl Panel
- Restrict API access to trusted networks when possible
- Consider implementing proper authentication beyond the demo login

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with a real Pterodactyl Panel installation
5. Submit a pull request

## License

MIT License - see LICENSE file for details