import { compress as brotliCompress, decompress as brotliDecompress } from 'brotli';

class BrotliProcessor {
    constructor() {
        this.performanceMetrics = {
            compressionTime: 0,
            decompressionTime: 0,
            originalSize: 0,
            compressedSize: 0
        };
    }

    async compressWithProgress(data, options = {}, progressCallback = null) {
        const { quality = 6, mode = 0, chunkSize = 1024 * 1024, lgwin = 22 } = options;

        const startTime = performance.now();
        let compressedData;

        try {
            if (chunkSize && data.length > chunkSize) {
                compressedData = await this.streamCompress(data, quality, mode, chunkSize, lgwin, progressCallback);
            } else {
                compressedData = brotliCompress(data, {
                    mode, 
                    quality, 
                    lgwin 
                });
            }

            this.performanceMetrics.compressionTime = performance.now() - startTime;
            this.performanceMetrics.originalSize = data.length;
            this.performanceMetrics.compressedSize = compressedData.length;

            return compressedData;
        } catch (error) {
            throw new Error(`Compression failed: ${error.message}`);
        }
    }

    async streamCompress(data, quality, mode, chunkSize, lgwin, progressCallback) {
        const chunks = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const compressedChunk = brotliCompress(chunk, {
                mode,
                quality,
                lgwin
            });
            chunks.push(compressedChunk);

            if (progressCallback) {
                const progress = Math.min((i + chunkSize) / data.length, 1);
                progressCallback(progress, compressedChunk.length);
            }
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result;
    }

    async decompress(compressedData) {
        const startTime = performance.now();
        try {
            const decompressedData = brotliDecompress(compressedData);
            this.performanceMetrics.decompressionTime = performance.now() - startTime;
            return decompressedData;
        } catch (error) {
            throw new Error(`Decompression failed: ${error.message}`);
        }
    }

    getMetrics() {
        return {
            ...this.performanceMetrics,
            compressionRatio: this.performanceMetrics.originalSize / 
                (this.performanceMetrics.compressedSize || 1)
        };
    }
}

async function runBrotliExample() {
    try {
        const processor = new BrotliProcessor();

        const dataSize = 5 * 1024 * 1024;
        const sampleData = new Uint8Array(dataSize);
        for (let i = 0; i < dataSize; i++) {
            sampleData[i] = Math.random() < 0.5 ? i % 256 : 0;
        }

        const progressCallback = (progress, chunkSize) => {
            console.log(`Compression progress: ${(progress * 100).toFixed(2)}%, Chunk size: ${chunkSize} bytes`);
        };

        const compressedData = await processor.compressWithProgress(sampleData, {
            quality: 9, 
            mode: 1,
            chunkSize: 512 * 1024,
            lgwin: 22 
        }, progressCallback);

        console.log('Compression completed. Metrics:', processor.getMetrics());
      
        const decompressedData = await processor.decompress(compressedData);

        const isValid = decompressedData.every((byte, i) => byte === sampleData[i]);
        console.log('Decompression verification:', isValid ? 'Success' : 'Failed');

    } catch (error) {
        console.error('Error in Brotli processing:', error.message);
    }
}

runBrotliExample();
