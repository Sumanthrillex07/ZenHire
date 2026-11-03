# SDE-1 Engineering Masterclass — 10: Flyway Database Migrations

> **Focus:** Database Schema Versioning, Checksum Validation, Idempotent Migrations, Production Safety  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 10.1: Database Version Control vs `hibernate.ddl-auto: update`

#### 1. What is it?
Database migration tooling (Flyway) tracks, manages, and automates changes to a relational database schema over time using incremental, versioned SQL scripts.

#### 2. Why are we using it in ZenHire?
In naive or prototype applications, developers frequently rely on Hibernate's `spring.jpa.hibernate.ddl-auto: update`. In a production or team environment, `ddl-auto: update` is extremely dangerous:
- It can silently alter tables, alter column nullabilities, or drop constraints.
- It cannot reliably perform data transformations (e.g., splitting a `name` column into `first_name` and `last_name`).
- It leaves the database in an untracked, non-reproducible state across development, staging, and production environments.
In ZenHire, we set `ddl-auto: validate` and use **Flyway** for all schema evolution.

#### 3. How does it work internally?
1. On application startup, before Spring initializes Hibernate `EntityManagerFactory`, Flyway intercepts the process.
2. Flyway inspects the database for a metadata table named `flyway_schema_history`. If absent, Flyway creates it.
3. Flyway scans the classpath directory `db/migration/` for SQL migration scripts matching the naming pattern:
   ```
   V<Version>__<Description>.sql   (e.g., V1__init_schema.sql)
   ```
4. Flyway calculates a CRC32 checksum for each file and compares it against entries in `flyway_schema_history`.
5. Any unapplied migrations are executed sequentially in order of version within a single database transaction.
6. Upon successful execution, Flyway records the version, description, execution timestamp, execution time, and checksum in `flyway_schema_history`.

#### 4. Where is it implemented in ZenHire?
In `backend/src/main/resources/db/migration/`:
- `V1__init_schema.sql`: Core tables and foreign keys.
- `V2__create_indexes.sql`: B-Tree indexes for fast query resolution.
- `V3__seed_initial_data.sql`: Seed assessments, topic-tagged questions, and demo roles.

#### 5. What problem does it solve?
Guarantees 100% schema parity across every developer laptop, CI pipeline, and production server, eliminating manual SQL execution errors.

#### 6. What are the alternatives?
- **Liquibase:** XML/YAML/SQL-based migration engine. More feature-rich (supports automatic rollback tags), but heavier and more complex than Flyway's clean native SQL.
- **Hibernate `ddl-auto: update`:** Dangerous anti-pattern in production.

#### 7. What are the trade-offs?
- **Immutability Rule:** Once a migration script (e.g. `V1__init_schema.sql`) has been committed and applied to any database, its content **can NEVER be edited**. Modifying an applied migration causes its checksum to change, causing Flyway to fail on startup with a `Checksum Mismatch Exception`.
- **Mitigation:** Always introduce a new versioned script (e.g., `V4__add_interview_link.sql`) to apply changes.

#### 8. What questions could an interviewer ask about it?
> *"What happens if a developer edits a previously executed Flyway migration file, and how do you resolve it?"*  
> **Strong Answer:** "If an already executed migration file is edited, Flyway recalculates the CRC32 checksum during startup and compares it against the checksum stored in `flyway_schema_history`. If they do not match, Flyway immediately halts application boot with a `FlywayException: Checksum mismatch`.  
> In development, you can run `flyway:repair` to recalculate the stored checksum. In production, however, you should never edit an applied migration; you must revert the file to its original state and commit a new versioned migration script (`V4__...`) to apply the intended changes."

---

## 2. Interview Preparation & Flyway Flashcards

### Question 1: "What is the difference between Versioned Migrations (`V...`) and Repeatable Migrations (`R...`) in Flyway?"
**Answer:**  
- **Versioned Migrations (`V1__init.sql`, `V2__add_index.sql`):** Have a unique version number, are executed strictly once in sequential order, and cannot be modified once applied.
- **Repeatable Migrations (`R__create_views.sql`, `R__stored_procedures.sql`):** Do not have a version number. They are executed whenever their checksum changes (i.e., whenever the script is edited). They are typically used for database views, stored procedures, or triggers that are safe to recreate with `CREATE OR REPLACE`.

### Question 2: "What is the purpose of setting `spring.jpa.hibernate.ddl-auto: validate` when using Flyway?"
**Answer:**  
Setting `ddl-auto: validate` instructs Hibernate on application startup to verify that the entity mappings (`@Entity`, `@Column`, `@Table`) match the actual database schema created by Flyway. If an entity field does not match the database column type or nullability, Hibernate halts startup with a `SchemaManagementException`. This acts as an automated safety net ensuring that Java domain classes and database tables never drift out of sync.

