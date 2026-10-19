// Demo subjects, topics, questions and quizzes. Edit freely: it only loads into an EMPTY database.
//
// MCQ format:    [topic, question, correctAnswer, [wrong, wrong, wrong], difficulty, explanation]
// Theory format: [topic, question, modelAnswer, [keywords], marks, difficulty]

export const SUBJECTS = [
  { name: 'Data Structures & Algorithms', color: '#6d4aff', description: 'Core structures and the algorithms that use them.', topics: ['Arrays & Linked Lists', 'Stacks & Queues', 'Trees', 'Sorting & Searching'] },
  { name: 'Database Systems', color: '#ec4899', description: 'SQL, design and transaction management.', topics: ['SQL Basics', 'Normalization', 'Transactions'] },
  { name: 'Computer Networks', color: '#0ea5e9', description: 'How data moves between machines.', topics: ['OSI & TCP/IP', 'IP Addressing', 'Network Protocols'] },
];

export const MCQS = [
  // ---- Data Structures & Algorithms
  ['Arrays & Linked Lists', 'What is the time complexity of reading an array element by its index?', 'O(1)', ['O(n)', 'O(log n)', 'O(n²)'], 'easy', 'Elements sit next to each other in memory, so the address is calculated directly.'],
  ['Arrays & Linked Lists', 'What is the main advantage of a linked list over an array?', 'Insert or delete at a known position without shifting elements', ['Faster random access', 'Less memory per element', 'Better cache locality'], 'medium', 'Only pointers change; nothing needs to move.'],
  ['Arrays & Linked Lists', 'Which technique detects a cycle in a linked list using O(1) extra space?', "Floyd's tortoise and hare", ['Storing visited nodes in a hash set', 'Sorting the list first', 'Recursion'], 'hard', 'A slow and a fast pointer meet inside the loop if one exists.'],
  ['Arrays & Linked Lists', "In a singly linked list, what does the last node's next pointer hold?", 'null', ['The head node', 'Its own address', 'The previous node'], 'easy', 'null marks the end of the list.'],
  ['Stacks & Queues', 'Which principle does a stack follow?', 'LIFO', ['FIFO', 'Random access', 'Priority order'], 'easy', 'Last In, First Out: the newest item leaves first.'],
  ['Stacks & Queues', 'Which data structure does Breadth-First Search use?', 'Queue', ['Stack', 'Heap', 'Binary tree'], 'medium', 'BFS visits nodes level by level, which is first-in first-out.'],
  ['Stacks & Queues', 'What is the postfix form of A + B * C?', 'ABC*+', ['AB+C*', 'ABC+*', 'A+BC*'], 'hard', 'Multiplication binds tighter, so B*C is done first and then added to A.'],
  ['Stacks & Queues', 'Why is a circular queue used with a fixed-size array?', 'To reuse the space freed at the front', ['To sort the elements', 'To search faster', 'To store duplicates'], 'medium', 'The rear wraps around to the beginning instead of wasting freed slots.'],
  ['Trees', 'How many children can a binary tree node have at most?', '2', ['1', '3', 'Unlimited'], 'easy', 'Binary means at most two: left and right.'],
  ['Trees', 'Which traversal of a binary search tree gives sorted output?', 'Inorder', ['Preorder', 'Postorder', 'Level order'], 'medium', 'Left, node, right visits values in ascending order.'],
  ['Trees', 'What is the worst-case search time in an unbalanced BST with n nodes?', 'O(n)', ['O(log n)', 'O(1)', 'O(n log n)'], 'hard', 'The tree can degrade into a linked list.'],
  ['Trees', 'The height of a complete binary tree with n nodes is about', 'log₂ n', ['n', 'n / 2', 'n²'], 'medium', 'Each level roughly doubles the number of nodes.'],
  ['Sorting & Searching', 'Binary search requires the data to be', 'Sorted', ['Unique', 'Stored in a linked list', 'Smaller than 100 items'], 'easy', 'Halving the range only works when order is known.'],
  ['Sorting & Searching', 'What is the average time complexity of merge sort?', 'O(n log n)', ['O(n²)', 'O(n)', 'O(log n)'], 'medium', 'log n levels of splitting, n work per level.'],
  ['Sorting & Searching', 'Which sort is stable and has O(n log n) worst-case time?', 'Merge sort', ['Quick sort', 'Selection sort', 'Heap sort'], 'hard', 'Quick sort degrades to O(n²) and heap sort is not stable.'],
  ['Sorting & Searching', 'What is the worst-case time complexity of bubble sort?', 'O(n²)', ['O(n log n)', 'O(n)', 'O(1)'], 'easy', 'Two nested passes over the data.'],
  // ---- Database Systems
  ['SQL Basics', 'Which SQL clause filters rows BEFORE grouping?', 'WHERE', ['HAVING', 'GROUP BY', 'ORDER BY'], 'easy', 'HAVING filters after grouping.'],
  ['SQL Basics', 'Which JOIN keeps every row of the left table even without a match?', 'LEFT JOIN', ['INNER JOIN', 'RIGHT JOIN', 'CROSS JOIN'], 'medium', 'Unmatched right-side columns become NULL.'],
  ['SQL Basics', 'Which clause filters the groups created by GROUP BY?', 'HAVING', ['WHERE', 'LIMIT', 'DISTINCT'], 'medium', 'WHERE cannot use aggregate functions; HAVING can.'],
  ['SQL Basics', 'What is a correlated subquery?', 'A subquery that references columns of the outer query', ['A subquery that runs once before the outer query', 'A query that joins three tables', 'A subquery that returns no rows'], 'hard', 'It is re-evaluated for each row of the outer query.'],
  ['Normalization', 'A table is in 1NF when', 'Every column holds atomic (single) values', ['It has no primary key', 'It has no foreign keys', 'All columns are numeric'], 'easy', 'No repeating groups or multi-valued cells.'],
  ['Normalization', 'Which normal form removes partial dependency on a composite key?', '2NF', ['1NF', '3NF', 'BCNF'], 'medium', 'Every non-key attribute must depend on the whole key.'],
  ['Normalization', 'Which normal form removes transitive dependencies?', '3NF', ['1NF', '2NF', '4NF'], 'medium', 'Non-key attributes may not depend on other non-key attributes.'],
  ['Normalization', 'What is the main purpose of normalization?', 'Reduce redundancy and update anomalies', ['Make every query faster', 'Encrypt the data', 'Increase the number of tables'], 'easy', 'Each fact is stored once.'],
  ['Transactions', "What does the 'A' in ACID stand for?", 'Atomicity', ['Availability', 'Aggregation', 'Authorization'], 'easy', 'All steps of a transaction happen or none do.'],
  ['Transactions', "Reading another transaction's uncommitted data is called a", 'Dirty read', ['Phantom read', 'Lost commit', 'Deadlock'], 'medium', 'If that transaction rolls back, you read data that never existed.'],
  ['Transactions', 'A schedule is conflict serializable if its precedence graph', 'Has no cycle', ['Has a cycle', 'Is empty', 'Has exactly one edge'], 'hard', 'An acyclic graph can be ordered into an equivalent serial schedule.'],
  ['Transactions', "Which command makes a transaction's changes permanent?", 'COMMIT', ['ROLLBACK', 'SAVEPOINT', 'CHECKPOINT'], 'easy', 'ROLLBACK does the opposite.'],
  // ---- Computer Networks
  ['OSI & TCP/IP', 'How many layers does the OSI model have?', '7', ['4', '5', '6'], 'easy', 'Physical, data link, network, transport, session, presentation, application.'],
  ['OSI & TCP/IP', 'Which OSI layer is responsible for routing packets?', 'Network layer', ['Data link layer', 'Transport layer', 'Session layer'], 'medium', 'Routers work with IP addresses at layer 3.'],
  ['OSI & TCP/IP', 'A switch mainly works at which OSI layer?', 'Data link layer', ['Network layer', 'Physical layer', 'Application layer'], 'medium', 'It forwards frames using MAC addresses.'],
  ['OSI & TCP/IP', 'TCP belongs to which OSI layer?', 'Transport layer', ['Network layer', 'Session layer', 'Application layer'], 'easy', 'TCP and UDP are transport-layer protocols.'],
  ['IP Addressing', 'How many bits are in an IPv4 address?', '32', ['16', '64', '128'], 'easy', 'Four octets of 8 bits each.'],
  ['IP Addressing', 'How many usable host addresses does a /24 network have?', '254', ['256', '255', '252'], 'medium', '2⁸ = 256, minus the network and broadcast addresses.'],
  ['IP Addressing', 'Which of these is a private IPv4 range?', '192.168.0.0/16', ['8.8.8.0/24', '172.32.0.0/16', '11.0.0.0/8'], 'medium', 'Private ranges: 10/8, 172.16/12 and 192.168/16.'],
  ['IP Addressing', 'The /26 subnet mask in dotted decimal is', '255.255.255.192', ['255.255.255.224', '255.255.255.128', '255.255.255.240'], 'hard', '26 ones = 255.255.255.11000000 = .192'],
  ['Network Protocols', 'Which protocol translates domain names into IP addresses?', 'DNS', ['DHCP', 'ARP', 'FTP'], 'easy', 'DNS is the internet phone book.'],
  ['Network Protocols', 'Which protocol automatically assigns IP addresses to devices?', 'DHCP', ['DNS', 'SMTP', 'ICMP'], 'easy', 'DHCP leases addresses from a pool.'],
  ['Network Protocols', 'Which transport protocol is connection-oriented and reliable?', 'TCP', ['UDP', 'ICMP', 'IP'], 'medium', 'TCP uses a handshake, acknowledgements and retransmission.'],
  ['Network Protocols', 'What does ARP do?', 'Maps an IP address to a MAC address', ['Maps a domain name to an IP address', 'Assigns IP addresses', 'Encrypts traffic'], 'hard', 'Used on a local network to find the hardware address of a host.'],
];

