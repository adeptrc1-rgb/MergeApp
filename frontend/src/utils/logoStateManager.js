/**
 * Logo State Manager
 * Centralized system for managing logo dot states and animations
 */

class LogoStateManager {
  constructor() {
    this.currentState = 'default';
    this.previousPersistentState = 'default';
    this.stateTimeout = null;
    this.listeners = new Set();
    
    // State configuration
    this.stateConfig = {
      default: {
        persistent: true,
        priority: 0,
        duration: null
      },
      highMatch: {
        persistent: false,
        priority: 3,
        duration: 3000
      },
      newMatch: {
        persistent: false,
        priority: 5,
        duration: 10000
      },
      superLike: {
        persistent: false,
        priority: 4,
        duration: 4000
      },
      highEnergy: {
        persistent: true,
        priority: 1,
        duration: null
      }
    };
  }

  /**
   * Update logo state with priority and timeout handling
   */
  updateState(newState) {
    const newConfig = this.stateConfig[newState];
    const currentConfig = this.stateConfig[this.currentState];

    if (!newConfig) {
      console.warn(`Invalid logo state: ${newState}`);
      return;
    }

    // Check if new state has higher priority or if current state is expired
    if (newConfig.priority < currentConfig.priority && this.stateTimeout) {
      console.log(`Ignoring ${newState} - current state ${this.currentState} has higher priority`);
      return;
    }

    // Clear existing timeout if any
    if (this.stateTimeout) {
      clearTimeout(this.stateTimeout);
      this.stateTimeout = null;
    }

    // Update persistent state tracking
    if (newConfig.persistent) {
      this.previousPersistentState = newState;
    }

    // Set new state
    this.currentState = newState;
    this.notifyListeners();

    console.log(`Logo state updated: ${newState}`);

    // Set timeout for temporary states
    if (newConfig.duration) {
      this.stateTimeout = setTimeout(() => {
        this.revertToPersistentState();
      }, newConfig.duration);
    }
  }

  /**
   * Revert to the last persistent state
   */
  revertToPersistentState() {
    console.log(`Reverting from ${this.currentState} to ${this.previousPersistentState}`);
    this.currentState = this.previousPersistentState;
    this.stateTimeout = null;
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState() {
    return this.currentState;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentState));
  }

  /**
   * Reset to default state
   */
  reset() {
    if (this.stateTimeout) {
      clearTimeout(this.stateTimeout);
      this.stateTimeout = null;
    }
    this.currentState = 'default';
    this.previousPersistentState = 'default';
    this.notifyListeners();
  }
}

// Create singleton instance
const logoStateManager = new LogoStateManager();

/**
 * Global function to update logo state
 * Can be called from anywhere in the app
 */
export const updateLogoState = (newState) => {
  logoStateManager.updateState(newState);
};

/**
 * Hook for React components to use logo state
 */
export const useLogoState = () => {
  const [state, setState] = React.useState(logoStateManager.getState());

  React.useEffect(() => {
    const unsubscribe = logoStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
};

// Export for direct access if needed
export default logoStateManager;
