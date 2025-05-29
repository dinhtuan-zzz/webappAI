import { prisma } from '@/lib/prisma';

const admin = { username: 'admin', id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' };
const alice = { username: 'alice', id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' };
const postId = '33333333-3333-3333-3333-333333333333';

beforeEach(async () => {
  // Clean up comments for isolation
  await prisma.comment.deleteMany({ where: { postId } });
});

describe('Comment API Validation & Sanitization', () => {
  it('rejects empty/meaningless comments', async () => {
    for (const content of [
      '',
      '   ',
      '<p><br></p>',
      '<div></div>',
      '<b> </b>',
      '<span>\n</span>'
    ]) {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toMatch(/empty/i);
    }
  });

  it('accepts valid comments with text and allowed HTML', async () => {
    const validCases = [
      'Hello world!',
      '<b>Bold</b> text',
      '<ul><li>Item</li></ul>',
      '<a href="https://example.com">Link</a>'
    ];
    for (const content of validCases) {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.comment.content).toContain('Item') || expect(data.comment.content).toContain('Bold') || expect(data.comment.content).toContain('Hello') || expect(data.comment.content).toContain('Link');
    }
  });

  it('sanitizes XSS/malicious HTML', async () => {
    const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({ content: '<img src=x onerror=alert(1) />Hello<script>alert(2)</script>' })
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.comment.content).not.toContain('onerror');
    expect(data.comment.content).not.toContain('<script>');
    expect(data.comment.content).toContain('Hello');
  });

  it('rejects unauthorized comment creation', async () => {
    const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Should fail' })
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toMatch(/unauthorized/i);
  });

  it('edit comment: applies same validation and sanitization', async () => {
    // Create a valid comment first
    const createRes = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({ content: 'Initial comment' })
    });
    const createData = await createRes.json();
    expect(createRes.status).toBe(200);
    const commentId = createData.comment.id;
    // Try to edit to empty
    const editRes = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({ content: '<p><br></p>' })
    });
    const editData = await editRes.json();
    expect(editRes.status).toBe(400);
    expect(editData.error).toMatch(/empty/i);
    // Edit to XSS
    const editRes2 = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'admin' },
      body: JSON.stringify({ content: '<img src=x onerror=alert(1) />Edit' })
    });
    const editData2 = await editRes2.json();
    expect(editRes2.status).toBe(200);
    expect(editData2.comment.content).not.toContain('onerror');
    expect(editData2.comment.content).toContain('Edit');
  });
}); 