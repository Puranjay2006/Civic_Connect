# 🔐 Civic Connect - Admin Passkeys

> **⚠️ CONFIDENTIAL** - Keep this document secure and do not share publicly.

---

## Super Admin

| Role | Passkey |
|------|---------|
| **Super Admin** | `ykls_764` |

*Super Admin has full access to all departments and system settings.*

---

## Department Admin Passkeys

| Department | Passkey |
|------------|---------|
| Public Works | `ljn_9871` |
| Health | `ljn_9872` |
| Education | `ljn_9873` |
| Environment | `ljn_9874` |
| Transport | `ljn_9875` |
| Water Supply | `ljn_9876` |
| Electricity | `ljn_9877` |
| Housing | `ljn_9878` |

---

## How to Login as Admin

1. Go to the **Login** page
2. Click on **"Admin Login"** 
3. Select your department (or leave blank for Super Admin)
4. Enter the corresponding passkey
5. Click **Login**

---

## Security Notes

- Change these passkeys in production by updating the `.env` file
- Passkeys are stored in `backend/.env`
- Never commit the `.env` file to version control
