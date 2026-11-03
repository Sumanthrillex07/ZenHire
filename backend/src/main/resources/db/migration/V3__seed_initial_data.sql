-- ==============================================================================
-- ZenHire Database Schema Migration: V3__seed_initial_data.sql
-- Description: Deterministic initial seed data: tests, questions, recruiters, candidates, jobs
-- Target Database: PostgreSQL 16
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Seed Passwords (BCrypt hash for 'password123')
-- Hash: $2a$10$wE96Xw4cQe891X1Qj.G7bO4o33Y7u.hB7gV8p.EwF8yZ6Tq3sL1.K
-- ------------------------------------------------------------------------------

-- Recruiter 1: Alice Johnson @ SageTech Systems
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '11111111-1111-1111-1111-111111111101',
    'Alice Johnson',
    'alice@sagetech.com',
    '$2a$10$wE96Xw4cQe891X1Qj.G7bO4o33Y7u.hB7gV8p.EwF8yZ6Tq3sL1.K',
    'ROLE_RECRUITER'
);

INSERT INTO recruiters (id, user_id, company_name)
VALUES (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'SageTech Systems'
);

-- Recruiter 2: Bob Miller @ Innovate AI
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '11111111-1111-1111-1111-111111111102',
    'Bob Miller',
    'bob@innovate.ai',
    '$2a$10$wE96Xw4cQe891X1Qj.G7bO4o33Y7u.hB7gV8p.EwF8yZ6Tq3sL1.K',
    'ROLE_RECRUITER'
);

INSERT INTO recruiters (id, user_id, company_name)
VALUES (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111102',
    'Innovate AI'
);

-- Candidate 1: John Doe (Full Stack / Backend Specialist)
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '11111111-1111-1111-1111-111111111103',
    'John Doe',
    'john@gmail.com',
    '$2a$10$wE96Xw4cQe891X1Qj.G7bO4o33Y7u.hB7gV8p.EwF8yZ6Tq3sL1.K',
    'ROLE_CANDIDATE'
);

INSERT INTO candidates (id, user_id, phone, headline)
VALUES (
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111103',
    '+1 555-0199',
    'Full Stack Engineer with 3 years of Java, Spring Boot, and React experience'
);

-- Candidate 2: Jane Smith (AI / Data Science Graduate)
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '11111111-1111-1111-1111-111111111104',
    'Jane Smith',
    'jane@gmail.com',
    '$2a$10$wE96Xw4cQe891X1Qj.G7bO4o33Y7u.hB7gV8p.EwF8yZ6Tq3sL1.K',
    'ROLE_CANDIDATE'
);

INSERT INTO candidates (id, user_id, phone, headline)
VALUES (
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111104',
    '+1 555-0288',
    'AI & Data Science Graduate looking for Machine Learning and NLP roles'
);

-- ------------------------------------------------------------------------------
-- 2. Seed Jobs
-- ------------------------------------------------------------------------------
INSERT INTO jobs (id, recruiter_id, title, description, required_skills, role_category, status)
VALUES (
    '44444444-4444-4444-4444-444444444401',
    '22222222-2222-2222-2222-222222222201',
    'Senior Frontend Engineer',
    'Looking for a passionate React developer with solid experience in modern CSS, Tailwind CSS, TypeScript, component architecture, and global state management.',
    '["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML"]'::jsonb,
    'FRONTEND',
    'OPEN'
),
(
    '44444444-4444-4444-4444-444444444402',
    '22222222-2222-2222-2222-222222222201',
    'Lead Backend Developer',
    'Design and scale enterprise backend microservices. Required proficiency in Java, Spring Boot, PostgreSQL, Docker, REST API principles, and JWT authentication.',
    '["Java", "Spring Boot", "PostgreSQL", "Docker", "REST", "JWT"]'::jsonb,
    'BACKEND',
    'OPEN'
),
(
    '44444444-4444-4444-4444-444444444403',
    '22222222-2222-2222-2222-222222222202',
    'Machine Learning Engineer',
    'Develop and train neural network pipelines. Solid hands-on experience with Python, PyTorch, TensorFlow, Scikit-Learn, and Large Language Models (LLMs) is required.',
    '["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "LLMs", "NLP"]'::jsonb,
    'AI_ML',
    'OPEN'
),
(
    '44444444-4444-4444-4444-444444444404',
    '22222222-2222-2222-2222-222222222202',
    'Backend Distributed Systems Architect',
    'Build backend data pipelines for high-throughput enterprise applications. Requires advanced Java, Spring Boot, caching architectures (Redis), and PostgreSQL optimization.',
    '["Java", "Spring Boot", "PostgreSQL", "Docker", "Caching", "REST"]'::jsonb,
    'BACKEND',
    'OPEN'
);

