import { Test, TestingModule } from '@nestjs/testing';
import { CaptureService } from '../src/capture/capture.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CaptureService', () => {
  let service: CaptureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaptureService],
    }).compile();

    service = module.get<CaptureService>(CaptureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('parses simple curl', async () => {
    const curlCommand = 'curl https://api.example.com/users';
    const result = await service.parseCurl(curlCommand);
    
    expect(result.method).toBe('GET');
    expect(result.url).toBe('https://api.example.com/users');
    expect(result.rawCurl).toBe(curlCommand);
  });

  it('parses curl with headers', async () => {
    const curlCommand = 'curl -H "Authorization: Bearer token" https://api.example.com/users';
    const result = await service.parseCurl(curlCommand);
    
    expect(result.method).toBe('GET');
    expect(result.headers).toBeDefined();
  });

  it('parses POST curl with data', async () => {
    const curlCommand = 'curl -X POST -d "{"name":"test"}" https://api.example.com/users';
    const result = await service.parseCurl(curlCommand);
    
    expect(result.method).toBe('POST');
    expect(result.body).toBeDefined();
  });

  it('handles invalid curl', async () => {
    const invalidCurl = 'not a curl command';
    
    await expect(service.parseCurl(invalidCurl)).rejects.toThrow('Failed to parse cURL');
  });
});
