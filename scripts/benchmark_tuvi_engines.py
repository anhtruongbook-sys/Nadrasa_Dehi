import sys
import os
import json
import subprocess
sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612")
from lasotuvi.App import lapDiaBan
from lasotuvi.DiaBan import diaBan as DiaBanClass

# Test cases: (day, month, year, hour_val, is_male, label)
# Note: hour_val: 1=Tý, 2=Sửu, 3=Dần, 4=Mão, 5=Thìn, 6=Tỵ, 7=Ngọ, 8=Mùi, 9=Thân, 10=Dậu, 11=Tuất, 12=Hợi
test_cases = [
    {
        "day": 27, "month": 9, "year": 2026, "hour_val": 2, "hour_solar": 1, "is_male": True,
        "label": "27/09/2026 01:00 Nam (Bính Ngọ, giờ Sửu)"
    },
    {
        "day": 15, "month": 5, "year": 1990, "hour_val": 4, "hour_solar": 6, "is_male": False,
        "label": "15/05/1990 06:00 Nữ (Canh Ngọ, giờ Mão)"
    },
    {
        "day": 10, "month": 10, "year": 1985, "hour_val": 12, "hour_solar": 22, "is_male": True,
        "label": "10/10/1985 22:00 Nam (Ất Sửu, giờ Hợi)"
    },
    {
        "day": 1, "month": 1, "year": 2000, "hour_val": 7, "hour_solar": 12, "is_male": True,
        "label": "01/01/2000 12:00 Nam (Kỷ Mão, giờ Ngọ)"
    }
]

# Run node app engine
node_script = """
const fs = require('fs');
const path = require('path');

// Mock browser global
const global = {};
require('./modules/calendar_view.js'); // may export NetaCalendarEngine
// Check if calendar engine is in calendar_view or elsewhere
"""

# Let's inspect where calendar engine is defined in the app