-- ------------------------------------------------------------------------------
-- 3. Seed Assessments (Tests)
-- ------------------------------------------------------------------------------
-- 3.1 General Aptitude & Communication
INSERT INTO tests (id, test_type, role_category, title, pass_score)
VALUES (
    '55555555-5555-5555-5555-555555555501',
    'GENERAL',
    NULL,
    'General Aptitude & Communication Assessment',
    60
);

-- 3.2 Frontend Engineering Assessment
INSERT INTO tests (id, test_type, role_category, title, pass_score)
VALUES (
    '55555555-5555-5555-5555-555555555502',
    'ROLE_SPECIFIC',
    'FRONTEND',
    'Frontend Engineering Technical Assessment',
    60
);

-- 3.3 Backend Engineering Assessment
INSERT INTO tests (id, test_type, role_category, title, pass_score)
VALUES (
    '55555555-5555-5555-5555-555555555503',
    'ROLE_SPECIFIC',
    'BACKEND',
    'Backend Engineering Technical Assessment',
    60
);

-- 3.4 AI & Machine Learning Assessment
INSERT INTO tests (id, test_type, role_category, title, pass_score)
VALUES (
    '55555555-5555-5555-5555-555555555504',
    'ROLE_SPECIFIC',
    'AI_ML',
    'AI & Machine Learning Technical Assessment',
    60
);

-- ------------------------------------------------------------------------------
-- 4. Seed Questions
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- 4.1 Questions for GENERAL Test
-- ==============================================================================
INSERT INTO questions (id, test_id, question_text, options, correct_index, topic_tag, difficulty)
VALUES
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555501',
    'A project task was estimated at 12 hours. Two engineers work on it together at 1.5x efficiency. Approximately how long does it take?',
    '["4 hours", "6 hours", "8 hours", "9 hours"]'::jsonb,
    0,
    'aptitude',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555501',
    'When a critical production bug occurs right before a scheduled release, what is the best first step?',
    '["Immediately push a quick untracked patch to production", "Notify stakeholders, assess severity and blast radius, and roll back or triage", "Blame the developer who committed the change", "Delay communication until the fix is completely finished"]'::jsonb,
    1,
    'communication',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555501',
    'Which of the following logical statements is logically equivalent to: "If it rains, the grass is wet"?',
    '["If the grass is wet, it rained", "If the grass is not wet, it did not rain", "If it does not rain, the grass is not wet", "The grass is only wet when it rains"]'::jsonb,
    1,
    'logical-reasoning',
    'MEDIUM'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555501',
    'In active asynchronous team collaboration, what constitutes a high-quality pull request description?',
    '["Only writing ''fixed bug'' as the title", "Explaining the problem, the architectural solution, testing steps, and attaching screenshots where appropriate", "Linking a ticket with zero written description", "Leaving the description completely blank"]'::jsonb,
    1,
    'communication',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555501',
    'If 5 machines take 5 minutes to manufacture 5 widgets, how long does it take 100 machines to manufacture 100 widgets?',
    '["100 minutes", "50 minutes", "5 minutes", "1 minute"]'::jsonb,
    2,
    'logical-reasoning',
    'MEDIUM'
);

-- ==============================================================================
-- 4.2 Questions for FRONTEND Test
-- ==============================================================================
INSERT INTO questions (id, test_id, question_text, options, correct_index, topic_tag, difficulty)
VALUES
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555502',
    'What is the primary purpose of the dependency array in React useEffect hook?',
    '["To define which props should be passed to child components", "To specify which state or prop values trigger the effect callback when changed", "To register global Redux store reducers", "To prevent the component from mounting"]'::jsonb,
    1,
    'react-hooks',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555502',
    'Which CSS Flexbox property controls the alignment of items along the cross axis?',
    '["justify-content", "align-items", "flex-direction", "align-content"]'::jsonb,
    1,
    'css-flexbox',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555502',
    'What does the JavaScript event loop do when a Promise resolves?',
    '["Places the callback in the Call Stack immediately", "Places the callback in the Microtask Queue", "Places the callback in the Macrotask (Callback) Queue", "Pauses browser rendering until the promise is garbage collected"]'::jsonb,
    1,
    'javascript-async',
    'MEDIUM'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555502',
    'In TypeScript, what is the difference between type aliases and interfaces?',
    '["Interfaces can be merged via declaration merging; type aliases cannot", "Type aliases cannot represent object shapes", "Interfaces cannot extend other interfaces", "There is zero functional difference"]'::jsonb,
    0,
    'typescript-types',
    'MEDIUM'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555502',
    'Why is it discouraged to use array index as the ''key'' prop when rendering dynamic lists in React?',
    '["React will throw a compile-time syntax error", "It can cause component state bugs and unnecessary re-renders when list items are sorted, added, or deleted", "Array indexes are not supported in React 18", "It causes memory leaks in the browser V8 engine"]'::jsonb,
    1,
    'react-fundamentals',
    'MEDIUM'
);

