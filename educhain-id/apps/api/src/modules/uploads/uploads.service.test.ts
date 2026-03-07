import { generatePresignedUploadUrl } from '../../lib/storage';

// Mock the Supabase storage module
jest.mock('../../lib/storage', () => ({
  generatePresignedUploadUrl: jest.fn(),
}));

const mockGenerate = generatePresignedUploadUrl as jest.MockedFunction<typeof generatePresignedUploadUrl>;

describe('uploads.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate to lib/storage generatePresignedUploadUrl', async () => {
    mockGenerate.mockResolvedValue({
      uploadUrl: 'https://storage.supabase.co/upload/sign/cert.pdf',
      fileKey: 'certificates/123.pdf',
      publicUrl: 'https://storage.supabase.co/object/public/cert.pdf',
    });

    const { generatePresignedUploadUrl: serviceFn } = await import('./uploads.service');
    const result = await serviceFn('diploma.pdf', 'application/pdf');

    expect(mockGenerate).toHaveBeenCalledWith('diploma.pdf', 'application/pdf', undefined);
    expect(result.uploadUrl).toBeDefined();
    expect(result.fileKey).toBeDefined();
    expect(result.publicUrl).toBeDefined();
  });

  it('should pass fileSize to storage', async () => {
    mockGenerate.mockResolvedValue({
      uploadUrl: 'https://example.com/upload',
      fileKey: 'certificates/456.pdf',
      publicUrl: 'https://example.com/public',
    });

    const { generatePresignedUploadUrl: serviceFn } = await import('./uploads.service');
    await serviceFn('doc.pdf', 'application/pdf', 5_000_000);

    expect(mockGenerate).toHaveBeenCalledWith('doc.pdf', 'application/pdf', 5_000_000);
  });
});
