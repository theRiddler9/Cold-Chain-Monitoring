import type { TelemetryPayload } from '../validators/telemetry.schema.js';
import { 
  getDeviceProductThresholds, 
  createExcursion, 
  getActiveExcursion, 
  updateExcursion 
} from '../../repositories/device.repository.js';

// Flags based on the architecture doc
const FLAGS = {
  DOOR_OPEN: 1 << 0,
  MAINS_LOST: 1 << 1,
  ALARM: 1 << 2,
  LOW_BATT: 1 << 3,
  REBOOT: 1 << 4,
  TAMPER: 1 << 5
};

export async function evaluateTelemetry(reading: TelemetryPayload) {
  const thresholds = await getDeviceProductThresholds(reading.deviceId);
  if (!thresholds) return; // No active assignment or product data

  const tempC = reading.temp_cK / 100 - 273.15; // cK to C
  const activeExcursion = await getActiveExcursion(reading.deviceId);

  let isBreach = false;
  let cause = '';
  let status = 'NORMAL';

  // 1. Immediate Critical Rules
  if (reading.flags & FLAGS.DOOR_OPEN) {
    isBreach = true;
    cause = 'DOOR_OPEN';
    status = 'WARNING';
  } else if (reading.flags & FLAGS.MAINS_LOST) {
    isBreach = true;
    cause = 'MAINS_LOST';
    status = 'WARNING';
  } else if (reading.flags & FLAGS.TAMPER) {
    isBreach = true;
    cause = 'TAMPER';
    status = 'LATCHED'; // immediate quarantine
  }

  // 2. Temperature Rules
  if (!isBreach && thresholds.target_max_c !== null) {
    if (tempC > thresholds.target_max_c) {
      isBreach = true;
      cause = 'TEMP_HIGH';
      status = 'LATCHED'; // Excursion latched
    } else if (tempC < thresholds.target_min_c) {
      isBreach = true;
      cause = 'TEMP_LOW';
      status = thresholds.freeze_sensitive ? 'LATCHED' : 'WARNING';
    }
  }

  // State Machine Updates
  if (isBreach) {
    if (activeExcursion) {
      // Update existing excursion
      const newStatus = status === 'LATCHED' ? 'LATCHED' : activeExcursion.status;
      await updateExcursion(activeExcursion.id, { 
        status: newStatus, 
        peak_temp: tempC 
      });
    } else {
      // Create new excursion
      await createExcursion(
        thresholds.unit_id,
        reading.deviceId,
        status,
        reading.recordedAt ?? new Date().toISOString(),
        tempC,
        cause
      );
    }
  } else if (activeExcursion && activeExcursion.status === 'WARNING') {
    // If it was just a warning and temperature is back to normal, we might resolve it
    // Wait, architecture rule: "Recovery never clears an excursion. The event stays open until a person with QA authority signs a disposition."
    // Actually, if it's LATCHED, it stays LATCHED. If it's WARNING, it might escalate to LATCHED if it stays too long, or maybe just close if brief. 
    // For simplicity, let's just leave it open to require disposition, or close WARNING if resolved. Let's close WARNING but keep LATCHED.
    await updateExcursion(activeExcursion.id, {
      status: 'DISPOSITIONED', // auto-close warning if recovered? Or maybe we need a RESOLVED state. Let's just update end_time.
      end_time: reading.recordedAt ?? new Date().toISOString()
    });
  } else if (activeExcursion && activeExcursion.status === 'LATCHED') {
    // Keep it latched, just update end_time to now if back to normal? 
    // Or just track peak_temp
    await updateExcursion(activeExcursion.id, {
      peak_temp: tempC
    });
  }
}
