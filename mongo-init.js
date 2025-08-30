// MongoDB initialization script
db = db.getSiblingDB('nest-api-db');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'phone', 'password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        phone: {
          bsonType: 'string'
        },
        password: {
          bsonType: 'string'
        },
        role: {
          bsonType: 'string'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'phone': 1 }, { unique: true });

// Create permissions collection
db.createCollection('permissions');
db.permissions.createIndex({ 'key': 1 }, { unique: true });

// Create role-permissions collection
db.createCollection('role-permissions');
db.rolepermissions.createIndex({ 'roleId': 1, 'permissionId': 1 }, { unique: true });

print('✅ Database initialized successfully');
