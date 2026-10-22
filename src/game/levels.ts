import { LevelConfig, WorldInfo } from './types.ts';

export const WORLDS: Record<string, WorldInfo> = {
  python: {
    id: 'python',
    name: 'Python Realm',
    subtitle: 'Syntax Grove & Logic Groves',
    color: '#0284c7', // Sky Blue / Azure
    accentBg: '#e0f2fe',
    borderColor: '#38bdf8',
    textColor: '#0369a1',
    icon: 'code-2',
    description: 'Master indentation, variables, loops, and function syntax while dodging bugs.',
    conceptSummary: [
      'Clean 4-space indentation rules',
      'Function definition: def func(args):',
      'Loop constructs: for item in list:',
      'Handling return values and syntax errors',
    ],
  },
  networking: {
    id: 'networking',
    name: 'Network Nexus',
    subtitle: 'Protocol Plains & Packet Routes',
    color: '#0d9488', // Teal / Cyan
    accentBg: '#ccfbf1',
    borderColor: '#2dd4bf',
    textColor: '#0f766e',
    icon: 'network',
    description: 'Route IP packets, dodge packet-dropper drones, and match port numbers to protocols.',
    conceptSummary: [
      'Standard Ports: HTTP (80), HTTPS (443), SSH (22), DNS (53)',
      'TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK',
      'IP addressing and subnet masks',
      'Packet transmission and latency',
    ],
  },
  database: {
    id: 'database',
    name: 'Database Depths',
    subtitle: 'Query Quarry & Schema Sanctum',
    color: '#6366f1', // Indigo
    accentBg: '#e0e7ff',
    borderColor: '#818cf8',
    textColor: '#4338ca',
    icon: 'database',
    description: 'Mine data crystals, fix corrupted foreign keys, and craft SQL queries to extract access keys.',
    conceptSummary: [
      'SELECT column_1, column_2 FROM table_name',
      'Filtering with WHERE conditions',
      'Relational Primary Keys and Foreign Keys',
      'ACID properties: Atomicity, Consistency, Isolation, Durability',
    ],
  },
  ml: {
    id: 'ml',
    name: 'Neural Citadel',
    subtitle: 'Tensor Peak & Gradient Crest',
    color: '#8b5cf6', // Violet
    accentBg: '#ede9fe',
    borderColor: '#a78bfa',
    textColor: '#6d28d9',
    icon: 'cpu',
    description: 'Navigate perceptual bridges, dodge overfitting traps, and tune neural decision boundaries.',
    conceptSummary: [
      'Perceptrons: output = activation(w · x + b)',
      'Loss functions & gradient descent',
      'Train vs. Validation split to prevent overfitting',
      'Classification decision boundaries and accuracy',
    ],
  },
};

