-- Cluster Management System - Setup SQL Scripts
-- Run these commands in your PostgreSQL database

-- ============================================================
-- 1. CREATE SUPER ADMIN USER
-- ============================================================
-- Update an existing user to be super admin
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'your-admin@email.com';

-- Or check current users and their roles
SELECT id, email, full_name, role, school_id, cluster_id
FROM users;

-- ============================================================
-- 2. CREATE TEST CLUSTERS
-- ============================================================
INSERT INTO clusters (name, code, taluka, district) VALUES
('North Cluster', 'NC-001', 'Hyderabad', 'Hyderabad'),
('South Cluster', 'SC-001', 'Latifabad', 'Hyderabad'),
('East Cluster', 'EC-001', 'Qasimabad', 'Hyderabad');

-- Verify clusters created
SELECT * FROM clusters;

-- ============================================================
-- 3. ASSIGN SCHOOLS TO CLUSTERS
-- ============================================================
-- View current schools
SELECT id, school_name, semis_code, cluster_id FROM schools;

-- Assign schools to clusters
UPDATE schools SET cluster_id = 1 WHERE id IN (1, 2, 3);  -- North Cluster
UPDATE schools SET cluster_id = 2 WHERE id IN (4, 5);     -- South Cluster
UPDATE schools SET cluster_id = 3 WHERE id IN (6, 7);     -- East Cluster

-- Verify assignment
SELECT s.id, s.school_name, s.semis_code, c.name as cluster_name
FROM schools s
LEFT JOIN clusters c ON s.cluster_id = c.id;

-- ============================================================
-- 4. CREATE CLUSTER HEAD USERS
-- ============================================================
-- Option A: Update existing user to be cluster head
UPDATE users
SET role = 'CLUSTER_HEAD',
    cluster_id = 1
WHERE email = 'cluster-head@email.com';

-- Option B: Create new cluster head user (if you have registration)
-- Register through the app first, then run:
UPDATE users
SET role = 'CLUSTER_HEAD',
    cluster_id = 1
WHERE email = 'new-cluster-head@email.com';

-- Verify cluster heads
SELECT id, email, full_name, role, cluster_id
FROM users
WHERE role = 'CLUSTER_HEAD';

-- ============================================================
-- 5. VERIFY COMPLETE SETUP
-- ============================================================
-- Check all roles
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Check cluster assignments
SELECT
    c.name as cluster_name,
    COUNT(s.id) as school_count,
    COUNT(DISTINCT st.id) as student_count
FROM clusters c
LEFT JOIN schools s ON c.id = s.cluster_id
LEFT JOIN students st ON s.id = st.school_id
GROUP BY c.id, c.name;

-- Check cluster heads and their clusters
SELECT
    u.email,
    u.full_name,
    c.name as cluster_name,
    c.code as cluster_code
FROM users u
JOIN clusters c ON u.cluster_id = c.id
WHERE u.role = 'CLUSTER_HEAD';

-- ============================================================
-- 6. USEFUL QUERIES FOR TESTING
-- ============================================================

-- Get cluster statistics (manual calculation)
SELECT
    c.id,
    c.name,
    COUNT(DISTINCT s.id) as total_schools,
    COUNT(DISTINCT st.id) as total_students,
    COUNT(DISTINCT CASE WHEN st.gender IN ('ڇوڪرو', 'Boy', 'Male') THEN st.id END) as boys,
    COUNT(DISTINCT CASE WHEN st.gender IN ('ڇوڪري', 'Girl', 'Female') THEN st.id END) as girls
FROM clusters c
LEFT JOIN schools s ON c.id = s.cluster_id
LEFT JOIN students st ON s.id = st.school_id AND st.status = 'active'
WHERE c.id = 1
GROUP BY c.id, c.name;

-- Get schools in a cluster with student counts
SELECT
    s.id as school_id,
    s.school_name,
    s.semis_code,
    s.taluka,
    COUNT(CASE WHEN st.gender IN ('ڇوڪرو', 'Boy', 'Male') THEN 1 END) as boys,
    COUNT(CASE WHEN st.gender IN ('ڇوڪري', 'Girl', 'Female') THEN 1 END) as girls,
    COUNT(st.id) as total_students
FROM schools s
LEFT JOIN students st ON s.id = st.school_id AND st.status = 'active'
WHERE s.cluster_id = 1
GROUP BY s.id, s.school_name, s.semis_code, s.taluka
ORDER BY s.school_name;

-- ============================================================
-- 7. RESET/CLEANUP (USE WITH CAUTION)
-- ============================================================

-- Remove cluster assignments from schools
-- UPDATE schools SET cluster_id = NULL;

-- Remove cluster assignments from users
-- UPDATE users SET cluster_id = NULL WHERE role = 'CLUSTER_HEAD';

-- Delete all clusters (will fail if schools are assigned)
-- DELETE FROM clusters;

-- Reset all users to SCHOOL_ADMIN
-- UPDATE users SET role = 'SCHOOL_ADMIN' WHERE role != 'SCHOOL_ADMIN';
