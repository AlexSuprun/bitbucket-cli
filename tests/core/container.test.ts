/**
 * Container tests
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { Container } from '../../src/core/container.js';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    Container.reset();
    container = Container.getInstance();
  });

  describe('getInstance', () => {
    it('should return same instance', () => {
      const instance1 = Container.getInstance();
      const instance2 = Container.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should return new instance after reset', () => {
      const instance1 = Container.getInstance();
      Container.reset();
      const instance2 = Container.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('register', () => {
    it('should register and resolve a service', () => {
      container.register('TestService', () => ({ value: 42 }));

      const service = container.resolve<{ value: number }>('TestService');

      expect(service.value).toBe(42);
    });

    it('should return same instance for singleton (default)', () => {
      let callCount = 0;
      container.register('TestService', () => {
        callCount++;
        return { id: callCount };
      });

      const service1 = container.resolve<{ id: number }>('TestService');
      const service2 = container.resolve<{ id: number }>('TestService');

      expect(service1).toBe(service2);
      expect(service1.id).toBe(1);
      expect(callCount).toBe(1);
    });

    it('should return new instance when singleton is false', () => {
      let callCount = 0;
      container.register(
        'TestService',
        () => {
          callCount++;
          return { id: callCount };
        },
        { singleton: false }
      );

      const service1 = container.resolve<{ id: number }>('TestService');
      const service2 = container.resolve<{ id: number }>('TestService');

      expect(service1).not.toBe(service2);
      expect(service1.id).toBe(1);
      expect(service2.id).toBe(2);
    });
  });

  describe('registerInstance', () => {
    it('should register an existing instance', () => {
      const instance = { value: 'test' };
      container.registerInstance('TestService', instance);

      const resolved = container.resolve<{ value: string }>('TestService');

      expect(resolved).toBe(instance);
    });
  });

  describe('registerClass', () => {
    it('should instantiate class with dependencies', () => {
      class Dependency {
        getValue() {
          return 42;
        }
      }

      class Service {
        constructor(public dep: Dependency) {}
      }

      container.register('Dependency', () => new Dependency());
      container.registerClass('Service', Service, ['Dependency']);

      const service = container.resolve<Service>('Service');

      expect(service.dep.getValue()).toBe(42);
    });
  });

  describe('resolve', () => {
    it('should throw for unregistered service', () => {
      expect(() => {
        container.resolve('NonExistent');
      }).toThrow('Service not registered: NonExistent');
    });
  });

  describe('has', () => {
    it('should return true for registered service', () => {
      container.register('TestService', () => ({}));

      expect(container.has('TestService')).toBe(true);
    });

    it('should return false for unregistered service', () => {
      expect(container.has('NonExistent')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should remove a registered service', () => {
      container.register('TestService', () => ({}));
      expect(container.has('TestService')).toBe(true);

      container.unregister('TestService');

      expect(container.has('TestService')).toBe(false);
    });

    it('should return false for non-existent service', () => {
      const result = container.unregister('NonExistent');

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all services', () => {
      container.register('Service1', () => ({}));
      container.register('Service2', () => ({}));

      container.clear();

      expect(container.has('Service1')).toBe(false);
      expect(container.has('Service2')).toBe(false);
    });
  });
});