export const LEVELS: LevelConfig[] = [
  // ================= LEVEL 1: PYTHON REALM =================
  {
    id: 1,
    worldId: 'python',
    title: 'Syntax Grove: Bug Exterminator',
    subtitle: 'Python Basics & Function Debugging',
    difficulty: 'Easy',
    targetXp: 800,
    totalCoins: 8,
    totalKeys: 1,
    timeLimitSec: 150,
    worldWidth: 2600,
    worldHeight: 700,
    spawnPoint: { x: 100, y: 520 },
    portalPoint: { x: 2450, y: 380 },
    tutorial: {
      guideName: 'Ada Lovelace, Tech Guide',
      headline: 'Welcome to the Python Realm!',
      objective: 'Explore Syntax Grove, squash the wandering Syntax Bugs, collect Python tokens, and use the Code Terminal to unlock the ancient Firewall Portal.',
      conceptTitle: 'Python Rules & Indentation',
      conceptDetails: 'In Python, code blocks are defined strictly by whitespace indentation (usually 4 spaces). Always remember that functions need a colon (:) at the end of their header line, and statements must be properly aligned!',
      controlsGuide: 'A / D or Arrow Keys to Run · Space or W to Jump · E or Click to Interact with Terminals & Portals · Shift or K to Dash',
      proTip: 'Jump on top of Syntax Bugs to squash them! Use the terminal ahead to solve the Python bug challenge and reveal the Gateway Key.',
    },
    puzzle: {
      id: 'p1_python_debug',
      type: 'code_debug',
      title: 'Terminal 01: Function Indentation & Return Bug',
      prompt: 'The security gate script is throwing an IndentationError and returning None. Fix the function so it computes total_power and returns the correct result!',
      instructions: '1. Ensure all lines inside the def block have 4-space indentation.\n2. Add the return statement for total_power.\n3. Click "Run & Verify".',
      initialState: `def unlock_firewall(core_energy, boost):\n# Bug: missing indentation and return!\ntotal_power = core_energy * 2 + boost\n# TODO: return total_power`,
      solution: {
        forbiddenSubstrings: ['None'],
        requiredSubstrings: ['return total_power'],
      },
      hints: [
        'Hint 1: Python uses 4 spaces to indicate that a line belongs inside a function definition.',
        'Hint 2: Indent line 3 by adding 4 spaces before "total_power".',
        'Hint 3: Replace line 4 with "    return total_power".',
      ],
      explanation: 'In Python, indentation defines block scope. Without indentation, Python raises an IndentationError. A function without a return statement implicitly returns None.',
    },
    platforms: [
      // Floor sections
      { x: 0, y: 600, w: 700, h: 100, type: 'solid' },
      { x: 780, y: 600, w: 600, h: 100, type: 'solid' },
      { x: 1460, y: 600, w: 1200, h: 100, type: 'solid' },

      // Stepping platforms
      { x: 220, y: 480, w: 140, h: 24, type: 'solid' },
      { x: 420, y: 380, w: 160, h: 24, type: 'solid' },
      { x: 650, y: 440, w: 120, h: 24, type: 'solid' },

      // Moving platform over the pit
      { x: 710, y: 530, w: 90, h: 20, type: 'moving', moveRange: { minX: 690, maxX: 790 }, speed: 60 },

      // Mid area elevated platforms
      { x: 880, y: 460, w: 180, h: 24, type: 'solid' },
      { x: 1120, y: 370, w: 180, h: 24, type: 'solid' },
      { x: 1350, y: 450, w: 120, h: 24, type: 'bounce' },

      // Terminal ledge
      { x: 1550, y: 460, w: 260, h: 24, type: 'solid' },

      // Upper path
      { x: 1880, y: 380, w: 160, h: 24, type: 'solid' },
      { x: 2120, y: 440, w: 150, h: 24, type: 'solid' },
      { x: 2360, y: 460, w: 240, h: 24, type: 'solid' }, // Portal ledge
    ],
    hazards: [
      // Pit spikes
      { x: 700, y: 660, w: 80, h: 40, type: 'spikes' },
      { x: 1380, y: 660, w: 80, h: 40, type: 'spikes' },
      // Security laser barrier
      { x: 1980, y: 380, w: 16, h: 220, type: 'laser', active: true },
    ],
    enemies: [
      { id: 'bug_1', x: 400, y: 560, w: 40, h: 32, type: 'syntax_bug', patrolMinX: 300, patrolMaxX: 620, speed: 70, hp: 1, maxHp: 1 },
      { id: 'bug_2', x: 950, y: 560, w: 40, h: 32, type: 'syntax_bug', patrolMinX: 850, patrolMaxX: 1200, speed: 85, hp: 1, maxHp: 1 },
      { id: 'bug_3', x: 1700, y: 560, w: 40, h: 32, type: 'syntax_bug', patrolMinX: 1600, patrolMaxX: 2000, speed: 90, hp: 1, maxHp: 1 },
    ],
    coins: [
      { id: 'c1', x: 250, y: 440, value: 100, type: 'coin' },
      { id: 'c2', x: 480, y: 330, value: 100, type: 'coin' },
      { id: 'c3', x: 920, y: 410, value: 100, type: 'coin' },
      { id: 'c4', x: 1170, y: 320, value: 100, type: 'coin' },
      { id: 'c5', x: 1390, y: 380, value: 150, type: 'gem' },
      { id: 'c6', x: 1620, y: 410, value: 100, type: 'coin' },
      { id: 'c7', x: 1920, y: 330, value: 100, type: 'coin' },
      { id: 'c8', x: 2160, y: 390, value: 150, type: 'gem' },
    ],
    keys: [
      { id: 'k1', x: 1720, y: 410, name: 'Python Root Key' },
    ],
    terminals: [
      { id: 'term_1', x: 1600, y: 404, w: 48, h: 56, label: 'Code Terminal 01' },
    ],
    checkpoints: [
      { id: 'cp_1', x: 1050, y: 550 },
    ],
  },

  // ================= LEVEL 2: COMPUTER NETWORKING =================
  {
    id: 2,
    worldId: 'networking',
    title: 'Protocol Plains: The Port Router',
    subtitle: 'IP Routing & Port Handshake',
    difficulty: 'Medium',
    targetXp: 1100,
    totalCoins: 10,
    totalKeys: 1,
    timeLimitSec: 160,
    worldWidth: 2800,
    worldHeight: 700,
    spawnPoint: { x: 100, y: 520 },
    portalPoint: { x: 2650, y: 360 },
    tutorial: {
      guideName: 'Alan Turing, Network Architect',
      headline: 'Welcome to the Network Nexus!',
      objective: 'Collect high-speed Data Packets, avoid the patrolling Packet Dropper Drones, and match protocols to their canonical port numbers in the Router Core.',
      conceptTitle: 'Standard Port Numbers & Protocols',
      conceptDetails: 'Every network service listens on a specific port. HTTP (Web) listens on 80, secure HTTPS on 443, SSH (Remote Terminal) on 22, and DNS (Domain Resolution) on 53.',
      controlsGuide: 'WASD / Arrows to Move & Jump · Double Jump available on pulse pads · E to configure the Router Terminal',
      proTip: 'Packet Dropper Drones scan the air above platforms! Wait for them to turn around or jump right onto their satellite antennae.',
    },
    puzzle: {
      id: 'p2_network_ports',
      type: 'network_ports',
      title: 'Router Core: Protocol Port Configuration',
      prompt: 'The main network switch was wiped during a DDoS surge! Route each incoming protocol to its official IANA standardized port number.',
      instructions: 'Click the dropdown or buttons to map HTTP, HTTPS, SSH, and DNS to their correct port numbers (80, 443, 22, 53).',
      initialState: { HTTP: null, HTTPS: null, SSH: null, DNS: null },
      solution: { HTTP: 80, HTTPS: 443, SSH: 22, DNS: 53 },
      hints: [
        'Hint 1: HTTP is port 80 (unencrypted web).',
        'Hint 2: HTTPS adds TLS encryption and uses port 443.',
        'Hint 3: SSH uses port 22; DNS uses port 53 for name resolution.',
      ],
      explanation: 'Port numbers allow the Transport Layer (TCP/UDP) to multiplex streams to the correct application layer processes. HTTP=80, HTTPS=443, SSH=22, DNS=53.',
    },
    platforms: [
      { x: 0, y: 600, w: 800, h: 100, type: 'solid' },
      { x: 880, y: 600, w: 750, h: 100, type: 'solid' },
      { x: 1700, y: 600, w: 1100, h: 100, type: 'solid' },

      // Fiber optic floating bridges
      { x: 240, y: 470, w: 130, h: 22, type: 'glass' },
      { x: 450, y: 390, w: 140, h: 22, type: 'glass' },
      { x: 670, y: 440, w: 120, h: 22, type: 'bounce' },

      // Router mid-tower
      { x: 920, y: 460, w: 150, h: 22, type: 'solid' },
      { x: 1140, y: 380, w: 170, h: 22, type: 'moving', moveRange: { minX: 1100, maxX: 1260 }, speed: 50 },
      { x: 1380, y: 440, w: 160, h: 22, type: 'glass' },

      // Terminal hub
      { x: 1750, y: 450, w: 280, h: 24, type: 'solid' },
      { x: 2100, y: 390, w: 150, h: 22, type: 'glass' },
      { x: 2320, y: 460, w: 160, h: 22, type: 'bounce' },
      { x: 2540, y: 440, w: 260, h: 24, type: 'solid' },
    ],
    hazards: [
      { x: 800, y: 660, w: 80, h: 40, type: 'spikes' },
      { x: 1630, y: 660, w: 70, h: 40, type: 'spikes' },
      { x: 2050, y: 360, w: 16, h: 240, type: 'laser', active: true },
    ],
    enemies: [
      { id: 'drone_1', x: 500, y: 340, w: 38, h: 32, type: 'packet_dropper', patrolMinX: 420, patrolMaxX: 680, speed: 75, hp: 1, maxHp: 1 },
      { id: 'drone_2', x: 1250, y: 330, w: 38, h: 32, type: 'packet_dropper', patrolMinX: 1150, patrolMaxX: 1400, speed: 90, hp: 1, maxHp: 1 },
      { id: 'drone_3', x: 1850, y: 550, w: 38, h: 32, type: 'syntax_bug', patrolMinX: 1750, patrolMaxX: 2100, speed: 80, hp: 1, maxHp: 1 },
      { id: 'drone_4', x: 2250, y: 340, w: 38, h: 32, type: 'packet_dropper', patrolMinX: 2150, patrolMaxX: 2450, speed: 95, hp: 1, maxHp: 1 },
    ],
    coins: [
      { id: 'c1', x: 280, y: 420, value: 100, type: 'packet' },
      { id: 'c2', x: 500, y: 340, value: 100, type: 'packet' },
      { id: 'c3', x: 700, y: 380, value: 150, type: 'gem' },
      { id: 'c4', x: 970, y: 410, value: 100, type: 'packet' },
      { id: 'c5', x: 1210, y: 330, value: 100, type: 'packet' },
      { id: 'c6', x: 1440, y: 390, value: 100, type: 'packet' },
      { id: 'c7', x: 1800, y: 400, value: 150, type: 'gem' },
      { id: 'c8', x: 1950, y: 400, value: 100, type: 'packet' },
      { id: 'c9', x: 2160, y: 340, value: 100, type: 'packet' },
      { id: 'c10', x: 2380, y: 400, value: 150, type: 'gem' },
    ],
    keys: [
      { id: 'k2', x: 1980, y: 400, name: 'Packet Gateway Key' },
    ],
    terminals: [
      { id: 'term_2', x: 1820, y: 394, w: 48, h: 56, label: 'Router Terminal' },
    ],
    checkpoints: [
      { id: 'cp_2', x: 1200, y: 550 },
    ],
  },

  // ================= LEVEL 3: DATABASES =================
  {
    id: 3,
    worldId: 'database',
    title: 'Query Quarry: SQL Decryption',
    subtitle: 'Relational Schema & SELECT Queries',
    difficulty: 'Hard',
    targetXp: 1400,
    totalCoins: 12,
    totalKeys: 1,
    timeLimitSec: 180,
    worldWidth: 3000,
    worldHeight: 700,
    spawnPoint: { x: 100, y: 520 },
    portalPoint: { x: 2850, y: 380 },
    tutorial: {
      guideName: 'Edgar F. Codd, Relational Pioneer',
      headline: 'Welcome to Database Depths!',
      objective: 'Traverse the relational schema corridors, defeat Null Pointer Phantoms, collect primary key crystals, and assemble the correct SQL query in the Database Terminal.',
      conceptTitle: 'Structured Query Language (SQL)',
      conceptDetails: 'SQL queries follow the declarative structure: SELECT <columns> FROM <table> WHERE <filter_conditions>. Filtering allows databases to rapidly index and isolate requested records.',
      controlsGuide: 'WASD / Arrows to Navigate · Watch out for moving Lock Contention hazards · E to access the SQL Query Terminal',
      proTip: 'Null Pointer Phantoms float and shoot glitch particles. Jump precisely on their heads or slip underneath when they float upward.',
    },
    puzzle: {
      id: 'p3_sql_query',
      type: 'sql_query',
      title: 'Database Vault: Admin Credential Extraction',
      prompt: 'Construct the SQL query to retrieve "username" and "role" from the "users" table for all accounts where "active = 1".',
      instructions: 'Click the SQL tokens or type the query into the terminal. Target query:\nSELECT username, role FROM users WHERE active = 1',
      initialState: 'SELECT  FROM users',
      solution: {
        selectColumns: ['username', 'role'],
        fromTable: 'users',
        whereConditions: ['active = 1'],
      },
      hints: [
        'Hint 1: Specify both required columns right after SELECT: "username, role".',
        'Hint 2: The table name is "users". Ensure "FROM users" is present.',
        'Hint 3: Add the filter: "WHERE active = 1" at the end.',
      ],
      explanation: 'SELECT specifies projection columns, FROM defines source relation, and WHERE applies predicate row-level filtering in relational calculus.',
    },
    platforms: [
      { x: 0, y: 600, w: 900, h: 100, type: 'solid' },
      { x: 980, y: 600, w: 900, h: 100, type: 'solid' },
      { x: 1960, y: 600, w: 1040, h: 100, type: 'solid' },

      // Database tables as platforms
      { x: 260, y: 480, w: 150, h: 24, type: 'solid' },
      { x: 480, y: 400, w: 160, h: 24, type: 'solid' },
      { x: 700, y: 330, w: 150, h: 24, type: 'moving', moveRange: { minX: 680, maxX: 850 }, speed: 60 },

      // Middle tiers
      { x: 1050, y: 460, w: 170, h: 24, type: 'solid' },
      { x: 1280, y: 380, w: 160, h: 24, type: 'bounce' },
      { x: 1500, y: 440, w: 160, h: 24, type: 'glass' },
      { x: 1720, y: 360, w: 170, h: 24, type: 'solid' },

      // Terminal sanctuary
      { x: 2050, y: 460, w: 290, h: 24, type: 'solid' },
      { x: 2400, y: 400, w: 160, h: 24, type: 'moving', moveRange: { minX: 2380, maxX: 2540 }, speed: 55 },
      { x: 2650, y: 460, w: 200, h: 24, type: 'solid' },
    ],
    hazards: [
      { x: 900, y: 660, w: 80, h: 40, type: 'spikes' },
      { x: 1880, y: 660, w: 80, h: 40, type: 'spikes' },
      { x: 2360, y: 360, w: 16, h: 240, type: 'laser', active: true },
    ],
    enemies: [
      { id: 'null_1', x: 550, y: 350, w: 40, h: 36, type: 'null_pointer', patrolMinX: 470, patrolMaxX: 650, speed: 60, hp: 1, maxHp: 1 },
      { id: 'null_2', x: 1100, y: 550, w: 40, h: 32, type: 'syntax_bug', patrolMinX: 1000, patrolMaxX: 1400, speed: 85, hp: 1, maxHp: 1 },
      { id: 'null_3', x: 1550, y: 390, w: 40, h: 36, type: 'null_pointer', patrolMinX: 1450, patrolMaxX: 1720, speed: 70, hp: 1, maxHp: 1 },
      { id: 'null_4', x: 2150, y: 550, w: 40, h: 32, type: 'syntax_bug', patrolMinX: 2050, patrolMaxX: 2350, speed: 90, hp: 1, maxHp: 1 },
    ],
    coins: [
      { id: 'c1', x: 300, y: 430, value: 100, type: 'coin' },
      { id: 'c2', x: 520, y: 350, value: 100, type: 'coin' },
      { id: 'c3', x: 760, y: 280, value: 150, type: 'gem' },
      { id: 'c4', x: 1090, y: 410, value: 100, type: 'coin' },
      { id: 'c5', x: 1320, y: 320, value: 150, type: 'gem' },
      { id: 'c6', x: 1540, y: 390, value: 100, type: 'coin' },
      { id: 'c7', x: 1760, y: 310, value: 100, type: 'coin' },
      { id: 'c8', x: 2100, y: 410, value: 100, type: 'coin' },
      { id: 'c9', x: 2260, y: 410, value: 150, type: 'gem' },
      { id: 'c10', x: 2450, y: 350, value: 100, type: 'coin' },
      { id: 'c11', x: 2700, y: 410, value: 100, type: 'coin' },
      { id: 'c12', x: 2800, y: 340, value: 150, type: 'gem' },
    ],
    keys: [
      { id: 'k3', x: 2280, y: 410, name: 'Root Schema Key' },
    ],
    terminals: [
      { id: 'term_3', x: 2120, y: 404, w: 48, h: 56, label: 'SQL Query Terminal' },
    ],
    checkpoints: [
      { id: 'cp_3', x: 1400, y: 550 },
    ],
  },

  // ================= LEVEL 4: MACHINE LEARNING =================
  {
    id: 4,
    worldId: 'ml',
    title: 'Tensor Peak: Perceptron Calibration',
    subtitle: 'Neural Weights & Decision Boundary',
    difficulty: 'Expert',
    targetXp: 1800,
    totalCoins: 14,
    totalKeys: 1,
    timeLimitSec: 200,
    worldWidth: 3200,
    worldHeight: 700,
    spawnPoint: { x: 100, y: 520 },
    portalPoint: { x: 3050, y: 380 },
    tutorial: {
      guideName: 'Geoffrey Hinton, Deep Learning Sage',
      headline: 'Welcome to the Neural Citadel!',
      objective: 'Traverse synaptic laser grids, outmaneuver Overfitting Phantoms, gather Tensor Nodes, and tune the weights in the Neural Terminal to achieve >= 88% classification accuracy.',
      conceptTitle: 'Perceptron Weights & Activation',
      conceptDetails: 'A single neuron computes a weighted sum of inputs plus bias: z = w1*x1 + w2*x2 + b. If z >= threshold, it outputs 1 (Signal), otherwise 0 (Noise). Tuning weights changes the slope and position of the decision boundary.',
      controlsGuide: 'WASD / Arrows to Move · Timed laser fields cycle every few seconds · E to tune the Neural Terminal',
      proTip: 'In the Neural puzzle, drag the weight slider until the line cleanly divides blue signal data from red noise points!',
    },
    puzzle: {
      id: 'p4_ml_weights',
      type: 'ml_weights',
      title: 'Neural Core: Binary Classifier Calibration',
      prompt: 'Tune the weight (w) and bias (b) sliders so the decision boundary achieves >= 88% accuracy separating Signal (1) from Noise (0).',
      instructions: 'Use the interactive sliders to set Weight and Bias. Target: separate positive coordinates from negative coordinates.',
      initialState: { weight: 0.2, bias: -0.5, threshold: 0.5 },
      solution: {
        samples: [
          { x1: 2.5, x2: 2.0, label: 1 },
          { x1: 2.0, x2: 1.5, label: 1 },
          { x1: 1.5, x2: 2.2, label: 1 },
          { x1: 1.0, x2: 1.0, label: 1 },
          { x1: 0.8, x2: 0.9, label: 1 },
          { x1: -1.0, x2: -0.5, label: 0 },
          { x1: -1.5, x2: -1.2, label: 0 },
          { x1: -2.0, x2: -1.8, label: 0 },
          { x1: -0.8, x2: -1.0, label: 0 },
        ],
      },
      hints: [
        'Hint 1: Since signal points have positive x1 and noise points have negative x1, set weight w between 1.0 and 2.0.',
        'Hint 2: Keep bias around 0.0 or slightly positive so the boundary cuts between positive and negative.',
        'Hint 3: Recommended values: Weight = 1.4, Bias = 0.0, Threshold = 0.5.',
      ],
      explanation: 'Linear decision boundaries partition feature space into two half-spaces. Optimizing parameters via loss minimization is the foundation of supervised machine learning.',
    },
    platforms: [
      { x: 0, y: 600, w: 900, h: 100, type: 'solid' },
      { x: 1000, y: 600, w: 1000, h: 100, type: 'solid' },
      { x: 2100, y: 600, w: 1100, h: 100, type: 'solid' },

      // Synapse bridges
      { x: 260, y: 470, w: 140, h: 22, type: 'glass' },
      { x: 480, y: 390, w: 150, h: 22, type: 'solid' },
      { x: 720, y: 440, w: 140, h: 22, type: 'bounce' },

      // Matrix platforms
      { x: 1060, y: 460, w: 160, h: 22, type: 'solid' },
      { x: 1280, y: 380, w: 160, h: 22, type: 'moving', moveRange: { minX: 1250, maxX: 1450 }, speed: 65 },
      { x: 1540, y: 440, w: 150, h: 22, type: 'glass' },
      { x: 1760, y: 360, w: 170, h: 22, type: 'solid' },

      // Core neural terminal
      { x: 2180, y: 450, w: 300, h: 24, type: 'solid' },
      { x: 2550, y: 380, w: 160, h: 22, type: 'bounce' },
      { x: 2780, y: 440, w: 180, h: 22, type: 'glass' },
      { x: 3000, y: 450, w: 200, h: 24, type: 'solid' },
    ],
    hazards: [
      { x: 900, y: 660, w: 100, h: 40, type: 'spikes' },
      { x: 2000, y: 660, w: 100, h: 40, type: 'spikes' },
      { x: 2500, y: 360, w: 16, h: 240, type: 'laser', active: true, cycleSec: 4 },
    ],
    enemies: [
      { id: 'ml_1', x: 520, y: 340, w: 38, h: 32, type: 'overfitter', patrolMinX: 450, patrolMaxX: 680, speed: 85, hp: 1, maxHp: 1 },
      { id: 'ml_2', x: 1100, y: 550, w: 40, h: 32, type: 'syntax_bug', patrolMinX: 1020, patrolMaxX: 1450, speed: 90, hp: 1, maxHp: 1 },
      { id: 'ml_3', x: 1600, y: 390, w: 38, h: 32, type: 'overfitter', patrolMinX: 1500, patrolMaxX: 1780, speed: 85, hp: 1, maxHp: 1 },
      { id: 'ml_4', x: 2250, y: 550, w: 40, h: 32, type: 'syntax_bug', patrolMinX: 2150, patrolMaxX: 2500, speed: 95, hp: 1, maxHp: 1 },
    ],
    coins: [
      { id: 'c1', x: 300, y: 420, value: 100, type: 'gem' },
      { id: 'c2', x: 530, y: 340, value: 100, type: 'gem' },
      { id: 'c3', x: 780, y: 390, value: 150, type: 'gem' },
      { id: 'c4', x: 1100, y: 410, value: 100, type: 'coin' },
      { id: 'c5', x: 1330, y: 330, value: 150, type: 'gem' },
      { id: 'c6', x: 1590, y: 390, value: 100, type: 'gem' },
      { id: 'c7', x: 1810, y: 310, value: 100, type: 'gem' },
      { id: 'c8', x: 2220, y: 400, value: 100, type: 'coin' },
      { id: 'c9', x: 2400, y: 400, value: 150, type: 'gem' },
      { id: 'c10', x: 2600, y: 330, value: 100, type: 'coin' },
      { id: 'c11', x: 2830, y: 390, value: 150, type: 'gem' },
      { id: 'c12', x: 2950, y: 540, value: 100, type: 'coin' },
      { id: 'c13', x: 3040, y: 400, value: 150, type: 'gem' },
      { id: 'c14', x: 3120, y: 400, value: 100, type: 'coin' },
    ],
    keys: [
      { id: 'k4', x: 2420, y: 400, name: 'Neural Convergence Key' },
    ],
    terminals: [
      { id: 'term_4', x: 2240, y: 394, w: 48, h: 56, label: 'Neural Terminal' },
    ],
    checkpoints: [
      { id: 'cp_4', x: 1650, y: 550 },
    ],
  },
];

