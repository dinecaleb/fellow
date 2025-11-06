/**
 * Test setup file
 * Configures test environment and mocks
 */

// Mock crypto for Node.js environment
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = {
        getRandomValues: (arr: any) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        },
    } as Crypto;
}

