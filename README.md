# BrotliProcessor: Advanced Brotli Compression in JavaScript

This project provides a robust JavaScript implementation of the Brotli compression algorithm using the `brotli` npm package, a JavaScript port of Google's Brotli library (https://github.com/google/brotli). It offers advanced features like simulated streaming, progress tracking, performance metrics, and flexible configuration for compression and decompression.

## Features

- **Class-based Architecture**: Encapsulates Brotli functionality in a `BrotliProcessor` class for modularity and reusability.
- **Simulated Streaming**: Processes large datasets in chunks to manage memory usage, as the JavaScript port lacks native streaming.
- **Performance Metrics**: Tracks compression/decompression time, sizes, and compression ratio.
- **Flexible Configuration**: Supports customizable quality levels (0-11), compression modes (generic, text, font), and window sizes (10-24).
- **Progress Tracking**: Provides real-time progress callbacks during compression.
- **Robust Error Handling**: Manages errors during compression and decompression.
- **Browser and Node.js Compatibility**: Works in modern browsers and Node.js environments.

## Prerequisites

- Node.js (version 12 or higher) for Node environments.
- Modern browser (Chrome, Firefox, Edge) for browser-based usage.
- `brotli` package installed via npm.

## Installation

Install the required dependency:

```bash
npm install brotli
```

## Usage

The `BrotliProcessor` class provides methods for compression and decompression. Below is a basic example to get started:

### Example

```javascript
import { BrotliProcessor } from './brotli_advanced.js';

async function runExample() {
    try {
        // Initialize processor
        const processor = new BrotliProcessor();

        // Create sample data (1MB)
        const data = new Uint8Array(1024 * 1024).map((_, i) => i % 256);

        // Progress callback for streaming
        const progressCallback = (progress, chunkSize) => {
            console.log(`Progress: ${(progress * 100).toFixed(2)}%, Chunk: ${chunkSize} bytes`);
        };

        // Compress with streaming
        const compressed = await processor.compressWithProgress(data, {
            quality: 9,
            mode: 1, // Text mode
            chunkSize: 512 * 1024, // 512KB chunks
            lgwin: 22 // Window size
        }, progressCallback);

        // Decompress
        const decompressed = await processor.decompress(compressed);

        // Verify and log metrics
        const isValid = decompressed.every((byte, i) => byte === data[i]);
        console.log('Verification:', isValid ? 'Success' : 'Failed');
        console.log('Metrics:', processor.getMetrics());
    } catch (error) {
        console.error('Error:', error.message);
    }
}

runExample();
```

### Key Methods

- **`compressWithProgress(data, options, progressCallback)`**: Compresses data with optional simulated streaming and progress tracking.
  - `options`: `{ quality: number, mode: number, chunkSize: number, lgwin: number }`
- **`decompress(compressedData)`**: Decompresses data.
- **`getMetrics()`**: Returns performance metrics (compression/decompression time, sizes, ratio).

### Configuration Options

- `quality`: Compression level (0-11, default: 6). Higher values improve compression but are slower.
- `mode`: Compression mode (0: generic, 1: text, 2: font, default: 0).
- `chunkSize`: Size of chunks for simulated streaming (default: 1MB).
- `lgwin`: Base-2 logarithm of the sliding window size (10-24, default: 22).

## Performance Considerations

- **Compression Levels**: Quality 9 is used in the example for strong compression. Use 0-4 for speed or 10-11 for maximum compression.
- **Simulated Streaming**: Chunking prevents memory issues for large datasets (>1MB).
- **Window Size**: Larger `lgwin` values (up to 24) improve compression for large files but increase memory usage.
- **JavaScript Port**: The `brotli` package is slower than native Brotli or Zstd's WebAssembly implementation.

## Limitations

- The `brotli` npm package does not support native streaming or dictionary compression, unlike the native Brotli C library.
- Large files (>2GB) may encounter issues due to an integer overflow bug in the JavaScript port (fixed in Brotli 1.0.9).
- Decompression is "one-shot" and not streamable in this implementation.

## Extending the Implementation

To enhance this implementation, consider:

- Using Web Workers for concurrent chunk compression.
- Integrating native Brotli bindings (e.g., via Node.js addons) for true streaming and dictionary support.
- Adding support for advanced Brotli parameters (e.g., `lgblock`) with native bindings.
- Combining with other compression algorithms (e.g., Zstd) for hybrid workflows.

## References

- [Brotli GitHub Repository](https://github.com/google/brotli)
- [Brotli npm Package](https://www.npmjs.com/package/brotli)
- [Brotli Specification (RFC 7932)](https://tools.ietf.org/html/rfc7932)
