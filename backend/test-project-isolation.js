/**
 * Test script to verify project isolation in WebSocket connections
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:8080';

// Mock Firebase token (you'll need to replace with a real one)
const MOCK_TOKEN = 'test-token';

async function testProjectIsolation() {
  console.log('🧪 Testing Project Isolation\n');

  // Create two WebSocket connections for different projects
  const ws1 = new WebSocket(WS_URL);
  const ws2 = new WebSocket(WS_URL);

  let project1Objects = [];
  let project2Objects = [];

  // Setup connection 1 (Project 1)
  await new Promise((resolve, reject) => {
    ws1.on('open', () => {
      console.log('✅ WebSocket 1 connected');
      // Authenticate with Project 1
      ws1.send(JSON.stringify({
        type: 'auth',
        token: MOCK_TOKEN,
        displayName: 'Test User 1',
        projectId: 'test-project-1',
        timestamp: new Date().toISOString()
      }));
    });

    ws1.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('📨 WS1 received:', message.type);

      if (message.type === 'initialState' && message.objects) {
        project1Objects = message.objects;
        console.log(`📦 Project 1 initial objects: ${project1Objects.length}`);
        resolve();
      }

      if (message.type === 'object.create') {
        project1Objects.push(message.object);
        console.log(`➕ Project 1 object created: ${message.object.id} (total: ${project1Objects.length})`);
      }

      if (message.type === 'object.delete') {
        project1Objects = project1Objects.filter(o => o.id !== message.objectId);
        console.log(`➖ Project 1 object deleted: ${message.objectId} (total: ${project1Objects.length})`);
      }
    });

    ws1.on('error', reject);
  });

  // Setup connection 2 (Project 2)
  await new Promise((resolve, reject) => {
    ws2.on('open', () => {
      console.log('✅ WebSocket 2 connected');
      // Authenticate with Project 2
      ws2.send(JSON.stringify({
        type: 'auth',
        token: MOCK_TOKEN,
        displayName: 'Test User 2',
        projectId: 'test-project-2',
        timestamp: new Date().toISOString()
      }));
    });

    ws2.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('📨 WS2 received:', message.type);

      if (message.type === 'initialState' && message.objects) {
        project2Objects = message.objects;
        console.log(`📦 Project 2 initial objects: ${project2Objects.length}`);
        resolve();
      }

      if (message.type === 'object.create') {
        project2Objects.push(message.object);
        console.log(`➕ Project 2 object created: ${message.object.id} (total: ${project2Objects.length})`);
      }

      if (message.type === 'object.delete') {
        project2Objects = project2Objects.filter(o => o.id !== message.objectId);
        console.log(`➖ Project 2 object deleted: ${message.objectId} (total: ${project2Objects.length})`);
      }
    });

    ws2.on('error', reject);
  });

  // Wait a bit for initial state to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n📊 Initial State:');
  console.log(`Project 1: ${project1Objects.length} objects`);
  console.log(`Project 2: ${project2Objects.length} objects`);

  // Create an object in Project 1
  console.log('\n🔨 Creating object in Project 1...');
  const testObject1 = {
    id: `test-obj-${Date.now()}`,
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    rotation: 0,
    color: '#FF0000',
    zIndex: 0,
    createdBy: 'test-user-1',
    createdAt: new Date().toISOString()
  };

  ws1.send(JSON.stringify({
    type: 'object.create',
    object: testObject1,
    timestamp: new Date().toISOString()
  }));

  // Wait for broadcast
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\n📊 After creating in Project 1:');
  console.log(`Project 1: ${project1Objects.length} objects`);
  console.log(`Project 2: ${project2Objects.length} objects`);

  // Create an object in Project 2
  console.log('\n🔨 Creating object in Project 2...');
  const testObject2 = {
    id: `test-obj-${Date.now()}-p2`,
    type: 'circle',
    x: 200,
    y: 200,
    width: 100,
    height: 100,
    rotation: 0,
    color: '#00FF00',
    zIndex: 0,
    createdBy: 'test-user-2',
    createdAt: new Date().toISOString()
  };

  ws2.send(JSON.stringify({
    type: 'object.create',
    object: testObject2,
    timestamp: new Date().toISOString()
  }));

  // Wait for broadcast
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\n📊 After creating in Project 2:');
  console.log(`Project 1: ${project1Objects.length} objects`);
  console.log(`Project 2: ${project2Objects.length} objects`);

  // Verification
  console.log('\n🔍 Verification:');
  const hasTestObj1InP1 = project1Objects.some(o => o.id === testObject1.id);
  const hasTestObj1InP2 = project2Objects.some(o => o.id === testObject1.id);
  const hasTestObj2InP1 = project1Objects.some(o => o.id === testObject2.id);
  const hasTestObj2InP2 = project2Objects.some(o => o.id === testObject2.id);

  console.log(`Project 1 has its own object: ${hasTestObj1InP1 ? '✅' : '❌'}`);
  console.log(`Project 1 has Project 2's object: ${hasTestObj2InP1 ? '❌ LEAK!' : '✅'}`);
  console.log(`Project 2 has its own object: ${hasTestObj2InP2 ? '✅' : '❌'}`);
  console.log(`Project 2 has Project 1's object: ${hasTestObj1InP2 ? '❌ LEAK!' : '✅'}`);

  // Close connections
  ws1.close();
  ws2.close();

  console.log('\n' + (hasTestObj2InP1 || hasTestObj1InP2 ? '❌ TEST FAILED: Objects leaked between projects!' : '✅ TEST PASSED: Projects are isolated'));
}

testProjectIsolation().catch(console.error);

