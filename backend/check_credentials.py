#!/usr/bin/env python3
"""
Simple test for Google Calendar service account setup.
"""

import os
import json
from pathlib import Path

def check_service_account():
    """Check if service account file exists and is valid."""
    print("🔍 Checking Google Calendar Service Account Setup...\n")
    
    # Check if credentials directory exists
    creds_dir = Path(__file__).parent / "credentials"
    if not creds_dir.exists():
        print("❌ Credentials directory not found")
        return False
    
    # Check if service account file exists
    service_account_file = creds_dir / "service_account.json"
    if not service_account_file.exists():
        print("❌ service_account.json not found")
        print("💡 Please place your service account JSON file as:")
        print(f"   {service_account_file}")
        print("\n📝 Follow these steps:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Enable Google Calendar API")
        print("3. Create Service Account")
        print("4. Download JSON key")
        print("5. Save as service_account.json in credentials folder")
        return False
    
    # Check if file is valid JSON
    try:
        with open(service_account_file, 'r') as f:
            creds = json.load(f)
        
        print("✅ service_account.json found and valid")
        
        # Check required fields
        required_fields = ['type', 'client_email', 'private_key', 'project_id']
        missing_fields = [field for field in required_fields if field not in creds]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        
        if creds.get('type') != 'service_account':
            print("❌ Invalid credential type - should be 'service_account'")
            return False
        
        print(f"✅ Service account email: {creds['client_email']}")
        print(f"✅ Project ID: {creds['project_id']}")
        
        print("\n📋 Next steps:")
        print("1. Share your Google Calendar with this email:")
        print(f"   {creds['client_email']}")
        print("2. Make sure Calendar API is enabled in Google Cloud Console")
        print("3. Test the integration!")
        
        return True
        
    except json.JSONDecodeError:
        print("❌ service_account.json is not valid JSON")
        return False
    except Exception as e:
        print(f"❌ Error reading service account file: {e}")
        return False

if __name__ == "__main__":
    check_service_account()