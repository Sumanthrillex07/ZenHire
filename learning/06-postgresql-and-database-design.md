# SDE-1 Engineering Masterclass — 06: PostgreSQL & Database Design

> **Focus:** Relational Normalization, Indexing Strategies, JSONB vs Normalized Tables, Constraint Engineering  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 6.1: Database Normalization (3NF) vs Intentional Denormalization

#### 1. What is it?
Database normalization is the process of structuring relational tables to reduce data redundancy and eliminate anomalies (Insertion, Update, and Deletion anomalies) by adhering to Normal Forms:
- **1NF:** Atomic attributes (no repeating groups or comma-separated lists).
- **2NF:** In 1NF and all non-key attributes are fully functionally dependent on the primary key.
- **3NF:** In 2NF and no transitive functional dependencies exist (non-key attributes depend only on the primary key).

#### 2. Why are we using it in ZenHire?
In naive recruitment applications, recruiter company details or candidate contact information are duplicated inside every job posting or application row. If a recruiter updates their company name, an update anomaly occurs if every historic application is not updated. ZenHire normalizes data into distinct entities: `users` ➔ `recruiters` ➔ `jobs` ➔ `applications`.

#### 3. How does it work internally?
- Candidate profile data lives in `candidates` and `users`.
- When an application is created, it references `candidate_id` and `job_id` via foreign keys.
- **Intentional Denormalization in ZenHire:** We intentionally snapshot `match_score`, `matched_skills`, and `missing_skills` onto the `applications` record at the time of submission.
  - *Why?* Candidate skills and job requirements can change over time. An application's match score must represent the exact historical evaluation at the moment of submission, not a dynamic value that shifts if the job posting is edited later!

#### 4. Where is it implemented in ZenHire?
In the PostgreSQL schema (`docs/DATABASE_DESIGN.md`):
- Normalized: `users`, `candidates`, `recruiters`, `jobs`, `tests`, `questions`.
- Historical snapshot: `applications.matched_skills`, `applications.match_score`.

#### 5. What problem does it solve?
Prevents database inconsistencies, minimizes storage duplication, and preserves historic audit integrity for recruitment evaluations.

#### 6. What are the alternatives?
- **Document Store (NoSQL / MongoDB):** Storing entire job postings with embedded applicants inside a single document. Causes huge document bloat and write lock contention when multiple candidates apply concurrently.

#### 7. What are the trade-offs?
- Normalized tables require SQL `JOIN` operations to reconstruct full object views.
- **Mitigation:** We establish B-Tree indexes on all foreign keys to ensure $O(\log N)$ join performance.

#### 8. What questions could an interviewer ask about it?
> *"When is it acceptable to denormalize a relational database schema?"*  
> **Strong Answer:** "Denormalization is acceptable in two primary scenarios: 1) Performance optimization when high-throughput read queries require expensive multi-table joins that cannot be resolved via caching; 2) Historical snapshotting, such as in ZenHire, where an application's match score and matched skills must reflect the immutable state of candidate qualifications at the exact timestamp of application, even if the candidate updates their resume or the recruiter edits job requirements later."

---

### Concept 6.2: PostgreSQL Indexing Strategies (B-Tree & Composite Indexes)

#### 1. What is it?
A database index is an auxiliary data structure (defaulting to a balanced search tree / B-Tree in PostgreSQL) that allows the query planner to locate specific rows in $O(\log N)$ time rather than performing an expensive sequential scan ($O(N)$) across all disk pages.

#### 2. Why are we using it in ZenHire?
When a recruiter sorts 500 applicants by match score (`ORDER BY match_score DESC`), or when the system filters active backend jobs (`WHERE status = 'OPEN' AND role_category = 'BACKEND'`), indexes allow PostgreSQL to traverse index leaves directly and return results in under 5 milliseconds.

#### 3. How does it work internally?
In PostgreSQL, a B-Tree index maintains a sorted tree of key values and tuple pointers (TIDs: Block number + Offset).
- **Single-Column Index:**
  ```sql
  CREATE INDEX idx_users_email ON users(email);
  ```
  PostgreSQL performs an Index Scan to locate the matching user row by email in $\approx 3$ page reads.
- **Composite Index (Multi-Column Index):**
  ```sql
  CREATE INDEX idx_jobs_status_category ON jobs(status, role_category);
  ```
  **Leftmost Prefix Rule:** This composite index can accelerate:
  1. `WHERE status = 'OPEN' AND role_category = 'BACKEND'` (Uses both columns)
  2. `WHERE status = 'OPEN'` (Uses leading column)
  It will **NOT** accelerate `WHERE role_category = 'BACKEND'` alone!

#### 4. Where is it implemented in ZenHire?
In `V2__create_indexes.sql`:
- Composite: `idx_jobs_status_category` on `jobs(status, role_category)`
- Sorting composite: `idx_applications_job_match_score` on `applications(job_id, match_score DESC)`
- Foreign keys: indexes on all `*_id` columns.

#### 5. What problem does it solve?
Prevents high database CPU spikes, locks, and slow response times as table rows grow from hundreds to hundreds of thousands.

#### 6. What are the alternatives?
- **Hash Indexes:** Good only for equality (`=`), but cannot handle range queries (`BETWEEN`, `>`, `<`) or sorting (`ORDER BY`).
- **GIN (Generalized Inverted Index):** Ideal for full-text search and PostgreSQL `JSONB` array containment queries (`@>`).

#### 7. What are the trade-offs?
- Every index consumes additional disk storage.
- Every `INSERT`, `UPDATE`, and `DELETE` incurs write latency because the database must update the B-Tree index structures in addition to the table heap.
- **Rule of Thumb:** Index columns that are frequently used in `WHERE`, `JOIN ON`, and `ORDER BY` clauses; avoid indexing columns with very low selectivity (e.g., boolean columns alone).

#### 8. What questions could an interviewer ask about it?
> *"Explain the Leftmost Prefix Rule in composite B-Tree indexes."*  
> **Strong Answer:** "A composite B-Tree index on columns (A, B, C) is sorted hierarchically: first by A, then by B within equal values of A, and finally by C within equal values of B. Consequently, the query planner can utilize the index for queries filtering on (A), (A, B), or (A, B, C). However, a query filtering solely on (B) or (C) cannot utilize the index efficiently because the tree is not ordered by those columns independently of A."

---

## 2. Interview Preparation & PostgreSQL Flashcards

### Question 1: "Why did you choose UUID over auto-incrementing BIGSERIAL for primary keys in ZenHire?"
**Answer:**  
1. **Security & Anti-Enumeration:** Sequential IDs leak business metrics (e.g., a candidate or recruiter can deduce total system volume by observing `jobId=42` vs `jobId=43`) and are susceptible to scraping attacks.
2. **Client-Side Generation:** UUIDs (`gen_random_uuid()` or Java `UUID.randomUUID()`) can be generated before database insertion without a round-trip to sequence tables.
3. **Distributed Scalability:** UUIDs prevent primary key collisions when sharding or migrating data across database instances.

### Question 2: "When should you use PostgreSQL `JSONB` instead of creating normalized relational tables?"
**Answer:**  
`JSONB` (binary JSON) is ideal for semi-structured data where the internal schema is dynamic or where child attributes are always read and written together as a cohesive unit and never independently joined or queried across entities.  
In ZenHire, assessment question choices (`options: ["A", "B", "C", "D"]`) and required skill tags (`requiredSkills: ["Java", "Spring Boot"]`) are stored as `JSONB` because they are tightly coupled to their parent question/job and never need independent foreign key relationships.

