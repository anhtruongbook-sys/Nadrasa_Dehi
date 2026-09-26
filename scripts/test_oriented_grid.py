# Complete verification of all 16 Tinh Ban in Period 9
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# The 8 cardinal/intercardinal directions with their 3 mountains each
# (Name, Palace, Period Star in Period 9)
DIRECTIONS = [
    {"name": "Nam",      "palace": "S",  "quai": 9, "van": 4, "deg": 180, "son1": "Bính", "son2": "Ngọ",  "son3": "Đinh"},
    {"name": "Tây Nam",  "palace": "SW", "quai": 2, "van": 6, "deg": 225, "son1": "Mùi",  "son2": "Khôn", "son3": "Thân"},
    {"name": "Tây",      "palace": "W",  "quai": 7, "van": 2, "deg": 270, "son1": "Canh", "son2": "Dậu",  "son3": "Tân"},
    {"name": "Tây Bắc",  "palace": "NW", "quai": 6, "van": 1, "deg": 315, "son1": "Tuất", "son2": "Càn",  "son3": "Hợi"},
    {"name": "Bắc",      "palace": "N",  "quai": 1, "van": 5, "deg": 0,   "son1": "Nhâm", "son2": "Tý",   "son3": "Quý"},
    {"name": "Đông Bắc", "palace": "NE", "quai": 8, "van": 3, "deg": 45,  "son1": "Sửu",  "son2": "Cấn",  "son3": "Dần"},
    {"name": "Đông",     "palace": "E",  "quai": 3, "van": 7, "deg": 90,  "son1": "Giáp", "son2": "Mão",  "son3": "Ất"},
    {"name": "Đông Nam", "palace": "SE", "quai": 4, "van": 8, "deg": 135, "son1": "Thìn", "son2": "Tốn",  "son3": "Tị"}
]

# When a house faces direction D, the 3x3 grid oriented with HƯỚNG at the top has 8 surrounding cells:
# If D is South:
# Top: SE, S, SW
# Mid: E,  C, W
# Bot: NE, N, NW
# If D is North:
# Top: NW, N, NE
# Mid: W,  C, E
# Bot: SW, S, SE
# If D is West:
# Top: SW, W, NW
# Mid: S,  C, N
# Bot: SE, E, NE
# If D is East:
# Top: NE, E, SE
# Mid: N,  C, S
# Bot: NW, W, SW
# If D is NW (Tây Bắc):
# Top: W,  NW, N
# Mid: SW, C,  NE
# Bot: S,  SE, E
# etc.

# Let's check the orientation of each direction:
# 8 directions in clockwise order:
CW_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

def get_oriented_grid(facing_palace):
    """
    Returns 3x3 palace IDs where:
    Row 0: [Front-Left, Front-Center (Facing), Front-Right]
    Row 1: [Mid-Left, Center, Mid-Right]
    Row 2: [Back-Left, Back-Center (Sitting), Back-Right]
    """
    idx = CW_DIRS.index(facing_palace)
    # Front-Center is CW_DIRS[idx]
    # Front-Left is CW_DIRS[(idx - 1) % 8]
    # Front-Right is CW_DIRS[(idx + 1) % 8]
    # Mid-Left is CW_DIRS[(idx - 2) % 8]
    # Mid-Right is CW_DIRS[(idx + 2) % 8]
    # Back-Left is CW_DIRS[(idx - 3) % 8]
    # Back-Center is CW_DIRS[(idx + 4) % 8]
    # Back-Right is CW_DIRS[(idx + 3) % 8]
    
    return [
        [CW_DIRS[(idx - 1) % 8], CW_DIRS[idx], CW_DIRS[(idx + 1) % 8]],
        [CW_DIRS[(idx - 2) % 8], 'C',          CW_DIRS[(idx + 2) % 8]],
        [CW_DIRS[(idx - 3) % 8], CW_DIRS[(idx + 4) % 8], CW_DIRS[(idx + 3) % 8]]
    ]

# Let's test get_oriented_grid for South:
grid_S = get_oriented_grid('S')
print("Facing South (Nam):")
for r in grid_S:
    print(" ", r)
# Output should be:
# ['SE', 'S', 'SW']
# ['E', 'C', 'W']
# ['NE', 'N', 'NW']

# Let's test get_oriented_grid for North:
grid_N = get_oriented_grid('N')
print("\nFacing North (Bắc):")
for r in grid_N:
    print(" ", r)
# Output should be:
# ['NW', 'N', 'NE']
# ['W', 'C', 'E']
# ['SW', 'S', 'SE']

# Let's test get_oriented_grid for West:
grid_W = get_oriented_grid('W')
print("\nFacing West (Tây):")
for r in grid_W:
    print(" ", r)
# Output should be:
# ['SW', 'W', 'NW']
# ['S', 'C', 'N']
# ['SE', 'E', 'NE']
