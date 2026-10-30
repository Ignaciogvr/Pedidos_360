import { TestBed } from '@angular/core/testing';
import { UserStore } from './user.store';
import { AuthService } from '../services/auth.service';
import { UserData } from '../../shared/models/user.model';

describe('UserStore', () => {
  let store: UserStore;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Create a mock AuthService
    authServiceMock = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
  });

  it('should be created', () => {
    // Mock getCurrentUser to return null to avoid constructor calling it
    authServiceMock.getCurrentUser.and.returnValue(null);
    
    store = TestBed.inject(UserStore);
    expect(store).toBeTruthy();
  });

  it('should load user data from AuthService on initialization', () => {
    const mockUser: UserData = {
      name: 'Test User',
      email: 'test@example.com',
      roles: ['Admin'],
      initials: 'TU'
    };

    authServiceMock.getCurrentUser.and.returnValue(mockUser);
    
    store = TestBed.inject(UserStore);

    expect(store.currentUser()).toEqual(mockUser);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isAdmin()).toBe(true);
    expect(store.isLoading()).toBe(false);
  });

  it('should compute isAdmin correctly', () => {
    const adminUser: UserData = {
      name: 'Admin User',
      email: 'admin@example.com',
      roles: ['Admin'],
      initials: 'AU'
    };

    authServiceMock.getCurrentUser.and.returnValue(adminUser);
    store = TestBed.inject(UserStore);

    expect(store.isAdmin()).toBe(true);
    expect(store.isOperador()).toBe(false);
    expect(store.isCliente()).toBe(false);
  });

  it('should compute isOperador correctly', () => {
    const operadorUser: UserData = {
      name: 'Operador User',
      email: 'operador@example.com',
      roles: ['Operador'],
      initials: 'OU'
    };

    authServiceMock.getCurrentUser.and.returnValue(operadorUser);
    store = TestBed.inject(UserStore);

    expect(store.isAdmin()).toBe(false);
    expect(store.isOperador()).toBe(true);
    expect(store.isCliente()).toBe(false);
  });

  it('should compute isCliente correctly', () => {
    const clienteUser: UserData = {
      name: 'Cliente User',
      email: 'cliente@example.com',
      roles: ['Cliente'],
      initials: 'CU'
    };

    authServiceMock.getCurrentUser.and.returnValue(clienteUser);
    store = TestBed.inject(UserStore);

    expect(store.isAdmin()).toBe(false);
    expect(store.isOperador()).toBe(false);
    expect(store.isCliente()).toBe(true);
  });

  it('should handle multiple roles', () => {
    const multiRoleUser: UserData = {
      name: 'Multi Role User',
      email: 'multi@example.com',
      roles: ['Admin', 'Operador'],
      initials: 'MR'
    };

    authServiceMock.getCurrentUser.and.returnValue(multiRoleUser);
    store = TestBed.inject(UserStore);

    expect(store.isAdmin()).toBe(true);
    expect(store.isOperador()).toBe(true);
    expect(store.isCliente()).toBe(false);
  });

  it('should handle null user (not authenticated)', () => {
    authServiceMock.getCurrentUser.and.returnValue(null);
    
    store = TestBed.inject(UserStore);

    expect(store.currentUser()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isAdmin()).toBe(false);
    expect(store.isOperador()).toBe(false);
    expect(store.isCliente()).toBe(false);
  });

  it('should reload user data when loadUser is called', () => {
    authServiceMock.getCurrentUser.and.returnValue(null);
    store = TestBed.inject(UserStore);
    
    expect(store.currentUser()).toBeNull();

    const newUser: UserData = {
      name: 'New User',
      email: 'new@example.com',
      roles: ['Cliente'],
      initials: 'NU'
    };

    authServiceMock.getCurrentUser.and.returnValue(newUser);
    store.loadUser();

    expect(store.currentUser()).toEqual(newUser);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isCliente()).toBe(true);
  });

  it('should clear user data when clearUser is called', () => {
    const mockUser: UserData = {
      name: 'Test User',
      email: 'test@example.com',
      roles: ['Admin'],
      initials: 'TU'
    };

    authServiceMock.getCurrentUser.and.returnValue(mockUser);
    store = TestBed.inject(UserStore);

    expect(store.currentUser()).toEqual(mockUser);

    store.clearUser();

    expect(store.currentUser()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('should handle errors during loadUser', () => {
    authServiceMock.getCurrentUser.and.throwError('Auth error');
    
    store = TestBed.inject(UserStore);

    expect(store.currentUser()).toBeNull();
    expect(store.error()).toBe('Error al cargar usuario');
    expect(store.isLoading()).toBe(false);
  });

  it('should reset error when loadUser is called again', () => {
    authServiceMock.getCurrentUser.and.throwError('Auth error');
    store = TestBed.inject(UserStore);

    expect(store.error()).toBe('Error al cargar usuario');

    const mockUser: UserData = {
      name: 'Recovered User',
      email: 'recovered@example.com',
      roles: ['Admin'],
      initials: 'RU'
    };

    authServiceMock.getCurrentUser.and.returnValue(mockUser);
    store.loadUser();

    expect(store.error()).toBeNull();
    expect(store.currentUser()).toEqual(mockUser);
  });
});