export const THEORY = [
  ['Arrays & Linked Lists', 'Explain two differences between an array and a linked list.', 'Arrays use contiguous memory and give O(1) random access, but inserting needs shifting. Linked lists use pointers, grow dynamically and insert quickly at a known node, but access is O(n).', ['contiguous', 'random access', 'pointer', 'dynamic', 'insert'], 4, 'medium'],
  ['Trees', 'What is a binary search tree? State its ordering rule.', 'A binary tree where every node is greater than all values in its left subtree and smaller than all values in its right subtree, so inorder traversal is sorted.', ['left', 'right', 'smaller', 'greater', 'inorder'], 3, 'medium'],
  ['Normalization', 'Why do we normalize a database? Name two anomalies it prevents.', 'To remove redundancy. It prevents insertion, update and deletion anomalies.', ['redundancy', 'insertion', 'update', 'deletion', 'anomal'], 3, 'medium'],
  ['Transactions', 'Explain the ACID properties briefly.', 'Atomicity: all or nothing. Consistency: valid state to valid state. Isolation: transactions do not interfere. Durability: committed data survives failures.', ['atomicity', 'consistency', 'isolation', 'durability'], 4, 'medium'],
  ['Network Protocols', 'What is the difference between TCP and UDP?', 'TCP is connection-oriented and reliable (handshake, acknowledgements, ordering). UDP is connectionless and faster but gives no delivery guarantee.', ['connection', 'reliable', 'handshake', 'faster', 'guarantee'], 3, 'medium'],
  ['OSI & TCP/IP', 'Name four layers of the OSI model and one job of each.', 'Physical: bits on the wire. Data link: frames and MAC addresses. Network: routing with IP. Transport: end-to-end delivery. Application: user-facing protocols.', ['physical', 'data link', 'network', 'transport', 'application'], 4, 'medium'],
];

