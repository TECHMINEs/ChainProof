import crypto from 'crypto';
import exifr from 'exifr';
import type { ExifData } from '@chainproof/types';

export function hashEvidenceMetadata(metadata: Record<string, any>): string {
  try {
    const sortedKeys = Object.keys(metadata).sort();
    const sortedMetadata: Record<string, any> = {};
    for (const key of sortedKeys) {
      sortedMetadata[key] = metadata[key];
    }
    const jsonString = JSON.stringify(sortedMetadata);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  } catch (error) {
    throw new Error('Failed to hash evidence metadata');
  }
}

export function hashTransferData(
  evidenceId: string,
  fromUserId: string,
  toUserId: string,
  purpose: string,
  timestamp: string
): string {
  try {
    const concatenated = `${evidenceId}|${fromUserId}|${toUserId}|${purpose}|${timestamp}`;
    return crypto.createHash('sha256').update(concatenated).digest('hex');
  } catch (error) {
    throw new Error('Failed to hash transfer data');
  }
}

export function computeIntegrityScore(
  dbMatches: boolean,
  ipfsChecked: boolean,
  ipfsMatches: boolean,
  chainChecked: boolean,
  chainMatches: boolean
): number {
  try {
    if (!dbMatches) return 0;
    let score = 100;
    if (ipfsChecked && !ipfsMatches) score -= 34;
    if (chainChecked && !chainMatches) score -= 34;
    return Math.max(0, score);
  } catch (error) {
    throw new Error('Failed to compute integrity score');
  }
}

// Distance helper using Haversine formula
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius of the earth in m
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export async function extractExifFromBuffer(
  buffer: Buffer,
  expectedLatitude?: number,
  expectedLongitude?: number
): Promise<ExifData> {
  try {
    const exif = await exifr.parse(buffer);
    if (!exif) {
      return {};
    }

    const gpsLat = exif.latitude;
    const gpsLon = exif.longitude;
    
    let discrepancyMeters: number | undefined = undefined;
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
  } catch (error) {
    throw new Error('Failed to extract EXIF data');
  }
}

export function verifyFileHash(buffer: Buffer, expectedHash: string): boolean {
  try {
    const actualHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const a = Buffer.from(actualHash);
    const b = Buffer.from(expectedHash);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (error) {
    throw new Error('Failed to verify file hash');
  }
}