-- ==============================================================================
-- 4.3 Questions for BACKEND Test
-- ==============================================================================
INSERT INTO questions (id, test_id, question_text, options, correct_index, topic_tag, difficulty)
VALUES
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555503',
    'What is the primary role of Spring Boot auto-configuration?',
    '["It generates Java source code at runtime using reflection", "It configures Spring beans automatically based on classpath dependencies and properties", "It acts as a replacement for PostgreSQL database schemas", "It compiles Java bytecode directly to native machine code"]'::jsonb,
    1,
    'spring-boot',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555503',
    'Which HTTP method is considered safe and idempotent according to RFC 7231?',
    '["POST", "GET", "PATCH", "CONNECT"]'::jsonb,
    1,
    'rest-principles',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555503',
    'In relational databases, what type of index should be used on foreign key columns to optimize JOIN operations?',
    '["B-Tree index", "Hash index", "Spatial index", "No index is required"]'::jsonb,
    0,
    'database-indexing',
    'MEDIUM'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555503',
    'How does Spring Boot’s @Transactional annotation manage transaction rollbacks by default?',
    '["It rolls back for all Exception classes including checked exceptions", "It rolls back only for unchecked exceptions (RuntimeException and Error)", "It never rolls back automatically; rollback must be called manually", "It rolls back only on OutOfMemoryError"]'::jsonb,
    1,
    'spring-transactions',
    'HARD'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555503',
    'What is the signature portion of a JSON Web Token (JWT) used for?',
    '["To encrypt the payload so it cannot be read by third parties", "To verify that the sender of the JWT is who it says it is and to ensure the message was not changed along the way", "To store the database user password", "To compress the token size for HTTP transport"]'::jsonb,
    1,
    'jwt-auth',
    'MEDIUM'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555503',
    'In JPA and Hibernate, what causes the notorious N+1 query problem?',
    '["Using native SQL queries instead of JPQL", "Fetching a collection of entities and subsequently loading their lazy associations in separate queries inside a loop", "Having more than N tables in a PostgreSQL schema", "Configuring HikariCP with a maximum pool size of N+1"]'::jsonb,
    1,
    'sql-joins',
    'HARD'
);

-- ==============================================================================
-- 4.4 Questions for AI & ML Test
-- ==============================================================================
INSERT INTO questions (id, test_id, question_text, options, correct_index, topic_tag, difficulty)
VALUES
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555504',
    'What is the primary function of an activation function (like ReLU) in a neural network?',
    '["To normalize weights to zero mean and unit variance", "To introduce non-linearity into the network, enabling it to learn complex patterns", "To speed up gradient descent by computing exact second derivatives", "To eliminate the need for backpropagation"]'::jsonb,
    1,
    'neural-networks',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555504',
    'What is overfitting in machine learning and how is it commonly diagnosed?',
    '["High training error and high validation error", "Low training error accompanied by high validation error", "Low training error and low validation error", "Slow convergence during gradient descent"]'::jsonb,
    1,
    'scikit-learn',
    'EASY'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555504',
    'What does the Temperature parameter control in LLM token generation?',
    '["The execution speed of the GPU CUDA cores", "The randomness/entropy of the probability distribution over the vocabulary when sampling output tokens", "The maximum number of tokens generated in the output", "The learning rate during fine-tuning"]'::jsonb,
    1,
    'llm-prompting',
    'MEDIUM'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555504',
    'In NLP and vector embeddings, what does Cosine Similarity measure between two document vectors?',
    '["The Euclidean distance between the two endpoints", "The cosine of the angle between the two vectors, measuring directional orientation regardless of magnitude", "The number of matching words divided by total words", "The Manhattan grid distance between token embeddings"]'::jsonb,
    1,
    'nlp-embeddings',
    'MEDIUM'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555504',
    'In PyTorch, what is the purpose of optimizer.zero_grad() before calling loss.backward()?',
    '["To reset gradients to zero because PyTorch accumulates gradients on subsequent backward passes by default", "To reset the neural network weights to random numbers", "To clear GPU VRAM memory cache", "To terminate training epoch early"]'::jsonb,
    0,
    'pytorch-basics',
    'HARD'
);

