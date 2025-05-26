// prisma/seed.ts
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ROLES
  await prisma.role.createMany({
    data: [
      { id: '11111111-1111-1111-1111-111111111111', name: 'ADMIN' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'USER' },
    ],
    skipDuplicates: true,
  });

  // USERS
  await prisma.user.createMany({
    data: [
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'admin@example.com', username: 'admin', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZag0u4p8l1Y1Z5lZ6h0hZ5lZ6h0hG', status: 'ACTIVE' },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', email: 'alice@example.com', username: 'alice', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZag0u4p8l1Y1Z5lZ6h0hZ5lZ6h0hG', status: 'ACTIVE' },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', email: 'bob@example.com', username: 'bob', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZag0u4p8l1Y1Z5lZ6h0hZ5lZ6h0hG', status: 'ACTIVE' },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', email: 'eve@example.com', username: 'eve', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZag0u4p8l1Y1Z5lZ6h0hZ5lZ6h0hG', status: 'ACTIVE' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', email: 'mallory@example.com', username: 'mallory', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZag0u4p8l1Y1Z5lZ6h0hZ5lZ6h0hG', status: 'SUSPENDED' },
    ],
    skipDuplicates: true,
  });

  // USER PROFILES
  await prisma.userProfile.createMany({
    data: [
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', displayName: 'Admin', bio: 'I am the admin.', avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', displayName: 'Alice', bio: 'Alice in Wonderland.', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', userId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', displayName: 'Bob', bio: 'Bob the builder.', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
      { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', displayName: 'Eve', bio: 'Eve the tester.', avatarUrl: 'https://i.pravatar.cc/150?u=eve' },
      { id: '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', userId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', displayName: 'Mallory', bio: 'Mallory the troublemaker.', avatarUrl: 'https://i.pravatar.cc/150?u=mallory' },
    ],
    skipDuplicates: true,
  });

  // PERMISSIONS
  await prisma.permission.createMany({
    data: [
      { id: 'p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1', name: 'MANAGE_USERS' },
      { id: 'p2p2p2p2-p2p2-p2p2-p2p2-p2p2p2p2p2p2', name: 'WRITE_POSTS' },
    ],
    skipDuplicates: true,
  });

  // ROLE PERMISSIONS
  await prisma.rolePermission.createMany({
    data: [
      { roleId: '11111111-1111-1111-1111-111111111111', permissionId: 'p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1' },
      { roleId: '22222222-2222-2222-2222-222222222222', permissionId: 'p2p2p2p2-p2p2-p2p2-p2p2-p2p2p2p2p2p2' },
    ],
    skipDuplicates: true,
  });

  // SESSIONS
  await prisma.session.createMany({
    data: [
      { id: 's1s1s1s1-s1s1-s1s1-s1s1-s1s1s1s1s1s1', sessionToken: 'token-admin', userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), device: 'Chrome on Windows', ip: '127.0.0.1', location: 'Hanoi, Vietnam' },
      { id: 'ssssssss-ssss-ssss-ssss-ssssssssssss', sessionToken: 'token-eve', userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), device: 'Firefox on Mac', ip: '192.168.1.2', location: 'Paris, France' },
      { id: 'tttttttt-tttt-tttt-tttt-tttttttttttt', sessionToken: 'token-mallory', userId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), device: 'Safari on iPhone', ip: '192.168.1.3', location: 'London, UK' },
    ],
    skipDuplicates: true,
  });

  // ACCOUNTS
  await prisma.account.createMany({
    data: [
      { id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', type: 'oauth', provider: 'google', providerAccountId: 'admin-google-id' },
    ],
    skipDuplicates: true,
  });

  // VERIFICATION TOKEN
  await prisma.verificationToken.createMany({
    data: [
      { identifier: 'admin@example.com', token: 'verifytoken', expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    ],
    skipDuplicates: true,
  });

  // CATEGORIES
  await prisma.category.createMany({
    data: [
      { id: '44444444-4444-4444-4444-444444444444', name: 'General', slug: 'general', description: 'General discussion', order: 1 },
      { id: '55555555-5555-5555-5555-555555555556', name: 'News', slug: 'news', description: 'News and updates', order: 2 },
      { id: '55555555-5555-5555-5555-555555555557', name: 'Reviews', slug: 'reviews', description: 'Manga reviews', order: 3 },
    ],
    skipDuplicates: true,
  });

  // TAGS
  await prisma.tag.createMany({
    data: [
      { id: '55555555-5555-5555-5555-555555555555', name: 'Welcome', slug: 'welcome' },
      { id: '66666666-6666-6666-6666-666666666667', name: 'Review', slug: 'review' },
      { id: '66666666-6666-6666-6666-666666666668', name: 'Update', slug: 'update' },
    ],
    skipDuplicates: true,
  });

  // POSTS
  await prisma.post.createMany({
    data: [
      { id: '33333333-3333-3333-3333-333333333333', title: 'Welcome to Lavie', slug: 'welcome-to-lavie', content: 'This is the first post.', status: 'PUBLISHED', authorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', isFeatured: true, viewCount: 100 },
      { id: '44444444-4444-4444-4444-444444444445', title: 'Manga News: June', slug: 'manga-news-june', content: 'Latest manga news for June.', status: 'PUBLISHED', authorId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', isFeatured: false, viewCount: 50 },
      { id: '44444444-4444-4444-4444-444444444446', title: 'Attack on Titan Review', slug: 'attack-on-titan-review', content: 'A review of Attack on Titan.', status: 'PUBLISHED', authorId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', isFeatured: false, viewCount: 75 },
    ],
    skipDuplicates: true,
  });

  // POST CATEGORIES
  await prisma.postCategory.createMany({
    data: [
      { postId: '33333333-3333-3333-3333-333333333333', categoryId: '44444444-4444-4444-4444-444444444444' },
      { postId: '44444444-4444-4444-4444-444444444445', categoryId: '55555555-5555-5555-5555-555555555556' },
      { postId: '44444444-4444-4444-4444-444444444446', categoryId: '55555555-5555-5555-5555-555555555557' },
    ],
    skipDuplicates: true,
  });

  // POST TAGS
  await prisma.postTag.createMany({
    data: [
      { postId: '33333333-3333-3333-3333-333333333333', tagId: '55555555-5555-5555-5555-555555555555' },
      { postId: '44444444-4444-4444-4444-444444444445', tagId: '66666666-6666-6666-6666-666666666668' },
      { postId: '44444444-4444-4444-4444-444444444446', tagId: '66666666-6666-6666-6666-666666666667' },
    ],
    skipDuplicates: true,
  });

  // MEDIA
  await prisma.media.createMany({
    data: [
      { id: '66666666-6666-6666-6666-666666666666', url: 'https://picsum.photos/200', type: 'image', size: 2048, uploadedById: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
      { id: '77777777-7777-7777-7777-777777777778', url: 'https://picsum.photos/201', type: 'image', size: 1024, uploadedById: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
      { id: '77777777-7777-7777-7777-777777777779', url: 'https://picsum.photos/202', type: 'image', size: 512, uploadedById: 'cccccccc-cccc-cccc-cccc-cccccccccccc' },
    ],
    skipDuplicates: true,
  });

  // MEDIA TO POST (many-to-many)
  await prisma.$executeRawUnsafe(`
    INSERT INTO "_MediaToPost" ("A", "B") VALUES
      ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333'),
      ('77777777-7777-7777-7777-777777777778', '44444444-4444-4444-4444-444444444445'),
      ('77777777-7777-7777-7777-777777777779', '44444444-4444-4444-4444-444444444446')
    ON CONFLICT DO NOTHING;
  `);

  // COMMENTS
  await prisma.comment.createMany({
    data: [
      { id: '77777777-7777-7777-7777-777777777777', postId: '33333333-3333-3333-3333-333333333333', authorId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', content: 'Great post!', status: 'APPROVED', ipAddress: '127.0.0.1' },
      { id: '88888888-8888-8888-8888-888888888889', postId: '44444444-4444-4444-4444-444444444445', authorId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', content: 'Interesting news!', status: 'APPROVED', ipAddress: '192.168.1.2' },
      { id: '88888888-8888-8888-8888-888888888890', postId: '44444444-4444-4444-4444-444444444446', authorId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', content: 'Great review!', status: 'APPROVED', ipAddress: '192.168.1.3' },
    ],
    skipDuplicates: true,
  });

  // VOTES
  await prisma.vote.createMany({
    data: [
      { id: '88888888-8888-8888-8888-888888888888', userId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', postId: '33333333-3333-3333-3333-333333333333', value: 1 },
      { id: '99999999-9999-9999-9999-999999999990', userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', postId: '44444444-4444-4444-4444-444444444445', value: 1 },
      { id: '99999999-9999-9999-9999-999999999991', userId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', postId: '44444444-4444-4444-4444-444444444446', value: -1 },
    ],
    skipDuplicates: true,
  });

  // ADMIN NOTES
  await prisma.adminNote.createMany({
    data: [
      { id: '99999999-9999-9999-9999-999999999999', userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', note: 'Alice is a good user.', createdById: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', note: 'Eve is a new user.', createdById: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    ],
    skipDuplicates: true,
  });

  // AUDIT LOGS
  await prisma.auditLog.createMany({
    data: [
      { id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', action: 'LOGIN', target: 'User', ip: '127.0.0.1', meta: { success: true } },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', action: 'LOGIN', target: 'User', ip: '192.168.1.2', meta: { success: true } },
    ],
    skipDuplicates: true,
  });

  // SITE SETTINGS
  await prisma.siteSetting.createMany({
    data: [
      { key: 'site_name', value: 'Lavie Manga Blog', type: 'string' },
      { key: 'maintenance_mode', value: 'off', type: 'string' },
    ],
    skipDuplicates: true,
  });

  // USER NOTIFICATION PREFERENCES
  await prisma.userNotificationPreference.createMany({
    data: [
      { id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', emailComment: true, emailReply: true, emailFollower: true, emailMention: true, emailNewsletter: true },
      { id: 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', emailComment: true, emailReply: true, emailFollower: false, emailMention: false, emailNewsletter: false },
      { id: 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', userId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', emailComment: true, emailReply: false, emailFollower: false, emailMention: false, emailNewsletter: false },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeef', userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', emailComment: true, emailReply: false, emailFollower: false, emailMention: false, emailNewsletter: false },
      { id: 'ffffffff-ffff-ffff-ffff-fffffffffff0', userId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', emailComment: false, emailReply: false, emailFollower: false, emailMention: false, emailNewsletter: false },
    ],
    skipDuplicates: true,
  });

  // NOTIFICATIONS
  await prisma.notification.createMany({
    data: [
      {
        userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        type: 'system',
        title: 'Welcome to Lavie!',
        message: 'Your admin account has been created.',
        link: '/admin',
        isRead: false,
        createdAt: new Date(),
      },
      {
        userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        type: 'report',
        title: 'New user report',
        message: 'A new report has been submitted.',
        link: '/admin/reports',
        isRead: false,
        createdAt: new Date(),
      },
      {
        userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        type: 'reply',
        title: 'New reply to your comment',
        message: 'Someone replied to your comment on "Welcome to Lavie".',
        link: '/post/welcome-to-lavie',
        isRead: false,
        createdAt: new Date(),
      },
      {
        userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        type: 'like',
        title: 'Your post got a like!',
        message: 'Your post "Manga News: June" received a new like.',
        link: '/post/manga-news-june',
        isRead: true,
        createdAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log('Seed complete!');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });