import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/Notification';

// Use fetch or supertest depending on your setup
// Here we use fetch for API calls (Node 18+ or with node-fetch polyfill)

const admin = { username: 'admin', id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' };
const alice = { username: 'alice', id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' };
const bob = { username: 'bob', id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' };

beforeEach(async () => {
  // Clear notifications
  await prisma.notification.deleteMany({});
});

describe('Mention Notifications', () => {
  it('creates a mention notification for a user in a comment', async () => {
    // Simulate comment creation as admin mentioning alice
    const commentRes = await fetch(`http://localhost:3000/api/posts/33333333-3333-3333-3333-333333333333/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({ content: 'Hello @alice!', parentId: null })
    });
    const commentData = await commentRes.json();
    if (!commentRes.ok) console.error('Comment API error:', commentData);
    // Fetch alice's notifications
    const res = await fetch(`http://localhost:3000/api/users/alice/notifications/list`);
    const data = await res.json();
    if (!data.notifications) {
      console.error('Notification API response:', data);
      throw new Error('No notifications field in response');
    }
    expect(data.notifications.some((n: any) => n.type === NotificationType.Mention && n.message.includes('@admin'))).toBe(true);
  });

  it('creates mention notifications for multiple users in a comment', async () => {
    const commentRes = await fetch(`http://localhost:3000/api/posts/33333333-3333-3333-3333-333333333333/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({ content: 'Hi @alice and @bob!', parentId: null })
    });
    const commentData = await commentRes.json();
    if (!commentRes.ok) console.error('Comment API error:', commentData);
    for (const user of [alice, bob]) {
      const res = await fetch(`http://localhost:3000/api/users/${user.username}/notifications/list`);
      const data = await res.json();
      if (!data.notifications) {
        console.error(`Notification API response for ${user.username}:`, data);
        throw new Error('No notifications field in response');
      }
      expect(data.notifications.some((n: any) => n.type === NotificationType.Mention)).toBe(true);
    }
  });

  it('does not notify on self-mention', async () => {
    const commentRes = await fetch(`http://localhost:3000/api/posts/33333333-3333-3333-3333-333333333333/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'alice' },
      body: JSON.stringify({ content: '@alice is here!', parentId: null })
    });
    const commentData = await commentRes.json();
    if (!commentRes.ok) console.error('Comment API error:', commentData);
    const res = await fetch(`http://localhost:3000/api/users/alice/notifications/list`);
    const data = await res.json();
    if (!data.notifications) {
      console.error('Notification API response:', data);
      throw new Error('No notifications field in response');
    }
    expect(data.notifications.some((n: any) => n.type === NotificationType.Mention)).toBe(false);
  });

  it('creates mention notifications on post creation (admin)', async () => {
    const postRes = await fetch(`http://localhost:3000/api/admin/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({
        title: 'Test Post',
        content: 'Special thanks to @bob!',
        categoryIds: ['44444444-4444-4444-4444-444444444444'],
        status: 'PUBLISHED'
      })
    });
    const postData = await postRes.json();
    if (!postRes.ok) console.error('Post API error:', postData);
    const res = await fetch(`http://localhost:3000/api/users/bob/notifications/list`);
    const data = await res.json();
    if (!data.notifications) {
      console.error('Notification API response:', data);
      throw new Error('No notifications field in response');
    }
    expect(data.notifications.some((n: any) => n.type === NotificationType.Mention)).toBe(true);
  });

  it('creates mention notifications on post edit (admin)', async () => {
    // First, create a post as admin
    const postRes = await fetch(`http://localhost:3000/api/admin/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({
        title: 'Edit Test',
        content: 'No mentions yet.',
        categoryIds: ['44444444-4444-4444-4444-444444444444'],
        status: 'PUBLISHED'
      })
    });
    const postData = await postRes.json();
    if (!postRes.ok) console.error('Post API error:', postData);
    if (!postData.post) {
      console.error('Post creation response:', postData);
      throw new Error('No post field in response');
    }
    const postId = postData.post.id;
    // Now, edit the post to mention alice
    const patchRes = await fetch(`http://localhost:3000/api/admin/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({
        title: 'Edit Test',
        content: 'Now mentioning @alice!',
        categoryIds: ['44444444-4444-4444-4444-444444444444'],
        status: 'PUBLISHED'
      })
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok) console.error('Patch API error:', patchData);
    const res = await fetch(`http://localhost:3000/api/users/alice/notifications/list`);
    const data = await res.json();
    if (!data.notifications) {
      console.error('Notification API response:', data);
      throw new Error('No notifications field in response');
    }
    expect(data.notifications.some((n: any) => n.type === NotificationType.Mention)).toBe(true);
  });
}); 