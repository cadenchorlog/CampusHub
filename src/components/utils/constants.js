// Constants used throughout the application
export const LOGIN_ENDPOINT = "https://api.cadenchorlog.com/api/login-fetch";
export const STORAGE_KEY = "coyotePortalCreds";
export const LAST_DATA_KEY = "coyotePortalLastData";

// Menu constants
export const BREAKFAST_STATIONS = ["Breakfast Bar", "Breakfast", "Global Breakfast"];
export const REPEATING_STATIONS = ["Comfort", "Global", "Deli", "Soup", "Pizza", "Grill", "Grill Special"];

// Time constants for menu display
export const BREAKFAST_END = 10 * 60 + 15; // 10:15 AM
export const LUNCH_END = 13 * 60 + 30;     // 1:30 PM
export const BRUNCH_END = 13 * 60 + 30;    // 1:30 PM
export const BREAKFAST_START = 7 * 60 + 30; // 7:30 AM
export const LUNCH_START = 10 * 60 + 45;    // 10:45 AM
export const BRUNCH_START = 8 * 60 + 30;    // 8:30 AM
export const DINNER_START = 17 * 60 + 30;   // 5:30 PM
export const DINNER_END = 20 * 60;          // 8:00 PM
export const DEN_CLOSE = 22 * 60;           // 10:00 PM
export const CLOSE_TIME = 20 * 60;          // 8:00 PM

// Account labels
export const ACCOUNT_LABELS = {
  "Meals": "Meals",
  "Dining Dollars": "Dining Dollars",
  "Coyote Cash": "Coyote Cash"
};
