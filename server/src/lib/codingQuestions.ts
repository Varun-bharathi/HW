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
            { input: '[1,1,1], 2', expected: '2' },
            { input: '[1,2,3], 3', expected: '2' }
        ],
        starterCode: {
            javascript: `/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar subarraySum = function(nums, k) {\n    \n};`,
            python: `class Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        `,
            java: `class Solution {\n    public int subarraySum(int[] nums, int k) {\n        \n    }\n}`,
            csharp: `public class Solution {\n    public int SubarraySum(int[] nums, int k) {\n        \n    }\n}`,
            cpp: `class Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        \n    }\n};`,
            c: `int subarraySum(int* nums, int numsSize, int k) {\n    \n}`
        }
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
            { input: '[4,5,0,-2,-3,1], 5', expected: '7' },
            { input: '[5], 9', expected: '0' }
        ],
        starterCode: {
            javascript: `/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar subarraysDivByK = function(nums, k) {\n    \n};`,
            python: `class Solution:\n    def subarraysDivByK(self, nums: List[int], k: int) -> int:\n        `,
            java: `class Solution {\n    public int subarraysDivByK(int[] nums, int k) {\n        \n    }\n}`,
            csharp: `public class Solution {\n    public int SubarraysDivByK(int[] nums, int k) {\n        \n    }\n}`,
            cpp: `class Solution {\npublic:\n    int subarraysDivByK(vector<int>& nums, int k) {\n        \n    }\n};`,
            c: `int subarraysDivByK(int* nums, int numsSize, int k) {\n    \n}`
        }
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: '643. Maximum Average Subarray I: Find a contiguous subarray whose length is equal to `k` that has the maximum average value and return this value.',
        examples: [
            { input: 'nums = [1,12,-5,-6,50,3], k = 4', output: '12.75000', explanation: 'Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75' },
            { input: 'nums = [5], k = 1', output: '5.00000', explanation: '' }
        ],
        testCases: [
            { input: '[1,12,-5,-6,50,3], 4', expected: '12.75' },
            { input: '[5], 1', expected: '5' }
        ],
        starterCode: {
            javascript: `/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar findMaxAverage = function(nums, k) {\n    \n};`,
            python: `class Solution:\n    def findMaxAverage(self, nums: List[int], k: int) -> float:\n        `,
            java: `class Solution {\n    public double findMaxAverage(int[] nums, int k) {\n        \n    }\n}`,
            csharp: `public class Solution {\n    public double FindMaxAverage(int[] nums, int k) {\n        \n    }\n}`,
            cpp: `class Solution {\npublic:\n    double findMaxAverage(vector<int>& nums, int k) {\n        \n    }\n};`,
            c: `double findMaxAverage(int* nums, int numsSize, int k) {\n    \n}`
        }
    },
    {
        category: 'Leetcode',
        type: 'coding',
        content: '2395. Find Subarrays With Equal Sum: Determine whether there exist two subarrays of length 2 with equal sum. Return `true` if they exist and `false` otherwise.',
        examples: [
            { input: 'nums = [4,2,4]', output: 'true', explanation: 'The subarrays with length 2 are: [4,2] with sum 6, and [2,4] with sum 6.' },
            { input: 'nums = [1,2,3,4,5]', output: 'false', explanation: 'No two subarrays of length 2 have the same sum.' }
        ],
        testCases: [
            { input: '[4,2,4]', expected: 'true' },
            { input: '[1,2,3,4,5]', expected: 'false' },
            { input: '[0,0,0]', expected: 'true' }
        ],
        starterCode: {
            javascript: `/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar findSubarrays = function(nums) {\n    \n};`,
            python: `class Solution:\n    def findSubarrays(self, nums: List[int]) -> bool:\n        `,
            java: `class Solution {\n    public boolean findSubarrays(int[] nums) {\n        \n    }\n}`,
            csharp: `public class Solution {\n    public bool FindSubarrays(int[] nums) {\n        \n    }\n}`,
            cpp: `class Solution {\npublic:\n    bool findSubarrays(vector<int>& nums) {\n        \n    }\n};`,
            c: `bool findSubarrays(int* nums, int numsSize) {\n    \n}`
        }
    }
]
