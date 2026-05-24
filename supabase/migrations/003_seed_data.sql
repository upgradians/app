-- ============================================================
-- SEED DATA
-- ============================================================

-- Achievements
insert into public.achievements (slug, title, description, icon, xp_reward, condition) values
  ('first_solve',      'First Blood',       'Solve your first challenge',              '🩸', 50,   '{"type":"submission_count","value":1}'),
  ('ten_solves',       'On a Roll',         'Solve 10 challenges',                     '🔥', 100,  '{"type":"submission_count","value":10}'),
  ('fifty_solves',     'Challenge Crusher', 'Solve 50 challenges',                     '⚔️', 500,  '{"type":"submission_count","value":50}'),
  ('streak_7',         'Week Warrior',      'Maintain a 7-day coding streak',          '📅', 150,  '{"type":"streak","value":7}'),
  ('streak_30',        'Month Master',      'Maintain a 30-day coding streak',         '🗓️', 500,  '{"type":"streak","value":30}'),
  ('first_contest',    'Arena Debut',       'Participate in your first contest',       '🏟️', 75,   '{"type":"contest_count","value":1}'),
  ('silver_rank',      'Rising Star',       'Reach Silver Developer rank',             '🥈', 200,  '{"type":"rank","value":"Silver Developer"}'),
  ('gold_rank',        'Code Champion',     'Reach Gold Engineer rank',                '🥇', 500,  '{"type":"rank","value":"Gold Engineer"}'),
  ('cosmic_rank',      'Cosmic Master',     'Reach Cosmic Master rank',                '🌌', 1000, '{"type":"rank","value":"Cosmic Master"}'),
  ('interview_ace',    'Interview Ace',     'Score 90+ in an AI interview session',    '🤖', 300,  '{"type":"interview_score","value":90}');

-- Sample Skill Tracks
insert into public.skill_tracks (title, description, icon, difficulty, total_challenges, xp_reward, tags) values
  ('Python Fundamentals',    'Master Python from basics to OOP and data structures', '🐍', 'easy',   15, 800,  '{"python","beginner","oop"}'),
  ('Data Structures & Algo', 'Arrays, linked lists, trees, graphs, and dynamic programming', '🧠', 'hard', 30, 2000, '{"dsa","algorithms","competitive"}'),
  ('Web Dev Bootcamp',       'HTML/CSS/JS to React and Node.js full stack', '🌐', 'medium', 20, 1200, '{"javascript","react","nodejs"}'),
  ('SQL Mastery',            'From basic queries to advanced window functions and optimization', '🗄️', 'medium', 12, 700, '{"sql","database","backend"}'),
  ('System Design',          'Design scalable distributed systems like a senior engineer', '🏗️', 'hard', 10, 1500, '{"system-design","architecture","senior"}'),
  ('Machine Learning',       'ML fundamentals: regression, classification, neural networks', '🤖', 'hard', 18, 1800, '{"ml","python","tensorflow"}');

-- Sample Challenges
insert into public.challenges (slug, title, description, difficulty, language, starter_code, xp_reward, time_limit_ms, memory_limit_mb, tags) values
  (
    'two-sum',
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9, return [0, 1].',
    'easy',
    'python',
    'from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass\n',
    50,
    2000,
    256,
    '{"array","hash-table","easy"}'
  ),
  (
    'reverse-string',
    'Reverse a String',
    'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\nExample:\nInput: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
    'easy',
    'python',
    'from typing import List\n\nclass Solution:\n    def reverseString(self, s: List[str]) -> None:\n        # Do not return anything, modify s in-place instead.\n        pass\n',
    30,
    1000,
    128,
    '{"string","two-pointers","easy"}'
  ),
  (
    'fibonacci-sequence',
    'Fibonacci Number',
    'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2), for n > 1.\n\nGiven n, calculate F(n).\n\nExample:\nInput: n = 4\nOutput: 3\nExplanation: F(4) = F(3) + F(2) = 2 + 1 = 3.',
    'easy',
    'python',
    'class Solution:\n    def fib(self, n: int) -> int:\n        # Write your solution here\n        pass\n',
    40,
    1000,
    128,
    '{"recursion","dynamic-programming","easy"}'
  ),
  (
    'binary-search',
    'Binary Search',
    'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.\n\nExample:\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4',
    'easy',
    'python',
    'from typing import List\n\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        # Write your solution here\n        pass\n',
    60,
    1000,
    128,
    '{"array","binary-search","easy"}'
  ),
  (
    'valid-parentheses',
    'Valid Parentheses',
    'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\nExample:\nInput: s = "([]{}"\nOutput: false',
    'easy',
    'python',
    'class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your solution here\n        pass\n',
    60,
    1000,
    128,
    '{"stack","string","easy"}'
  ),
  (
    'longest-substring',
    'Longest Substring Without Repeating Characters',
    'Given a string s, find the length of the longest substring without repeating characters.\n\nExample:\nInput: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
    'medium',
    'python',
    'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        pass\n',
    100,
    2000,
    256,
    '{"hash-table","string","sliding-window","medium"}'
  ),
  (
    'merge-intervals',
    'Merge Intervals',
    'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\nExample:\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]',
    'medium',
    'python',
    'from typing import List\n\nclass Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        # Write your solution here\n        pass\n',
    120,
    2000,
    256,
    '{"array","sorting","medium"}'
  ),
  (
    'lru-cache',
    'LRU Cache',
    'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n- LRUCache(int capacity): Initialize the LRU cache with positive size capacity.\n- int get(int key): Return the value of the key if the key exists, otherwise return -1.\n- void put(int key, int value): Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.',
    'hard',
    'python',
    'class LRUCache:\n\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass\n',
    200,
    2000,
    256,
    '{"hash-table","linked-list","design","hard"}'
  );

-- Test cases for Two Sum
insert into public.test_cases (challenge_id, input, expected_output, is_hidden, order_index)
select id, '2 7 11 15\n9', '0 1', false, 0 from public.challenges where slug = 'two-sum'
union all
select id, '3 2 4\n6', '1 2', false, 1 from public.challenges where slug = 'two-sum'
union all
select id, '3 3\n6', '0 1', true, 2 from public.challenges where slug = 'two-sum';

-- Test cases for Fibonacci
insert into public.test_cases (challenge_id, input, expected_output, is_hidden, order_index)
select id, '2', '1', false, 0 from public.challenges where slug = 'fibonacci-sequence'
union all
select id, '3', '2', false, 1 from public.challenges where slug = 'fibonacci-sequence'
union all
select id, '4', '3', false, 2 from public.challenges where slug = 'fibonacci-sequence'
union all
select id, '10', '55', true, 3 from public.challenges where slug = 'fibonacci-sequence';
