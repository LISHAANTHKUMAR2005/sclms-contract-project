# Render & Aiven Setup Guide

To fully resolve the database persistence issues and the 403 Forbidden errors, you need to configure your Render service to use the Aiven MySQL database.

## 1. Configure Environment Variables in Render

Go to your **Render Dashboard** -> Select your **Backend Service** -> **Environment**.
Add the following Environment Variables:

| Key | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://mysql-c5e8151-sclms-project.d.aivencloud.com:15385/defaultdb?sslMode=REQUIRED` |
| `SPRING_DATASOURCE_USERNAME` | `avnadmin` |
| `SPRING_DATASOURCE_PASSWORD` | `[PASTE_YOUR_AIVEN_PASSWORD_HERE]` |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | `com.mysql.cj.jdbc.Driver` |
| `SPRING_JPA_DATABASE_PLATFORM` | `org.hibernate.dialect.MySQL8Dialect` |

**Note:**
- I have updated the code to use these variables if they exist.
- If they are NOT set, the app will default to H2 (in-memory) database, which loses data on restart.
- `sslMode=REQUIRED` ensures a secure connection to Aiven.

## 2. Commit and Deploy

Run the following commands in your terminal to commit the changes and trigger a deployment:

```bash
git add .
git commit -m "Fix CORS and configure Aiven MySQL database connection"
git push
```

## 3. Verify the Fix

1.  Wait for the deployment to finish on Render.
2.  The application will now connect to the Aiven database.
3.  **Login as Admin** using the default credentials (which will be created in the new DB):
    - Email: `admin@sclms.com`
    - Password: `admin123`
4.  **Approve Users**: If you register a new user, they will be in `PENDING` status. You must login as Admin to approve them before they can login.
