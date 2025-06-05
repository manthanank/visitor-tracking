# Visitor Tracking

This is a simple visitor tracking application built with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/visitor-tracking.git
    ```

2. Navigate to the project directory:

    ```sh
    cd visitor-tracking
    ```

3. Install dependencies:

    ```sh
    npm install
    ```

4. Create a `.env` file in the root directory of the project and add the following environment variables:

    ```sh
    # Server Configuration
    PORT=3000
    
    # Database Configuration
    MONGO_URI=mongodb://localhost:27017/visitor-tracking
    
    # Email Configuration (Required for daily insights)
    EMAIL_SERVICE=gmail
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASSWORD=your-app-password
    
    # Daily Insights Configuration
    EMAIL_RECIPIENTS=admin@example.com,manager@example.com
    DEFAULT_EMAIL_RECIPIENT=admin@example.com
    DAILY_INSIGHTS_CRON=0 9 * * *
    TIMEZONE=UTC
    ```

    **Note:** For Gmail, you'll need to use an App Password instead of your regular password. Generate one at: <https://myaccount.google.com/apppasswords>

5. Start the server:

    ```sh
    npm start

    # or run in development mode

    npm run dev
    ```

6. Visit `http://localhost:3000` in your browser.

## API Endpoints

### Visitors

- `GET /visits` - Get all visitors
- `POST /visit` - Create a new visitor record
- `GET /visit/:website` - Get all visitors for a specific website

### Email & Daily Insights

#### Email Configuration

- `POST /api/email/test-config` - Test email configuration
- `GET /api/email/insights/data` - Get daily insights data without sending email

#### Send Insights

- `POST /api/email/insights/send` - Send daily insights email immediately
- `POST /api/email/insights/test` - Send test daily insights email

#### Scheduler Management

- `POST /api/email/scheduler/start` - Start daily insights email scheduler
- `POST /api/email/scheduler/stop` - Stop daily insights email scheduler
- `GET /api/email/scheduler/status` - Get scheduler status
- `GET /api/email/cron-expressions` - Get available cron expressions

## Features

### 📊 Daily Email Insights

The application now supports automated daily email reports with comprehensive visitor analytics:

#### What's Included in Daily Insights

- **Total unique visitors** across all projects
- **Yesterday's visitor count** with growth rate comparison
- **Top 5 locations** by visitor count
- **Top 5 devices** used by visitors
- **Top 5 browsers** used by visitors
- **Project statistics** showing unique visitors per project
- **7-day visitor trend** with daily breakdown

#### Email Scheduling

- **Automated daily delivery** at configurable times
- **Multiple recipients** support
- **Flexible scheduling** with cron expressions
- **Beautiful HTML email** with professional styling

#### Usage Examples

**Start Daily Scheduler:**

```bash
POST /api/email/scheduler/start
Content-Type: application/json

{
  "recipients": ["admin@example.com", "manager@example.com"],
  "cronExpression": "0 9 * * *"
}
```

**Send Immediate Insights:**

```bash
POST /api/email/insights/send
Content-Type: application/json

{
  "recipients": ["admin@example.com"]
}
```

**Available Cron Schedules:**

- `0 9 * * *` - Daily at 9:00 AM
- `0 8 * * *` - Daily at 8:00 AM  
- `0 18 * * *` - Daily at 6:00 PM
- `0 9 * * 1-5` - Weekdays at 9:00 AM
- `0 9 * * 1` - Every Monday at 9:00 AM

### 🔧 Email Configuration

1. **Gmail Setup:**
   - Enable 2-Factor Authentication
   - Generate App Password at: <https://myaccount.google.com/apppasswords>
   - Use App Password in `EMAIL_PASSWORD` environment variable

2. **Other Email Providers:**
   - Update `EMAIL_SERVICE` to your provider (outlook, yahoo, etc.)
   - Or use custom SMTP settings

3. **Environment Variables:**

   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_RECIPIENTS=admin@example.com,manager@example.com
   DAILY_INSIGHTS_CRON=0 9 * * *
   TIMEZONE=UTC   ```

## License

Distributed under the MIT License. See `LICENSE` for more information.
