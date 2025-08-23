"""
Google Calendar API integration for Ricky.
Provides functionality to fetch calendar events and manage calendar operations.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.oauth2.service_account import Credentials as ServiceAccountCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

# Google Calendar API scopes
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Credentials directory
CREDENTIALS_DIR = Path(__file__).parent.parent / "credentials"


class GoogleCalendarService:
    """
    Service for interacting with Google Calendar API.
    Supports both OAuth 2.0 and Service Account authentication.
    """
    
    def __init__(self):
        """Initialize the Google Calendar service."""
        self.service = None
        self.credentials = None
        
    async def initialize(self) -> bool:
        """
        Initialize the Google Calendar service with credentials.
        
        Returns:
            True if initialization successful, False otherwise
        """
        try:
            # Prioritize service account (no browser interaction needed)
            if await self._initialize_service_account():
                logger.info("✅ Google Calendar initialized with service account")
                return True
            else:
                logger.error("❌ Failed to initialize Google Calendar - no service account credentials found")
                logger.info("💡 Please place your service account JSON as 'service_account.json' in the credentials directory")
                logger.info("💡 And share your calendar with the service account email address")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error initializing Google Calendar: {e}")
            return False
    
    async def _initialize_service_account(self) -> bool:
        """Initialize with service account credentials."""
        try:
            # Check for service account file
            service_account_file = CREDENTIALS_DIR / "service_account.json"
            
            if not service_account_file.exists():
                logger.debug("Service account file not found")
                return False
            
            # Load service account credentials
            self.credentials = ServiceAccountCredentials.from_service_account_file(
                str(service_account_file),
                scopes=SCOPES
            )
            
            # Build the service
            self.service = build('calendar', 'v3', credentials=self.credentials)
            
            # Test the connection
            await self._test_connection()
            return True
            
        except FileNotFoundError:
            logger.debug("Service account credentials file not found")
            return False
        except Exception as e:
            logger.error(f"Error with service account authentication: {e}")
            return False
    
    async def _initialize_oauth(self) -> bool:
        """Initialize with OAuth 2.0 credentials."""
        try:
            client_secret_file = CREDENTIALS_DIR / "client_secret.json"
            token_file = CREDENTIALS_DIR / "token.json"
            
            if not client_secret_file.exists():
                logger.debug("OAuth client secret file not found")
                return False
            
            creds = None
            
            # Load existing token
            if token_file.exists():
                creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
            
            # If there are no (valid) credentials available, let the user log in
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    try:
                        creds.refresh(Request())
                        logger.info("🔄 Refreshed expired OAuth token")
                    except Exception as e:
                        logger.error(f"Failed to refresh token: {e}")
                        creds = None
                
                if not creds:
                    # Start the OAuth flow
                    logger.info("🔐 Starting OAuth 2.0 authentication flow...")
                    flow = InstalledAppFlow.from_client_secrets_file(
                        str(client_secret_file), SCOPES
                    )
                    # For server applications, you might want to use run_local_server
                    # with a specific port or run_console for headless servers
                    try:
                        creds = flow.run_local_server(port=8080, open_browser=True)
                        logger.info("✅ OAuth 2.0 authentication successful!")
                    except Exception as e:
                        logger.warning(f"Browser auth failed, trying console auth: {e}")
                        creds = flow.run_console()
                
                # Save the credentials for the next run
                with open(token_file, 'w') as token:
                    token.write(creds.to_json())
                logger.info("💾 Saved OAuth token for future use")
            
            self.credentials = creds
            self.service = build('calendar', 'v3', credentials=creds)
            
            # Test the connection
            await self._test_connection()
            return True
            
        except Exception as e:
            logger.error(f"Error with OAuth authentication: {e}")
            return False
    
    async def _test_connection(self):
        """Test the Google Calendar API connection."""
        try:
            # Simple test - get calendar list
            calendar_list = self.service.calendarList().list(maxResults=1).execute()
            logger.debug(f"Calendar API test successful - found {len(calendar_list.get('items', []))} calendars")
        except HttpError as e:
            raise Exception(f"Google Calendar API test failed: {e}")
    
    async def get_upcoming_events(
        self, 
        calendar_id: str = 'primary', 
        max_results: int = 10,
        time_min: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch upcoming events from Google Calendar.
        
        Args:
            calendar_id: Calendar ID to fetch events from (default: 'primary')
            max_results: Maximum number of events to return
            time_min: Minimum time for events (default: now)
            
        Returns:
            List of calendar events
        """
        if not self.service:
            raise Exception("Google Calendar service not initialized")
        
        try:
            # Set default time to now if not provided
            if time_min is None:
                time_min = datetime.utcnow()
            
            # Format time for API
            time_min_iso = time_min.isoformat() + 'Z'  # 'Z' indicates UTC time
            
            logger.info(f"🗓️ Fetching {max_results} upcoming events from calendar '{calendar_id}'")
            
            # Call the Calendar API
            events_result = self.service.events().list(
                calendarId=calendar_id,
                timeMin=time_min_iso,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            print("EVENTS : ", events_result)
            print("EVENTS AGAIN : ", events)
            
            # Process events into a more useful format
            processed_events = []
            for event in events:
                processed_event = {
                    'id': event.get('id'),
                    'summary': event.get('summary', 'No title'),
                    'description': event.get('description', ''),
                    'location': event.get('location', ''),
                    'start': self._parse_datetime(event.get('start', {})),
                    'end': self._parse_datetime(event.get('end', {})),
                    'attendees': [
                        {
                            'email': attendee.get('email'),
                            'name': attendee.get('displayName', attendee.get('email')),
                            'status': attendee.get('responseStatus', 'needsAction')
                        }
                        for attendee in event.get('attendees', [])
                    ],
                    'created': event.get('created'),
                    'updated': event.get('updated'),
                    'html_link': event.get('htmlLink'),
                    'organizer': event.get('organizer', {}),
                    'status': event.get('status', 'confirmed')
                }
                processed_events.append(processed_event)
            
            logger.info(f"✅ Retrieved {len(processed_events)} events")
            return processed_events
            
        except HttpError as error:
            logger.error(f"Google Calendar API error: {error}")
            raise Exception(f"Failed to fetch calendar events: {error}")
        except Exception as e:
            logger.error(f"Error fetching calendar events: {e}")
            raise Exception(f"Failed to fetch calendar events: {e}")
    
    def _parse_datetime(self, datetime_obj: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse Google Calendar datetime object.
        
        Args:
            datetime_obj: Google Calendar datetime object
            
        Returns:
            Parsed datetime information
        """
        if not datetime_obj:
            return {}
        
        # Handle all-day events (date only)
        if 'date' in datetime_obj:
            return {
                'date': datetime_obj['date'],
                'datetime': None,
                'timezone': None,
                'is_all_day': True
            }
        
        # Handle timed events (datetime)
        if 'dateTime' in datetime_obj:
            return {
                'date': datetime_obj['dateTime'][:10],  # Extract date part
                'datetime': datetime_obj['dateTime'],
                'timezone': datetime_obj.get('timeZone'),
                'is_all_day': False
            }
        
        return {}
    
    async def get_calendar_list(self) -> List[Dict[str, Any]]:
        """
        Get list of available calendars.
        
        Returns:
            List of calendar information
        """
        if not self.service:
            raise Exception("Google Calendar service not initialized")
        
        try:
            calendar_list = self.service.calendarList().list().execute()
            calendars = []
            
            for calendar in calendar_list.get('items', []):
                calendars.append({
                    'id': calendar.get('id'),
                    'summary': calendar.get('summary'),
                    'description': calendar.get('description', ''),
                    'timezone': calendar.get('timeZone'),
                    'access_role': calendar.get('accessRole'),
                    'primary': calendar.get('primary', False),
                    'selected': calendar.get('selected', False)
                })
            
            logger.info(f"✅ Retrieved {len(calendars)} calendars")
            return calendars
            
        except HttpError as error:
            logger.error(f"Error fetching calendar list: {error}")
            raise Exception(f"Failed to fetch calendar list: {error}")


# Global service instance
_calendar_service = None


async def get_calendar_service() -> GoogleCalendarService:
    """
    Get or create the global Google Calendar service instance.
    
    Returns:
        Initialized GoogleCalendarService instance
    """
    global _calendar_service
    
    if _calendar_service is None:
        _calendar_service = GoogleCalendarService()
        await _calendar_service.initialize()
    
    return _calendar_service


async def test_calendar_connection() -> Dict[str, Any]:
    """
    Test Google Calendar connection and return status.
    
    Returns:
        Connection status information
    """
    try:
        service = await get_calendar_service()
        
        if service.service is None:
            return {
                "status": "error",
                "message": "Failed to initialize Google Calendar service",
                "credentials_found": {
                    "service_account": (CREDENTIALS_DIR / "service_account.json").exists(),
                    "oauth_client": (CREDENTIALS_DIR / "client_secret.json").exists(),
                    "oauth_token": (CREDENTIALS_DIR / "token.json").exists()
                }
            }
        
        # Test by fetching a small number of events
        events = await service.get_upcoming_events(max_results=1)
        
        return {
            "status": "success",
            "message": "Google Calendar connection successful",
            "test_results": {
                "can_fetch_events": True,
                "sample_event_count": len(events)
            }
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": str(e),
            "credentials_found": {
                "service_account": (CREDENTIALS_DIR / "service_account.json").exists(),
                "oauth_client": (CREDENTIALS_DIR / "client_secret.json").exists(),
                "oauth_token": (CREDENTIALS_DIR / "token.json").exists()
            }
        }