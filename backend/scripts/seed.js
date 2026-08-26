require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { ServiceRequest, PRIORITY_WEIGHTS } = require('../src/models/ServiceRequest');
const { connectDB } = require('../src/config/db');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await ServiceRequest.deleteMany({});

    console.log('[Seed] Creating demo users...');
    // Seed Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
    });

    // Seed Primary Employee
    const employeeUser = await User.create({
      name: 'Alex Johnson',
      email: 'employee@example.com',
      password: 'Employee123!',
      role: 'employee',
    });

    // Seed Second Employee (to test multi-user isolation & admin search by requester)
    const secondEmployee = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'Employee123!',
      role: 'employee',
    });

    console.log('[Seed] Creating sample service requests...');

    const sampleRequests = [
      {
        title: 'MacBook Pro battery draining rapidly and overheating',
        description: 'My laptop battery drains in less than 45 minutes under standard development workload. The fan runs continuously and the bottom chassis gets extremely hot.',
        category: 'Hardware',
        priority: 'High',
        priorityWeight: PRIORITY_WEIGHTS.High,
        status: 'In Progress',
        createdBy: employeeUser._id,
      },
      {
        title: 'Need IntelliJ IDEA Ultimate and Docker Desktop licenses',
        description: 'Starting the new microservices sprint and require official company licenses for JetBrains IntelliJ Ultimate and Docker Desktop Enterprise.',
        category: 'Software',
        priority: 'Medium',
        priorityWeight: PRIORITY_WEIGHTS.Medium,
        status: 'Open',
        createdBy: employeeUser._id,
      },
      {
        title: 'VPN disconnects every 15 minutes while working remotely',
        description: 'Cisco AnyConnect drops connection consistently every 15 minutes. Error logs show TLS handshake renegotiation timeout on corporate gateway.',
        category: 'Network',
        priority: 'High',
        priorityWeight: PRIORITY_WEIGHTS.High,
        status: 'Open',
        createdBy: employeeUser._id,
      },
      {
        title: 'Request access to AWS Staging and Production S3 Buckets',
        description: 'Need read/write IAM permissions to staging-assets-bucket and read-only access to production-logs-bucket for deployment monitoring.',
        category: 'Access',
        priority: 'Medium',
        priorityWeight: PRIORITY_WEIGHTS.Medium,
        status: 'Resolved',
        createdBy: employeeUser._id,
      },
      {
        title: 'Standing desk height adjustment motor stuck',
        description: 'Motor mechanism on desk #402 in Building B is not responding to control panel input. Stuck in lowest position.',
        category: 'Other',
        priority: 'Low',
        priorityWeight: PRIORITY_WEIGHTS.Low,
        status: 'Closed',
        createdBy: employeeUser._id,
      },
      {
        title: 'Second monitor flickering over USB-C dock connection',
        description: 'External Dell 4K display flickers black for 2-3 seconds intermittently when connected through the CalDigit Thunderbolt 4 dock.',
        category: 'Hardware',
        priority: 'Medium',
        priorityWeight: PRIORITY_WEIGHTS.Medium,
        status: 'Open',
        createdBy: secondEmployee._id,
      },
      {
        title: 'Github Enterprise repository admin permissions needed',
        description: 'Need maintainer/admin role on repo `core-payment-gateway` to configure branch protection rules and CI/CD status checks.',
        category: 'Access',
        priority: 'High',
        priorityWeight: PRIORITY_WEIGHTS.High,
        status: 'In Progress',
        createdBy: secondEmployee._id,
      },
      {
        title: 'PostgreSQL database connection pool exhaustion in staging',
        description: 'Staging backend services are reporting connection timeouts due to orphaned client connections.',
        category: 'Software',
        priority: 'High',
        priorityWeight: PRIORITY_WEIGHTS.High,
        status: 'Open',
        createdBy: adminUser._id,
      },
    ];

    await ServiceRequest.insertMany(sampleRequests);

    console.log('====================================================');
    console.log(' Database Seeded Successfully! ');
    console.log('====================================================');
    console.log('Demo Credentials:');
    console.log('  Admin:    admin@example.com    / Admin123!');
    console.log('  Employee: employee@example.com / Employee123!');
    console.log('  Employee: sarah@example.com    / Employee123!');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
