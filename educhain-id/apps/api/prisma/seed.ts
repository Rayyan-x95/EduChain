import { PrismaClient, UserRole } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local database...');

  // 1. Clean up
  await prisma.credential.deleteMany();
  await prisma.institutionKey.deleteMany();
  await prisma.student.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Platform Admin
  await prisma.user.create({
    data: {
      email: 'admin@educhain.com',
      passwordHash: 'dummy_hash_for_testing', // Use correct hashes in realistic paths
      role: UserRole.platform_admin,
    }
  });

  // 3. Create Sample Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'Global Tech University',
      domain: 'gtu.edu',
      verificationStatus: true,
    }
  });

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const institutionKey = await prisma.institutionKey.create({
    data: {
      institutionId: institution.id,
      publicKey: publicKey,
      status: 'active'
    }
  });

  // 4. Create Sample Student
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@gtu.edu',
      passwordHash: 'dummy_hash_for_testing',
      role: UserRole.student,
    }
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      fullName: 'Alice Developer',
      institutionId: institution.id,
      graduationYear: 2026,
    }
  });

  // 5. Create Test Credential
  await prisma.credential.create({
    data: {
      studentId: student.id,
      institutionId: institution.id,
      keyId: institutionKey.id,
      credentialType: 'Degree',
      title: 'Bachelor of Computer Science',
      issuedDate: new Date(),
      nonce: crypto.randomUUID(),
      credentialHash: 'dummy_hash',
      signature: 'dummy_signature',
      status: 'active'
    }
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });