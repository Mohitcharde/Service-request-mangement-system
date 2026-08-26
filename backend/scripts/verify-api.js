/**
 * Comprehensive Backend API Verification Suite
 * Tests all required endpoints, permissions, search/filter/sort, and validation
 */

const http = require('http');

const PORT = 5001; // Run test suite on separate port 5001
process.env.PORT = PORT;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { ServiceRequest, PRIORITY_WEIGHTS } = require('../src/models/ServiceRequest');

let server;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = rawData ? JSON.parse(rawData) : null;
        } catch (e) {
          json = rawData;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log(' Starting Service Request Management API Verification ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = '') => {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${extraInfo ? `-> ${extraInfo}` : ''}`);
      failed++;
    }
  };

  try {
    await connectDB();
    await new Promise((resolve) => {
      server = app.listen(PORT, resolve);
    });
    console.log(`Test server running on port ${PORT}\n`);

    // Reset database
    await User.deleteMany({});
    await ServiceRequest.deleteMany({});

    // ----------------------------------------------------
    // TEST SUITE 1: AUTHENTICATION & REGISTRATION
    // ----------------------------------------------------
    console.log('--- 1. Authentication & Registration ---');

    // 1.1 Register Employee
    const regRes = await request('POST', '/auth/register', {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'admin', // Attack attempt: attempt to elevate to admin
    });
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(regRes.body.data.user.role === 'employee', 'Role elevation prevented: user is forced to employee');
    assert(typeof regRes.body.data.token === 'string', 'JWT token returned on registration');

    const employeeToken = regRes.body.data.token;
    const employeeId = regRes.body.data.user._id;

    // 1.2 Duplicate Email Rejection
    const dupRes = await request('POST', '/auth/register', {
      name: 'Duplicate John',
      email: 'john@example.com',
      password: 'Password123!',
    });
    assert(dupRes.status === 400, 'Duplicate registration returns 400 Bad Request');
    assert(dupRes.body.success === false, 'Duplicate response indicates failure');

    // 1.3 Validation Errors (Short Password / Missing Name)
    const valRes = await request('POST', '/auth/register', {
      name: 'J',
      email: 'invalid-email',
      password: '123',
    });
    assert(valRes.status === 400, 'Invalid registration data returns 400 with validation errors');
    assert(Array.isArray(valRes.body.errors) && valRes.body.errors.length > 0, 'Validation errors list returned');

    // 1.4 Register Second Employee (Jane)
    const regResJane = await request('POST', '/auth/register', {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'Password123!',
    });
    const janeToken = regResJane.body.data.token;
    const janeId = regResJane.body.data.user._id;

    // 1.5 Create Admin via Model / Seed mechanism
    const adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
    });

    // 1.6 Login Admin
    const loginAdminRes = await request('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123!',
    });
    assert(loginAdminRes.status === 200, 'Admin login returns 200 OK');
    assert(loginAdminRes.body.data.user.role === 'admin', 'Admin role verified in login response');
    const adminToken = loginAdminRes.body.data.token;

    // 1.7 Invalid Login
    const badLoginRes = await request('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'WrongPassword!',
    });
    assert(badLoginRes.status === 401, 'Invalid password returns 401 Unauthorized');

    // 1.8 Verify /api/auth/me
    const meRes = await request('GET', '/auth/me', null, employeeToken);
    assert(meRes.status === 200 && meRes.body.data.email === 'john@example.com', 'GET /api/auth/me returns current authenticated user');

    // ----------------------------------------------------
    // TEST SUITE 2: SERVICE REQUEST CREATION & DEFAULT VALUES
    // ----------------------------------------------------
    console.log('\n--- 2. Request Creation & Default Attributes ---');

    const req1 = await request('POST', '/requests', {
      title: 'Broken Laptop Display Screen',
      description: 'The internal laptop screen has vertical pink and green lines flickering.',
      category: 'Hardware',
      priority: 'High',
    }, employeeToken);

    assert(req1.status === 201, 'Employee can create a service request (201)');
    assert(req1.body.data.status === 'Open', 'Newly created request automatically starts in "Open" status');
    assert(req1.body.data.createdBy._id === employeeId, 'createdBy automatically associated with authenticated user');
    assert(req1.body.data.priorityWeight === 3, 'priorityWeight correctly calculated as 3 for High priority');

    const req1Id = req1.body.data._id;

    // Request 2 by John (Medium priority)
    const req2 = await request('POST', '/requests', {
      title: 'Need PyCharm Professional License',
      description: 'Requesting IDE activation key for upcoming sprint work.',
      category: 'Software',
      priority: 'Medium',
    }, employeeToken);
    const req2Id = req2.body.data._id;

    // Request 3 by John (Low priority)
    const req3 = await request('POST', '/requests', {
      title: 'Office chair armrest loose',
      description: 'The right armrest wobbles on chair #12.',
      category: 'Other',
      priority: 'Low',
    }, employeeToken);
    const req3Id = req3.body.data._id;

    // Request 4 by Jane (Network, High priority)
    const req4 = await request('POST', '/requests', {
      title: 'WiFi connectivity drops in conference room 3B',
      description: 'Signal strength drops significantly near the projector.',
      category: 'Network',
      priority: 'High',
    }, janeToken);
    const req4Id = req4.body.data._id;

    // ----------------------------------------------------
    // TEST SUITE 3: ROLE-BASED ACCESS & DATA ISOLATION
    // ----------------------------------------------------
    console.log('\n--- 3. Role-Based Access Control & Data Isolation ---');

    // 3.1 Employee John sees only his 3 requests
    const johnListRes = await request('GET', '/requests', null, employeeToken);
    assert(johnListRes.status === 200, 'Employee can fetch requests list (200)');
    assert(johnListRes.body.count === 3, `Employee John sees exactly 3 requests (saw ${johnListRes.body.count})`);
    assert(johnListRes.body.data.every((r) => r.createdBy._id === employeeId), 'All requests returned to John belong strictly to John');

    // 3.2 Employee Jane sees only her 1 request
    const janeListRes = await request('GET', '/requests', null, janeToken);
    assert(janeListRes.body.count === 1, `Employee Jane sees exactly 1 request (saw ${janeListRes.body.count})`);

    // 3.3 Admin sees all 4 requests
    const adminListRes = await request('GET', '/requests', null, adminToken);
    assert(adminListRes.body.count === 4, `Admin sees all 4 requests across company (saw ${adminListRes.body.count})`);

    // 3.4 Unauthenticated request rejected
    const unauthRes = await request('GET', '/requests');
    assert(unauthRes.status === 401, 'Unauthenticated request rejected with 401');

    // 3.5 Cross-tenant view restriction: John tries to view Jane's request
    const crossViewRes = await request('GET', `/requests/${req4Id}`, null, employeeToken);
    assert(crossViewRes.status === 403, 'Employee cannot view another employee request (403 Forbidden)');

    // 3.6 Admin can view Jane's request
    const adminViewRes = await request('GET', `/requests/${req4Id}`, null, adminToken);
    assert(adminViewRes.status === 200, 'Admin can view any request (200 OK)');

    // ----------------------------------------------------
    // TEST SUITE 4: SEARCH, FILTERING, AND SORTING
    // ----------------------------------------------------
    console.log('\n--- 4. Search, Filtering, and Sorting on Backend ---');

    // 4.1 Search by title
    const searchRes = await request('GET', '/requests?search=Laptop', null, adminToken);
    assert(searchRes.body.count === 1 && searchRes.body.data[0].title.includes('Laptop'), 'Search by title works');

    // 4.2 Search by Employee name (Admin search for "Jane")
    const searchNameRes = await request('GET', '/requests?search=Jane', null, adminToken);
    assert(searchNameRes.body.count === 1 && searchNameRes.body.data[0].createdBy.name === 'Jane Smith', 'Admin can search requests by requester name');

    // 4.3 Filter by category
    const filterCatRes = await request('GET', '/requests?category=Hardware', null, adminToken);
    assert(filterCatRes.body.count === 1 && filterCatRes.body.data[0].category === 'Hardware', 'Filter by category works');

    // 4.4 Filter by priority
    const filterPriRes = await request('GET', '/requests?priority=High', null, adminToken);
    assert(filterPriRes.body.count === 2, `Filter by priority High returns 2 records (got ${filterPriRes.body.count})`);

    // 4.5 Combined Search + Filter + Sort
    const combinedRes = await request(
      'GET',
      '/requests?category=Hardware&priority=High&sortBy=createdAt&order=desc',
      null,
      adminToken
    );
    assert(combinedRes.body.count === 1, 'Combined query (category + priority + sort) works');

    // 4.6 Sort by Priority (High > Medium > Low)
    const prioritySortRes = await request('GET', '/requests?sortBy=priority&order=desc', null, adminToken);
    const prioritiesReturned = prioritySortRes.body.data.map((r) => r.priority);
    const weights = prioritySortRes.body.data.map((r) => r.priorityWeight);
    const isSortedDesc = weights.every((val, i, arr) => !i || arr[i - 1] >= val);
    assert(isSortedDesc, `Sort by priority descending works: [${prioritiesReturned.join(', ')}]`);

    // ----------------------------------------------------
    // TEST SUITE 5: UPDATE OPERATIONS & PERMISSIONS
    // ----------------------------------------------------
    console.log('\n--- 5. Update Operations & Permission Enforcement ---');

    // 5.1 Employee updates own request permitted fields
    const empUpdateRes = await request('PUT', `/requests/${req1Id}`, {
      title: 'Broken Laptop Display Screen - Updated',
      priority: 'Medium',
    }, employeeToken);
    assert(empUpdateRes.status === 200, 'Employee can update title and priority of own request');
    assert(empUpdateRes.body.data.title.includes('Updated'), 'Updated title persisted');
    assert(empUpdateRes.body.data.priorityWeight === 2, 'Updated priorityWeight recalculated to 2');

    // 5.2 Employee tries to change status -> 403 Forbidden
    const empStatusRes = await request('PUT', `/requests/${req1Id}`, {
      status: 'Resolved',
    }, employeeToken);
    assert(empStatusRes.status === 403, 'Employee cannot change status (403 Forbidden)');

    // 5.3 Employee tries to update someone else's request -> 403 Forbidden
    const empCrossUpdate = await request('PUT', `/requests/${req4Id}`, {
      title: 'Hacked Title',
    }, employeeToken);
    assert(empCrossUpdate.status === 403, 'Employee cannot update another employee request (403 Forbidden)');

    // 5.4 Admin can update status to 'In Progress' and 'Resolved'
    const adminStatusRes = await request('PUT', `/requests/${req1Id}`, {
      status: 'In Progress',
    }, adminToken);
    assert(adminStatusRes.status === 200, 'Admin can update status to "In Progress"');
    assert(adminStatusRes.body.data.status === 'In Progress', 'Status changed successfully to "In Progress"');

    // ----------------------------------------------------
    // TEST SUITE 6: DELETE OPERATIONS
    // ----------------------------------------------------
    console.log('\n--- 6. Delete Operations ---');

    // 6.1 Employee tries to delete request -> 403 Forbidden
    const empDeleteRes = await request('DELETE', `/requests/${req3Id}`, null, employeeToken);
    assert(empDeleteRes.status === 403, 'Employee cannot delete requests (403 Forbidden)');

    // 6.2 Admin deletes request -> 200 OK
    const adminDeleteRes = await request('DELETE', `/requests/${req3Id}`, null, adminToken);
    assert(adminDeleteRes.status === 200, 'Admin can delete request (200 OK)');

    // 6.3 Verify deleted request returns 404
    const getDeletedRes = await request('GET', `/requests/${req3Id}`, null, adminToken);
    assert(getDeletedRes.status === 404, 'Deleted request is no longer found (404)');

    // ----------------------------------------------------
    // TEST SUITE 7: STATS CALCULATION
    // ----------------------------------------------------
    console.log('\n--- 7. Stats Calculation ---');
    const statsRes = await request('GET', '/requests', null, adminToken);
    assert(statsRes.body.stats !== undefined, 'Stats object returned in response');
    assert(typeof statsRes.body.stats.total === 'number', 'Total count present in stats');
    assert(typeof statsRes.body.stats.open === 'number', 'Open count present in stats');

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n======================================================');
    console.log(` Verification Completed: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    server.close();
    await disconnectDB();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal Verification Error:', err);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
};

runTests();
