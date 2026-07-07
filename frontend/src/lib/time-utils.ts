/** Generates "HH:mm" slots covering a full day at the given step (in minutes). */
export function generateTimeSlots(stepMinutes = 30): string[] {
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    slots.push(`${hours}:${mins}`);
  }
  return slots;
}