export const BADGES: Array<{ id: string; name: string; description: string; icon: string }> = [
  { id: 'first_byte', name: 'First Byte', description: 'Complete your first TechQuest level', icon: 'zap' },
  { id: 'bug_hunter', name: 'Bug Hunter', description: 'Solve 3 code or logic puzzles on the first try', icon: 'shield-check' },
  { id: 'star_coder', name: 'Star Coder', description: 'Earn at least 6 stars across your journey', icon: 'star' },
  { id: 'tech_master', name: 'Full-Stack Hero', description: 'Conquer all 4 Technology Worlds', icon: 'award' },
  { id: 'xp_veteran', name: 'XP Grandmaster', description: 'Accumulate over 2,000 total Tech XP', icon: 'trophy' },
  { id: 'flawless', name: 'Clean Architecture', description: 'Complete any level without losing a single heart', icon: 'sparkles' },
];

export const DEFAULT_LEADERBOARD = [
  { rank: 1, name: 'Ada_Lovelace', score: 14850, xp: 4800, world: 'All Worlds', date: 'Oct 22' },
  { rank: 2, name: 'Grace_Hopper', score: 13920, xp: 4450, world: 'Database Depths', date: 'Oct 21' },
  { rank: 3, name: 'Turing_Enigma', score: 12700, xp: 4100, world: 'Network Nexus', date: 'Oct 20' },
  { rank: 4, name: 'Guido_Python', score: 11450, xp: 3800, world: 'Python Realm', date: 'Oct 19' },
  { rank: 5, name: 'Hinton_Perceptron', score: 9800, xp: 3200, world: 'Neural Citadel', date: 'Oct 18' },
];
