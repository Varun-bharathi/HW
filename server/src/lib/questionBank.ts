export interface QuestionTemplate {
    category: 'Data Structures' | 'DBMS' | 'Software Testing' | 'Debugging' | 'Cloud Computing' | 'Leetcode' | 'Verbal' | 'Quantitative' | 'Logical Reasoning'
    type: 'mcq' | 'coding'
    content: string
    options?: string[]
    solution?: string // For basic checking or reference
    correctIndex?: number
    starterCode?: string | Record<string, string>
    testCases?: { input: string; expected: string }[]
    examples?: { input: string; output: string; explanation?: string }[]
}

export const QUESTION_POOL: QuestionTemplate[] = [
    // ... MCQS ...
    {
        category: 'Data Structures',
        type: 'mcq',
        content: 'Which data structure uses LIFO (Last In First Out) order?',
        options: ['Queue', 'Stack', 'Array', 'LinkedList'],
        correctIndex: 1
    },
    // ... (Keep MCQs as is, assumed correctly, but I need to replace the whole file or carefully select ranges.
    // I will replace the Leetcode section primarily and the interface at top.)
    // Wait, replacing *whole* file contents cleanly is better or I can do 2 chunks.
    // Let's do 2 chunks.

    // --- Data Structures (MCQ) ---
    {
        category: 'Data Structures',
        type: 'mcq',
        content: 'Which data structure uses LIFO (Last In First Out) order?',
        options: ['Queue', 'Stack', 'Array', 'LinkedList'],
        correctIndex: 1
    },
    {
        category: 'Data Structures',
        type: 'mcq',
        content: 'What is the time complexity of accessing an element in an Array by index?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
        correctIndex: 2
    },
    {
        category: 'Data Structures',
        type: 'mcq',
        content: 'Which data structure is best for implementing a priority queue?',
        options: ['Stack', 'Heap', 'Array', 'Hash Map'],
        correctIndex: 1
    },
    {
        category: 'Data Structures',
        type: 'mcq',
        content: 'In a binary search tree, which traversal visits nodes in sorted order?',
        options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
        correctIndex: 2
    },

    // --- DBMS (MCQ) ---
    {
        category: 'DBMS',
        type: 'mcq',
        content: 'What does ACID stand for in databases?',
        options: [
            'Atomicity, Consistency, Isolation, Durability',
            'Accuracy, Consistency, Isolation, Database',
            'Atomicity, Capture, Isolation, Data',
            'Access, Consistency, Integrity, Durability'
        ],
        correctIndex: 0
    },
    {
        category: 'DBMS',
        type: 'mcq',
        content: 'Which SQL command is used to remove a table entirely?',
        options: ['DELETE', 'REMOVE', 'DROP', 'TRUNCATE'],
        correctIndex: 2
    },
    {
        category: 'DBMS',
        type: 'mcq',
        content: 'What acts as a unique identifier for a record in a table?',
        options: ['Foreign Key', 'Primary Key', 'Index', 'Constraint'],
        correctIndex: 1
    },
    {
        category: 'DBMS',
        type: 'mcq',
        content: 'Which normal form eliminates partial dependency?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctIndex: 1
    },

    // --- Software Testing (MCQ) ---
    {
        category: 'Software Testing',
        type: 'mcq',
        content: 'Which testing is performed to ensure that new changes do not break existing functionality?',
        options: ['Unit Testing', 'Regression Testing', 'Integration Testing', 'Performance Testing'],
        correctIndex: 1
    },
    {
        category: 'Software Testing',
        type: 'mcq',
        content: 'What is "Black Box" testing?',
        options: [
            'Testing with knowledge of internal code',
            'Testing without knowledge of internal code',
            'Testing specifically for security',
            'Testing only the UI'
        ],
        correctIndex: 1
    },
    {
        category: 'Software Testing',
        type: 'mcq',
        content: 'What does SDLC stand for?',
        options: ['System Design Data Cycle', 'Software Development Life Cycle', 'System Development Live Cycle', 'Software Design Life Cycle'],
        correctIndex: 1
    },
    {
        category: 'Software Testing',
        type: 'mcq',
        content: 'Who typically performs User Acceptance Testing (UAT)?',
        options: ['Developers', 'Testers', 'End Users / Clients', 'Project Managers'],
        correctIndex: 2
    },

    // --- Debugging (MCQ/Coding-lite) - Using MCQs for "Two questions from debugging" as interpreted usually for screening quizzes
    {
        category: 'Debugging',
        type: 'mcq',
        content: 'Which tool is commonly used for debugging JavaScript in the browser?',
        options: ['Console', 'Terminal', 'Compiler', 'Interpreter'],
        correctIndex: 0
    },
    {
        category: 'Debugging',
        type: 'mcq',
        content: 'What does a "breakpoint" do?',
        options: [
            'Stops program execution at a specific line',
            'Terminates the program completely',
            'Skips the next line of code',
            'Resets the variable values'
        ],
        correctIndex: 0
    },
    {
        category: 'Debugging',
        type: 'mcq',
        content: 'You see "NullReferenceException". What is the likely cause?',
        options: ['Division by zero', 'Accessing a member on a null object', 'Infinite loop', 'Memory leak'],
        correctIndex: 1
    },
    {
        category: 'Debugging',
        type: 'mcq',
        content: 'What is the first step in debugging?',
        options: ['Fix the code', 'Reproduce the bug', 'Write documentation', 'Deploy to production'],
        correctIndex: 1
    },

    // --- Cloud Computing (MCQ) ---
    {
        category: 'Cloud Computing',
        type: 'mcq',
        content: 'Which of the following is NOT a service model in cloud computing?',
        options: ['IaaS', 'PaaS', 'SaaS', 'HaaS'],
        correctIndex: 3
    },
    {
        category: 'Cloud Computing',
        type: 'mcq',
        content: 'S3 in AWS stands for?',
        options: ['Simple Storage Solution', 'Simple Storage Service', 'Scalable Storage Service', 'System Storage Service'],
        correctIndex: 1
    },
    {
        category: 'Cloud Computing',
        type: 'mcq',
        content: 'Which cloud deployment model is shared by multiple organizations?',
        options: ['Private Cloud', 'Public Cloud', 'Community Cloud', 'Hybrid Cloud'],
        correctIndex: 2
    },
    {
        category: 'Cloud Computing',
        type: 'mcq',
        content: 'What allows resources to scale up and down automatically?',
        options: ['Load Balancing', 'Elasticity', 'Virtualization', 'Clustering'],
        correctIndex: 1
    },

    // --- Leetcode (Coding) ---
    {
        category: 'Leetcode',
        type: 'coding',
        content: 'Two Sum: Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        starterCode: '// Write your solution here\nfunction twoSum(nums, target) {\n  \n}',
        examples: [
            { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
            { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
            { input: 'nums = [3,3], target = 6', output: '[0,1]' }
        ],
        testCases: [
            { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
            { input: '[3, 2, 4], 6', expected: '[1, 2]' },
            { input: '[3, 3], 6', expected: '[0, 1]' },
            { input: '[2, 5, 5, 11], 10', expected: '[1, 2]' },
            { input: '[0, 4, 3, 0], 0', expected: '[0, 3]' },
            { input: '[-1, -2, -3, -4, -5], -8', expected: '[2, 4]' },
            { input: '[1, 2, 3, 4, 5, 6], 11', expected: '[4, 5]' },
            { input: '[100, 200, 300, 400], 700', expected: '[2, 3]' },
            { input: '[1, 5, 9, 13], 18', expected: '[1, 3]' },
            { input: '[-10, 20, 30, -5], -15', expected: '[0, 3]' }
        ]
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: 'Palindrome Number: Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward.',
        starterCode: '// Write your solution here\nfunction isPalindrome(x) {\n  \n}',
        examples: [
            { input: 'x = 121', output: 'true', explanation: '121 reads as 121 from left to right and from right to left.' },
            { input: 'x = -121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.' },
            { input: 'x = 10', output: 'false', explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.' }
        ],
        testCases: [
            { input: '121', expected: 'true' },
            { input: '-121', expected: 'false' },
            { input: '10', expected: 'false' },
            { input: '0', expected: 'true' },
            { input: '1221', expected: 'true' },
            { input: '12321', expected: 'true' },
            { input: '12345', expected: 'false' },
            { input: '11', expected: 'true' },
            { input: '-101', expected: 'false' },
            { input: '1000000001', expected: 'true' }
        ]
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: 'Reverse String: Write a function that reverses a string. The input string is given as an array of characters `s`.',
        starterCode: '// Write your solution here\nfunction reverseString(s) {\n  \n}',
        examples: [
            { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
            { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
        ],
        testCases: [
            { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
            { input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' },
            { input: '["a"]', expected: '["a"]' },
            { input: '["a", "b"]', expected: '["b", "a"]' },
            { input: '["A", " ", "M", "a", "n"]', expected: '["n", "a", "M", " ", "A"]' },
            { input: '[]', expected: '[]' },
            { input: '["1", "2", "3", "4", "5"]', expected: '["5", "4", "3", "2", "1"]' },
            { input: '["!", "@", "#"]', expected: '["#", "@", "!"]' },
            { input: '["R", "a", "c", "e"]', expected: '["e", "c", "a", "R"]' },
            { input: '["M", "a", "d", "a", "m"]', expected: '["m", "a", "d", "a", "M"]' }
        ]
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: 'FizzBuzz: Return an array of strings for numbers 1 to n. For multiples of 3, "Fizz"; for 5, "Buzz"; for both, "FizzBuzz".',
        starterCode: '// Write your solution here\nfunction fizzBuzz(n) {\n  \n}',
        examples: [
            { input: 'n = 3', output: '["1","2","Fizz"]' },
            { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' },
            { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
        ],
        testCases: [
            { input: '3', expected: '["1","2","Fizz"]' },
            { input: '5', expected: '["1","2","Fizz","4","Buzz"]' },
            { input: '15', expected: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
            { input: '1', expected: '["1"]' },
            { input: '2', expected: '["1","2"]' },
            { input: '6', expected: '["1","2","Fizz","4","Buzz","Fizz"]' },
            { input: '10', expected: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz"]' },
            { input: '4', expected: '["1","2","Fizz","4"]' },
            { input: '7', expected: '["1","2","Fizz","4","Buzz","Fizz","7"]' },
            { input: '8', expected: '["1","2","Fizz","4","Buzz","Fizz","7","8"]' }
        ]
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: 'Valid Anagram: Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
        starterCode: '// Write your solution here\nfunction isAnagram(s, t) {\n  \n}',
        examples: [
            { input: 's = "anagram", t = "nagaram"', output: 'true' },
            { input: 's = "rat", t = "car"', output: 'false' }
        ],
        testCases: [
            { input: '["anagram", "nagaram"]', expected: 'true' },
            { input: '["rat", "car"]', expected: 'false' },
            { input: '["", ""]', expected: 'true' },
            { input: '["a", "ab"]', expected: 'false' },
            { input: '["ab", "a"]', expected: 'false' },
            { input: '["listen", "silent"]', expected: 'true' },
            { input: '["hello", "bello"]', expected: 'false' },
            { input: '["aabb", "bbaa"]', expected: 'true' },
            { input: '["abc", "cba"]', expected: 'true' },
            { input: '["triangle", "integral"]', expected: 'true' }
        ]
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: 'Single Number: Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.',
        starterCode: '// Write your solution here\nfunction singleNumber(nums) {\n  \n}',
        examples: [
            { input: 'nums = [2,2,1]', output: '1' },
            { input: 'nums = [4,1,2,1,2]', output: '4' },
            { input: 'nums = [1]', output: '1' }
        ],
        testCases: [
            { input: '[2,2,1]', expected: '1' },
            { input: '[4,1,2,1,2]', expected: '4' },
            { input: '[1]', expected: '1' },
            { input: '[1,1,2,2,3]', expected: '3' },
            { input: '[10,20,10,30,20]', expected: '30' },
            { input: '[-1,-1,-2]', expected: '-2' },
            { input: '[0,1,0]', expected: '1' },
            { input: '[9,9,5,5,1]', expected: '1' },
            { input: '[7,3,7,3,4]', expected: '4' },
            { input: '[100]', expected: '100' }
        ]
    }
]
