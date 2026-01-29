import { QuestionTemplate } from './questionBank.js'

export const CODING_POOL: QuestionTemplate[] = [
    {
        category: 'Leetcode',
        type: 'coding',
        content: '560. Subarray Sum Equals K: Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.',
        examples: [
            { input: 'nums = [1,1,1], k = 2', output: '2', explanation: 'The subarrays are [1,1] and [1,1].' },
            { input: 'nums = [1,2,3], k = 3', output: '2', explanation: 'The subarrays are [1,2] and [3].' }
        ],
        testCases: [
            { input: '[1,1,1]\n2', expected: '2' },
            { input: '[1,2,3]\n3', expected: '2' }
        ],
        starterCode: `function subarraySum(nums, k) {
    // Write your solution here
    
}`
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: '974. Subarray Sums Divisible by K: Given an integer array `nums` and an integer `k`, return the number of non-empty subarrays that have a sum divisible by `k`.',
        examples: [
            { input: 'nums = [4,5,0,-2,-3,1], k = 5', output: '7', explanation: 'There are 7 subarrays with a sum divisible by k = 5: [4, 5, 0, -2, -3, 1], [5], [5, 0], [5, 0, -2, -3], [0], [0, -2, -3], [-2, -3]' },
            { input: 'nums = [5], k = 9', output: '0', explanation: '' }
        ],
        testCases: [
            { input: '[4,5,0,-2,-3,1]\n5', expected: '7' },
            { input: '[5]\n9', expected: '0' }
        ],
        starterCode: `function subarraysDivByK(nums, k) {
    // Write your solution here

}`
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: '643. Maximum Average Subarray I: You are given an integer array `nums` consisting of `n` elements, and an integer `k`. Find a contiguous subarray whose length is equal to `k` that has the maximum average value and return this value.',
        examples: [
            { input: 'nums = [1,12,-5,-6,50,3], k = 4', output: '12.75000', explanation: 'Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75' },
            { input: 'nums = [5], k = 1', output: '5.00000', explanation: '' }
        ],
        testCases: [
            { input: '[1,12,-5,-6,50,3]\n4', expected: '12.75' },
            { input: '[5]\n1', expected: '5' }
        ],
        starterCode: `function findMaxAverage(nums, k) {
    // Write your solution here
    
}`
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: '2395. Find Subarrays With Equal Sum: Given a 0-indexed integer array `nums`, determine whether there exist two subarrays of length 2 with equal sum. Return `true` if they exist and `false` otherwise.',
        examples: [
            { input: 'nums = [4,2,4]', output: 'true', explanation: 'The subarrays with length 2 are: [4,2] with sum 6, and [2,4] with sum 6.' },
            { input: 'nums = [1,2,3,4,5]', output: 'false', explanation: 'No two subarrays of length 2 have the same sum.' }
        ],
        testCases: [
            { input: '[4,2,4]', expected: 'true' },
            { input: '[1,2,3,4,5]', expected: 'false' },
            { input: '[0,0,0]', expected: 'true' }
        ],
        starterCode: `function findSubarrays(nums) {
    // Write your solution here
    
}`
    }
]
