import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from './auth.service';
import { AccountInfo } from '@azure/msal-browser';

describe('AuthService', () => {
  let service: AuthService;
  let msalServiceMock: jasmine.SpyObj<MsalService>;

  beforeEach(() => {
    // Create MSAL service mock
    msalServiceMock = jasmine.createSpyObj('MsalService', ['loginRedirect', 'logoutRedirect'], {
      instance: jasmine.createSpyObj('IPublicClientApplication', [
        'getActiveAccount',
        'getAllAccounts',
        'setActiveAccount'
      ])
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: MsalService, useValue: msalServiceMock }
      ]
    });
  });

  describe('calculateInitials', () => {
    beforeEach(() => {
      // Mock no active account for initialization
      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(null);
      (msalServiceMock.instance.getAllAccounts as jasmine.Spy).and.returnValue([]);
      service = TestBed.inject(AuthService);
    });

    it('should return ?? for empty name', () => {
      const mockAccount: Partial<AccountInfo> = {
        name: '',
        username: 'test@example.com',
        idTokenClaims: { roles: [] }
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      expect(service.getUserInitials()).toBe('??');
    });

    it('should return first 2 chars uppercase for single word', () => {
      const mockAccount: Partial<AccountInfo> = {
        name: 'John',
        username: 'john@example.com',
        idTokenClaims: { roles: [] }
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      expect(service.getUserInitials()).toBe('JO');
    });

    it('should return first char of first and last word for multiple words', () => {
      const mockAccount: Partial<AccountInfo> = {
        name: 'John Doe',
        username: 'john.doe@example.com',
        idTokenClaims: { roles: [] }
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      expect(service.getUserInitials()).toBe('JD');
    });

    it('should handle multiple spaces between words', () => {
      const mockAccount: Partial<AccountInfo> = {
        name: 'John   Middle   Doe',
        username: 'test@example.com',
        idTokenClaims: { roles: [] }
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      expect(service.getUserInitials()).toBe('JD');
    });
  });

  describe('user authentication', () => {
    beforeEach(() => {
      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(null);
      (msalServiceMock.instance.getAllAccounts as jasmine.Spy).and.returnValue([]);
      service = TestBed.inject(AuthService);
    });

    it('should return null for unauthenticated user', () => {
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should extract user data from MSAL account', () => {
      const mockAccount: Partial<AccountInfo> = {
        name: 'Jane Smith',
        username: 'jane.smith@example.com',
        idTokenClaims: {
          roles: ['Admin', 'Operador'],
          oid: '12345-abcde',
          tid: 'tenant-id'
        }
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      const user = service.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Jane Smith');
      expect(user?.email).toBe('jane.smith@example.com');
      expect(user?.roles).toEqual(['Admin', 'Operador']);
      expect(user?.initials).toBe('JS');
      expect(user?.oid).toBe('12345-abcde');
      expect(user?.tid).toBe('tenant-id');
    });

    it('should handle missing roles', () => {
      const mockAccount: Partial<AccountInfo> = {
        name: 'Test User',
        username: 'test@example.com',
        idTokenClaims: {}
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      expect(service.getUserRoles()).toEqual([]);
    });
  });

  describe('signals', () => {
    beforeEach(() => {
      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(null);
      (msalServiceMock.instance.getAllAccounts as jasmine.Spy).and.returnValue([]);
      service = TestBed.inject(AuthService);
    });

    it('should update user$ signal when user data changes', () => {
      expect(service.user$()).toBeNull();

      const mockAccount: Partial<AccountInfo> = {
        name: 'Test User',
        username: 'test@example.com',
        idTokenClaims: { roles: ['Cliente'] }
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      const user = service.user$();
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Test User');
    });

    it('should update isAuthenticated$ computed signal', () => {
      expect(service.isAuthenticated$()).toBeFalse();

      const mockAccount: Partial<AccountInfo> = {
        name: 'Test User',
        username: 'test@example.com',
        idTokenClaims: { roles: [] }
      };

      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(mockAccount);
      service.refreshUser();

      expect(service.isAuthenticated$()).toBeTrue();
    });
  });

  describe('auth operations', () => {
    beforeEach(() => {
      (msalServiceMock.instance.getActiveAccount as jasmine.Spy).and.returnValue(null);
      (msalServiceMock.instance.getAllAccounts as jasmine.Spy).and.returnValue([]);
      service = TestBed.inject(AuthService);
    });

    it('should call MSAL loginRedirect', () => {
      service.login();
      expect(msalServiceMock.loginRedirect).toHaveBeenCalled();
    });

    it('should call MSAL logoutRedirect', () => {
      service.logout();
      expect(msalServiceMock.logoutRedirect).toHaveBeenCalled();
    });
  });
});
