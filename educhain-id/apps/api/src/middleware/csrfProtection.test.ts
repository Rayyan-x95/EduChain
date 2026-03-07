import { csrfProtection } from './csrfProtection';

// Simple mocks for Fastify request/reply
function mockRequest(method: string, origin?: string, referer?: string) {
  return {
    method,
    headers: {
      ...(origin ? { origin } : {}),
      ...(referer ? { referer } : {}),
    },
  } as any;
}

function mockReply() {
  const reply: any = {
    statusCode: 200,
    _sent: null,
    status(code: number) {
      reply.statusCode = code;
      return reply;
    },
    send(body: any) {
      reply._sent = body;
      return reply;
    },
  };
  return reply;
}

describe('csrfProtection', () => {
  const allowed = ['https://educhain.com', 'https://app.educhain.com'];
  const hook = csrfProtection(allowed);

  beforeAll(() => {
    process.env.NODE_ENV = 'production';
  });

  afterAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should allow GET requests unconditionally', (done) => {
    const req = mockRequest('GET');
    const reply = mockReply();

    hook(req, reply, () => {
      done(); // done callback means it passed through
    });
  });

  it('should allow HEAD and OPTIONS requests', (done) => {
    const req = mockRequest('OPTIONS');
    const reply = mockReply();

    hook(req, reply, done);
  });

  it('should allow POST with a matching Origin', (done) => {
    const req = mockRequest('POST', 'https://educhain.com');
    const reply = mockReply();

    hook(req, reply, done);
  });

  it('should reject POST with a mismatched Origin', () => {
    const req = mockRequest('POST', 'https://evil.com');
    const reply = mockReply();
    let called = false;

    hook(req, reply, () => {
      called = true;
    });

    expect(called).toBe(false);
    expect(reply.statusCode).toBe(403);
    expect(reply._sent.error.code).toBe('CSRF_ORIGIN_MISMATCH');
  });

  it('should allow POST with no Origin but matching Referer', (done) => {
    const req = mockRequest('POST', undefined, 'https://educhain.com/some/page');
    const reply = mockReply();

    hook(req, reply, done);
  });

  it('should allow requests with no Origin and no Referer (server-to-server)', (done) => {
    const req = mockRequest('POST');
    const reply = mockReply();

    hook(req, reply, done);
  });
});
