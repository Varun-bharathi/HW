import { QuestionTemplate } from './questionBank.js';

export const APTITUDE_POOL: QuestionTemplate[] = [
    // --- Verbal Ability (10 Questions) ---
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Choose the synonym for: "Ephemeral"',
        options: ['Lasting', 'Short-lived', 'Beautiful', 'Heavy'],
        correctIndex: 1
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Choose the antonym for: "Benevolent"',
        options: ['Kind', 'Malevolent', 'Generous', 'Happy'],
        correctIndex: 1
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Complete the sentence: "The scientist\'s theory was _____ by the new evidence."',
        options: ['Refuted', 'Accepted', 'Ignored', 'Created'],
        correctIndex: 0
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Identify the error: "He don\'t know the answer."',
        options: ['He', 'don\'t', 'know', 'answer'],
        correctIndex: 1
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Choose the correct spelling:',
        options: ['Accomodate', 'Accommodate', 'Acomodate', 'Acommodate'],
        correctIndex: 1
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: '"Break the ice" means:',
        options: ['To smash ice', 'To start a conflict', 'To initiate conversion/relieve tension', 'To feel cold'],
        correctIndex: 2
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'One who studies stars:',
        options: ['Astrologer', 'Astronomer', 'Archeologist', 'Anthropologist'],
        correctIndex: 1
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Choose the synonym for: "Candid"',
        options: ['Secretive', 'Frank', 'Dishonest', 'Shy'],
        correctIndex: 1
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Complete: "Neither of them _____ ready."',
        options: ['is', 'are', 'were', 'have'],
        correctIndex: 0
    },
    {
        category: 'Verbal',
        type: 'mcq',
        content: 'Choose the antonym for: "Obscure"',
        options: ['Clear', 'Hidden', 'Vague', 'Dark'],
        correctIndex: 0
    },

    // --- Quantitative Aptitude (10 Questions) ---
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'If 20% of a number is 12, what is the number?',
        options: ['40', '50', '60', '80'],
        correctIndex: 2
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'Average of 5 numbers is 20. If a number 10 is removed, what is new average?',
        options: ['22.5', '25', '20', '18'],
        correctIndex: 0
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'A car travels 300km in 5 hours. What is its speed?',
        options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
        correctIndex: 1
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'What is the next number in sequence: 2, 4, 8, 16, ?',
        options: ['18', '24', '30', '32'],
        correctIndex: 3
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'Cost price is $50, Selling price is $60. Profit percentage?',
        options: ['10%', '20%', '15%', '25%'],
        correctIndex: 1
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'Simple interest on $1000 at 5% for 2 years?',
        options: ['$50', '$100', '$150', '$200'],
        correctIndex: 1
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'If A can do a job in 4 days, B in 4 days. Together?',
        options: ['1 day', '2 days', '3 days', '8 days'],
        correctIndex: 1
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'Solve for x: 3x - 5 = 10',
        options: ['3', '5', '4', '6'],
        correctIndex: 1
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'Perimeter of a square with area 16?',
        options: ['8', '12', '16', '20'],
        correctIndex: 2
    },
    {
        category: 'Quantitative',
        type: 'mcq',
        content: 'Probability of getting Heads in one coin toss?',
        options: ['0.5', '0.25', '1', '0'],
        correctIndex: 0
    },

    // --- Logical Reasoning (10 Questions) ---
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'Bird is to Fly as Fish is to _____?',
        options: ['Walk', 'Swim', 'Crawl', 'Run'],
        correctIndex: 1
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'Which word does not belong?',
        options: ['Apple', 'Banana', 'Carrot', 'Grape'],
        correctIndex: 2
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'If CAT = 3120, DOG = ? (coding logic assumed A=1..)',
        options: ['4157', '4151', '4158', '4159'],
        correctIndex: 0 // Mock logic, assuming D=4, O=15, G=7. 4157.
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'Pointing to a photo, a man said "She is the daughter of my grandfather\'s only son". Who is she?',
        options: ['Mother', 'Sister', 'Aunt', 'Cousin'],
        correctIndex: 1
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?',
        options: ['7', '10', '12', '13'],
        correctIndex: 1
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'Which is the odd one out?',
        options: ['Square', 'Circle', 'Rectangle', 'Triangle'],
        correctIndex: 1 // Circle (no corners)
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'If today is Monday, what day is it after 3 days?',
        options: ['Wednesday', 'Thursday', 'Friday', 'Tuesday'],
        correctIndex: 1
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'Statement: All A are B. All B are C. Conclusion: All A are C?',
        options: ['True', 'False', 'Uncertain', 'None'],
        correctIndex: 0
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'A is taller than B. C is shorter than B. Who is tallest?',
        options: ['A', 'B', 'C', 'Unknown'],
        correctIndex: 0
    },
    {
        category: 'Logical Reasoning',
        type: 'mcq',
        content: 'Complete: M, O, Q, S, ...?',
        options: ['T', 'U', 'V', 'W'],
        correctIndex: 1
    }
];
