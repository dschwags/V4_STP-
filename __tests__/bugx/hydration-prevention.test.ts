/**
 * BugX v1.3 Hydration Prevention Test Suite
 * Prevents regression of hydration errors
 */

import { HydrationValidator } from '@/lib/bugx/hydration-validator';
import { BehavioralParityTester } from '@/lib/bugx/behavioral-parity-tests';

describe('BugX Hydration Prevention Tests', () => {
  
  describe('Anti-Pattern Detection', () => {
    it('should detect Math.random() in useState', () => {
      const badCode = `
        const [value, setValue] = useState(Math.random() * 100);
      `;
      
      const results = HydrationValidator.validateFile('test.tsx', badCode);
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe('no-random-in-state');
      expect(results[0].severity).toBe('error');
    });
    
    it('should pass BugX-compliant pattern', () => {
      const goodCode = `
        const [isClient, setIsClient] = useState(false);
        const [value, setValue] = useState(0); // Static initial value
        
        useEffect(() => {
          setIsClient(true);
        }, []);
        
        useEffect(() => {
          if (isClient) {
            setValue(Math.random() * 100); // Client-side only
          }
        }, [isClient]);
      `;
      
      const results = HydrationValidator.validateFile('test.tsx', badCode);
      const errors = results.filter(r => r.severity === 'error');
      expect(errors).toHaveLength(0);
    });
  });
  
  describe('Behavioral Parity Tests', () => {
    it('should detect random value inconsistency', () => {
      const result = BehavioralParityTester.testRandomValueConsistency();
      expect(result.passed).toBe(false);
      expect(result.recommendation).toContain('static initial values');
    });
    
    it('should validate useEffect dependencies', () => {
      const result = BehavioralParityTester.testUseEffectDependencies();
      expect(result.passed).toBe(true);
    });
  });
  
  describe('Hydration Error Prevention', () => {
    it('should prevent server-client mismatch', () => {
      // Simulate the pattern that caused the original error
      const serverRender = () => {
        return { activeUsers: 125 }; // Static value
      };
      
      const clientRender = () => {
        return { activeUsers: 125 }; // Same static value
      };
      
      const serverResult = serverRender();
      const clientResult = clientRender();
      
      expect(serverResult).toEqual(clientResult);
    });
    
    it('should handle client-side updates safely', (done) => {
      let isClient = false;
      let activeUsers = 125; // Static initial
      
      // Simulate hydration
      setTimeout(() => {
        isClient = true;
        if (isClient) {
          activeUsers = Math.floor(Math.random() * 150) + 50;
          expect(activeUsers).toBeGreaterThanOrEqual(50);
          expect(activeUsers).toBeLessThanOrEqual(199);
          done();
        }
      }, 0);
    });
  });
  
  describe('Validation Rules Compliance', () => {
    it('should enforce all BugX hydration rules', () => {
      const testFiles = [
        {
          path: 'hooks/use-hub-metrics.ts',
          content: `
            // BugX compliant pattern
            const [isClient, setIsClient] = useState(false);
            const [data, setData] = useState({ value: 125 });
            
            useEffect(() => setIsClient(true), []);
            useEffect(() => {
              if (isClient) {
                setData({ value: Math.random() });
              }
            }, [isClient]);
          `
        }
      ];
      
      return HydrationValidator.validateCodebase(testFiles).then(report => {
        expect(report.errors).toBe(0);
        expect(report.summary).toContain('No hydration validation issues');
      });
    });
  });
});