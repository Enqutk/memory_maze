const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a secure random JWT secret
const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Setup backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExample = path.join(__dirname, 'backend', 'env.example');

if (!fs.existsSync(backendEnvPath)) {
  let envContent = '';
  
  if (fs.existsSync(backendEnvExample)) {
    envContent = fs.readFileSync(backendEnvExample, 'utf8');
    // Replace placeholder JWT_SECRET with generated one
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${generateJWTSecret()}`
    );
  } else {
    envContent = `PORT=5000
JWT_SECRET=${generateJWTSecret()}
NODE_ENV=development
`;
  }
  
  fs.writeFileSync(backendEnvPath, envContent);
  console.log('✅ Created backend/.env with secure JWT_SECRET');
} else {
  console.log('ℹ️  backend/.env already exists');
}

// Setup frontend .env.local
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');

if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnvContent = `NEXT_PUBLIC_API_URL=http://localhost:5000/api
`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env.local');
} else {
  console.log('ℹ️  frontend/.env.local already exists');
}

console.log('\n🎉 Environment files configured!');
console.log('You can now run: npm run dev');
