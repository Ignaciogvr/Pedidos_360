import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let configService: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: ConfigService, useValue: configServiceSpy }
      ]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    
    // Default mock return value
    configService.getApiUrl.and.returnValue('http://localhost:8080/api');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods', () => {
    it('should perform GET request with correct URL', (done) => {
      const mockData = { id: 1, name: 'Test' };
      
      service.get<typeof mockData>('/test').subscribe({
        next: data => {
          expect(data).toEqual(mockData);
          done();
        }
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should perform POST request with body', (done) => {
      const mockBody = { name: 'Test' };
      const mockResponse = { id: 1, ...mockBody };
      
      service.post<typeof mockResponse>('/test', mockBody).subscribe({
        next: data => {
          expect(data).toEqual(mockResponse);
          done();
        }
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });

    it('should perform PUT request with body', (done) => {
      const mockBody = { id: 1, name: 'Updated' };
      
      service.put<typeof mockBody>('/test/1', mockBody).subscribe({
        next: data => {
          expect(data).toEqual(mockBody);
          done();
        }
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockBody);
    });

    it('should perform DELETE request', (done) => {
      service.delete('/test/1').subscribe({
        next: () => {
          expect(true).toBe(true);
          done();
        }
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Error Handling', () => {
    it('should emit authError$ on 401 status', (done) => {
      service.authError$.subscribe(error => {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        done();
      });
      
      service.get('/test').subscribe({
        error: () => {}
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should emit permissionError$ on 403 status', (done) => {
      service.permissionError$.subscribe(error => {
        expect(error.status).toBe(403);
        expect(error.message).toBe('No tienes permisos para realizar esta acción.');
        done();
      });
      
      service.get('/test').subscribe({
        error: () => {}
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should emit networkError$ on network failure', (done) => {
      service.networkError$.subscribe(error => {
        expect(error.status).toBe(0);
        expect(error.message).toBe('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        done();
      });
      
      service.get('/test').subscribe({
        error: () => {}
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Network Error' });
    });

    it('should handle 404 error with correct message', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('El recurso solicitado no existe.');
          done();
        }
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500+ error with correct message', (done) => {
      service.get('/test').subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.message).toBe('Error del servidor. Intenta nuevamente más tarde.');
          done();
        }
      });
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('URL Building', () => {
    it('should handle endpoint with leading slash', (done) => {
      service.get('/test').subscribe();
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      expect(req.request.url).toBe('http://localhost:8080/api/test');
      req.flush(null);
      done();
    });

    it('should handle endpoint without leading slash', (done) => {
      service.get('test').subscribe();
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      expect(req.request.url).toBe('http://localhost:8080/api/test');
      req.flush(null);
      done();
    });

    it('should handle base URL with trailing slash', (done) => {
      configService.getApiUrl.and.returnValue('http://localhost:8080/api/');
      
      service.get('test').subscribe();
      
      const req = httpMock.expectOne('http://localhost:8080/api/test');
      expect(req.request.url).toBe('http://localhost:8080/api/test');
      req.flush(null);
      done();
    });
  });
});
