const request = require('supertest');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

const testImagePath = path.resolve(__dirname, 'test-image.png');
if (!fs.existsSync(testImagePath)) {
  
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  fs.writeFileSync(testImagePath, pngBuffer);
}

describe('User API Tests', () => {
  let createdUserIds = [];
  let authToken = '';

  afterAll(async () => {
    
    console.log('Test cleanup completed');
  });

  describe('User Registration Tests', () => {
    it('should register a new user successfully', async () => {
      const uniqueUsername = `testuser_${Date.now()}`;
      const uniqueEmail = `test_${Date.now()}@example.com`;

      const res = await request(BASE_URL)
        .post('/api/register')
        .send({
          username: uniqueUsername,
          email: uniqueEmail,
          password: 'securepassword123',
          name: 'Test User'
        });

      console.log('Register user response:', res.body);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toEqual('User registered');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toEqual(uniqueUsername);
      expect(res.body.user.email).toEqual(uniqueEmail);
      
      if (res.body.user.id) {
        createdUserIds.push(res.body.user.id);
      }
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(BASE_URL)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
          
        });

      console.log('Missing fields response:', res.body);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toEqual('Email, username, and password required');
    });

    it('should return 409 if username already exists', async () => {
      const existingUsername = `existing_user_${Date.now()}`;
      const emailForExisting = `existing_${Date.now()}@example.com`;

      
      await request(BASE_URL)
        .post('/api/register')
        .send({
          username: existingUsername,
          email: emailForExisting,
          password: 'password123',
          name: 'Existing User'
        });

      
      const res = await request(BASE_URL)
        .post('/api/register')
        .send({
          username: existingUsername,
          email: `new_email_${Date.now()}@example.com`,
          password: 'newpassword',
          name: 'New User'
        });

      console.log('Duplicate username response:', res.body);
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toEqual('Email or username already exists');
    });

    it('should return 409 if email already exists', async () => {
      const existingEmail = `existing_email_${Date.now()}@example.com`;
      const usernameForExisting = `user_for_existing_email_${Date.now()}`;

      
      await request(BASE_URL)
        .post('/api/register')
        .send({
          username: usernameForExisting,
          email: existingEmail,
          password: 'password123',
          name: 'Existing User'
        });

      
      const res = await request(BASE_URL)
        .post('/api/register')
        .send({
          username: `new_user_${Date.now()}`,
          email: existingEmail,
          password: 'newpassword',
          name: 'New User'
        });

      console.log('Duplicate email response:', res.body);
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toEqual('Email or username already exists');
    });
  });

  describe('Login Tests', () => {
    let testUser = {
      username: `login_test_user_${Date.now()}`,
      email: `login_test_${Date.now()}@example.com`,
      password: 'securepassword123',
      name: 'Login Test User'
    };

    beforeAll(async () => {
      
      await request(BASE_URL)
        .post('/api/register')
        .send({
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
          name: testUser.name
        });
    });

    it('should login a user successfully with username', async () => {
      const userData = {
        identifier: testUser.username,
        password: testUser.password
      };

      const res = await request(BASE_URL)
        .post('/api/login')
        .send(userData);

      console.log('Login with username response:', res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toEqual('Login successful');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toEqual(testUser.username);
      expect(res.body).toHaveProperty('token');
      expect(res.body.token).toBeTruthy();
      
      authToken = res.body.token;
    });

    it('should login a user successfully with email', async () => {
      const userData = {
        identifier: testUser.email,
        password: testUser.password
      };

      const res = await request(BASE_URL)
        .post('/api/login')
        .send(userData);

      console.log('Login with email response:', res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toEqual('Login successful');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toEqual(testUser.email);
      expect(res.body).toHaveProperty('token');
      expect(res.body.token).toBeTruthy();
    });

    it('should return 401 for invalid identifier', async () => {
      const res = await request(BASE_URL)
        .post('/api/login')
        .send({
          identifier: 'nonexistent@example.com',
          password: 'password123'
        });

      console.log('Invalid identifier login response:', res.body);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toEqual('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(BASE_URL)
        .post('/api/login')
        .send({
          identifier: testUser.email,
          password: 'wrongpassword'
        });

      console.log('Invalid password login response:', res.body);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toEqual('Invalid credentials');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(BASE_URL)
        .post('/api/login')
        .send({
          identifier: testUser.email
          
        });

      console.log('Missing fields login response:', res.body);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toEqual('Username/email and password required');
    });
  });

  describe('Profile Tests', () => {
    let testUser = {
      username: `profile_test_user_${Date.now()}`,
      email: `profile_test_${Date.now()}@example.com`,
      password: 'securepassword123',
      name: 'Profile Test User'
    };
    let profileAuthToken = '';

    beforeAll(async () => {
      
      await request(BASE_URL)
        .post('/api/register')
        .send({
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
          name: testUser.name
        });

      const loginRes = await request(BASE_URL)
        .post('/api/login')
        .send({
          identifier: testUser.email,
          password: testUser.password
        });

      profileAuthToken = loginRes.body.token;
    });

    it('should get user profile when authenticated', async () => {
      const res = await request(BASE_URL)
        .get('/api/profile')
        .set('Authorization', `Bearer ${profileAuthToken}`);

      console.log('Get profile response:', res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username');
      expect(res.body).toHaveProperty('email');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 for profile access without token', async () => {
      const res = await request(BASE_URL)
        .get('/api/profile');

      console.log('Profile without token response:', res.body);
      expect(res.statusCode).toBe(401);
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        username: `updated_${testUser.username}`,
        email: `updated_${testUser.email}`,
        name: 'Updated Test User'
      };

      const res = await request(BASE_URL)
        .put('/api/profile')
        .set('Authorization', `Bearer ${profileAuthToken}`)
        .send(updateData);

      console.log('Update profile response:', res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toEqual('Profile updated');
      expect(res.body.user.username).toEqual(updateData.username);
      expect(res.body.user.email).toEqual(updateData.email);
      expect(res.body.user.name).toEqual(updateData.name);
    });

    it('should update user avatar successfully', async () => {
      const res = await request(BASE_URL)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${profileAuthToken}`)
        .attach('avatar', testImagePath);

      console.log('Update avatar response:', res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toEqual('Avatar updated');
      expect(res.body.avatar).toContain('uploads/avatars');
    });

    it('should return 401 for profile update without token', async () => {
      const res = await request(BASE_URL)
        .put('/api/profile')
        .send({
          username: 'test',
          email: 'test@example.com'
        });

      console.log('Update profile without token response:', res.body);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Password Change Tests', () => {
    let testUser = {
      username: `password_test_user_${Date.now()}`,
      email: `password_test_${Date.now()}@example.com`,
      password: 'securepassword123',
      name: 'Password Test User'
    };
    let passwordAuthToken = '';

    beforeAll(async () => {
      
      await request(BASE_URL)
        .post('/api/register')
        .send({
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
          name: testUser.name
        });

      const loginRes = await request(BASE_URL)
        .post('/api/login')
        .send({
          identifier: testUser.email,
          password: testUser.password
        });

      passwordAuthToken = loginRes.body.token;
    });

    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: testUser.password,
        newPassword: 'newSecurePassword123'
      };

      const res = await request(BASE_URL)
        .put('/api/password')
        .set('Authorization', `Bearer ${passwordAuthToken}`)
        .send(passwordData);

      console.log('Change password response:', res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toEqual('Password updated successfully');
    });

    it('should return 401 for wrong current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newSecurePassword123'
      };

      const res = await request(BASE_URL)
        .put('/api/password')
        .set('Authorization', `Bearer ${passwordAuthToken}`)
        .send(passwordData);

      console.log('Wrong current password response:', res.body);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toEqual('Current password is incorrect');
    });

    it('should return 401 for password change without token', async () => {
      const res = await request(BASE_URL)
        .put('/api/password')
        .send({
          currentPassword: 'oldpass',
          newPassword: 'newpass'
        });

      console.log('Change password without token response:', res.body);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle malformed JSON gracefully', async () => {
      const res = await request(BASE_URL)
        .post('/api/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      console.log('Malformed JSON response:', res.body);
      expect(res.statusCode).toBe(400);
    });

    it('should handle large file uploads appropriately', async () => {
      
      const largeFilePath = path.resolve(__dirname, 'large-test-file.png');
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); 
      fs.writeFileSync(largeFilePath, largeBuffer);

      const res = await request(BASE_URL)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', largeFilePath);

      console.log('Large file upload response:', res.body);
      
      expect([200, 400, 413]).toContain(res.statusCode);

      
      if (fs.existsSync(largeFilePath)) {
        fs.unlinkSync(largeFilePath);
      }
    });
  });
});