// Quizzes pick questions by topic name. `count` = random questions drawn per attempt (0 = all).
export const QUIZZES = [
  { title: 'DSA Fundamentals', subject: 'Data Structures & Algorithms', topics: ['Arrays & Linked Lists', 'Stacks & Queues', 'Trees', 'Sorting & Searching'], count: 10, minutes: 20, published: true, description: 'A mixed check of the core structures.' },
  { title: 'Trees & Sorting Sprint', subject: 'Data Structures & Algorithms', topics: ['Trees', 'Sorting & Searching'], count: 6, minutes: 8, published: true, description: 'Short and sharp.' },
  { title: 'Database Essentials', subject: 'Database Systems', topics: ['SQL Basics', 'Normalization', 'Transactions'], count: 8, minutes: 15, published: true, description: 'SQL, normal forms and ACID.' },
  { title: 'Networking Basics', subject: 'Computer Networks', topics: ['OSI & TCP/IP', 'IP Addressing', 'Network Protocols'], count: 10, minutes: 15, published: true, description: 'Layers, addressing and protocols.' },
  { title: 'Midterm Mock (draft)', subject: 'Data Structures & Algorithms', topics: ['Arrays & Linked Lists', 'Trees'], count: 0, minutes: 30, published: false, description: 'Not visible to students until published.' },
];

// Demo students. `skill` = chance of a right answer, `weak` = topics where they struggle.
export const STUDENTS = [
  { name: 'Demo Student', email: 'student@quiz.com', skill: 0.8, weak: { 'Trees': 0.3, 'Normalization': 0.35, 'IP Addressing': 0.45 }, attempts: 9, streak: true },
  { name: 'Ayesha Khan', email: 'ayesha@quiz.com', skill: 0.88, weak: { 'Transactions': 0.5 }, attempts: 8, pending: true },
  { name: 'Hamza Raza', email: 'hamza@quiz.com', skill: 0.7, weak: { 'SQL Basics': 0.3 }, attempts: 7, pending: true },
  { name: 'Sana Malik', email: 'sana@quiz.com', skill: 0.62, weak: { 'Network Protocols': 0.25, 'Trees': 0.3 }, attempts: 6 },
  { name: 'Bilal Ahmed', email: 'bilal@quiz.com', skill: 0.45, weak: {}, attempts: 5 },
  { name: 'Zara Iqbal', email: 'zara@quiz.com', skill: 0.75, weak: { 'Sorting & Searching': 0.4 }, attempts: 6 },
];
