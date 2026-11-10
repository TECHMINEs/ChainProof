"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashEvidenceMetadata = hashEvidenceMetadata;
exports.hashTransferData = hashTransferData;
exports.computeIntegrityScore = computeIntegrityScore;
exports.extractExifFromBuffer = extractExifFromBuffer;
exports.verifyFileHash = verifyFileHash;
const crypto_1 = __importDefault(require("crypto"));
const exifr_1 = __importDefault(require("exifr"));
function hashEvidenceMetadata(metadata) {
    try {
        const sortedKeys = Object.keys(metadata).sort();
        const sortedMetadata = {};
        for (const key of sortedKeys) {
            sortedMetadata[key] = metadata[key];
        }
        const jsonString = JSON.stringify(sortedMetadata);
        return crypto_1.default.createHash('sha256').update(jsonString).digest('hex');
    }
    catch (error) {
        throw new Error('Failed to hash evidence metadata');
    }
}
function hashTransferData(evidenceId, fromUserId, toUserId, purpose, timestamp) {
    try {
        const concatenated = `${evidenceId}|${fromUserId}|${toUserId}|${purpose}|${timestamp}`;
        return crypto_1.default.createHash('sha256').update(concatenated).digest('hex');
    }
    catch (error) {
        throw new Error('Failed to hash transfer data');
    }
}
function computeIntegrityScore(dbMatches, ipfsChecked, ipfsMatches, chainChecked, chainMatches) {
    try {
        if (!dbMatches)
            return 0;
        let score = 100;
        if (ipfsChecked && !ipfsMatches)
            score -= 34;
        if (chainChecked && !chainMatches)
            score -= 34;
        return Math.max(0, score);
    }
    catch (error) {
        throw new Error('Failed to compute integrity score');
    }
}
// Distance helper using Haversine formula
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
}
async function extractExifFromBuffer(buffer, expectedLatitude, expectedLongitude) {
    try {
        const exif = await exifr_1.default.parse(buffer);
        if (!exif) {
            return {};
        }
        const gpsLat = exif.latitude;
        const gpsLon = exif.longitude;
        let discrepancyMeters = undefined;
        if (gpsLat !== undefined && gpsLon !== undefined && expectedLatitude !== undefined && expectedLongitude !== undefined) {
            discrepancyMeters = getDistanceFromLatLonInMeters(gpsLat, gpsLon, expectedLatitude, expectedLongitude);
        }
        return {
            latitude: gpsLat,
            longitude: gpsLon,
            altitude: exif.GPSAltitude,
            timestamp: exif.DateTimeOriginal?.toISOString() || exif.CreateDate?.toISOString(),
            cameraModel: exif.Model,
            software: exif.Software,
            gpsDiscrepancyMeters: discrepancyMeters
        };
    }
    catch (error) {
        throw new Error('Failed to extract EXIF data');
    }
}
function verifyFileHash(buffer, expectedHash) {
    try {
        const actualHash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
        const a = Buffer.from(actualHash);
        const b = Buffer.from(expectedHash);
        if (a.length !== b.length)
            return false;
        return crypto_1.default.timingSafeEqual(a, b);
    }
    catch (error) {
        throw new Error('Failed to verify file hash');
    }
}
