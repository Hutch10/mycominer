// Phase 22: Load Balancer
// Redistributes tasks across rooms/facilities to reduce peak load and stagger cycles

'use client';

import { LoadBalancingPlan, LoadShift, RoomLoad } from '@/app/optimization/optimizationTypes';

class LoadBalancer {
  /**
   * Analyze room/facility load distribution
   */
  analyzeRoomLoads(rooms: RoomLoad[]): RoomLoad[] {
    return rooms.map(room => {
      let contentionLevel: 'low' | 'medium' | 'high';
      if (room.peakEnergyKwh > 40) {
        contentionLevel = 'high';
      } else if (room.peakEnergyKwh > 25) {
        contentionLevel = 'medium';
      } else {
        contentionLevel = 'low';
      }
      return { ...room, contentionLevel };
    });
  }

  /**
   * Generate load balancing shifts
   */
  generateShifts(rooms: RoomLoad[]): LoadShift[] {
    const shifts: LoadShift[] = [];
    const highLoadRooms = rooms.filter(r => r.contentionLevel === 'high').sort((a, b) => b.peakEnergyKwh - a.peakEnergyKwh);
    const lowLoadRooms = rooms.filter(r => r.contentionLevel !== 'high').sort((a, b) => a.peakEnergyKwh - b.peakEnergyKwh);

    // Generate shifts from high-load to low-load rooms
    highLoadRooms.slice(0, 2).forEach((fromRoom, idx) => {
      const toRoom = lowLoadRooms[idx % lowLoadRooms.length];
      if (toRoom && fromRoom.peakEnergyKwh - toRoom.peakEnergyKwh > 10) {
        const shiftSize = Math.min(5, (fromRoom.peakEnergyKwh - toRoom.peakEnergyKwh) / 2);
        shifts.push({
          shiftId: `shift-${idx}`,
          fromRoom: fromRoom.roomId,
          toRoom: toRoom.roomId,
          expectedEnergyReduction: parseFloat(shiftSize.toFixed(1)),
          expectedLabor: 3,
          riskLevel: 'low',
          rationale: `Redistribute load from ${fromRoom.roomId} (${fromRoom.peakEnergyKwh} kWh) to ${toRoom.roomId} (${toRoom.peakEnergyKwh} kWh)`,
        });
      }
    });

    return shifts;
  }

  /**
   * Generate staggered schedules for shared resources
   */
  generateStaggeredSchedules(peakHour: number): Array<{ resource: string; originalStartTime: string; newStartTime: string; reasonDescription: string }> {
    return [
      {
        resource: 'hvac-cycles',
        originalStartTime: '08:00',
        newStartTime: '06:00',
        reasonDescription: 'Move HVAC pre-cooling to before peak occupancy',
      },
      {
        resource: 'lighting',
        originalStartTime: '06:00',
        newStartTime: '06:30',
        reasonDescription: 'Stagger lighting ramp-up to reduce peak inrush',
      },
      {
        resource: 'sterilization',
        originalStartTime: '10:00',
        newStartTime: '14:00',
        reasonDescription: 'Shift autoclave cycles away from morning peak',
      },
    ];
  }

  /**
   * Generate comprehensive load balancing plan
   */
  generatePlan(rooms: RoomLoad[], peakHour: number = 12): LoadBalancingPlan {
    const analyzed = this.analyzeRoomLoads(rooms);
    const shifts = this.generateShifts(analyzed);
    const staggeredSchedules = this.generateStaggeredSchedules(peakHour);

    const totalPeakBefore = analyzed.reduce((sum, r) => sum + r.peakEnergyKwh, 0);
    let totalPeakAfter = totalPeakBefore;
    const rebalancedRooms = analyzed.map(room => {
      const roomShifts = shifts.filter(s => s.fromRoom === room.roomId || s.toRoom === room.roomId);
      const netReduction = roomShifts.reduce((sum, s) => (s.fromRoom === room.roomId ? -s.expectedEnergyReduction : s.expectedEnergyReduction), 0);
      const newPeak = Math.max(5, room.peakEnergyKwh + netReduction);
      totalPeakAfter -= room.peakEnergyKwh;
      totalPeakAfter += newPeak;

      return {
        roomId: room.roomId,
        newPeakKwh: parseFloat(newPeak.toFixed(1)),
        prevPeakKwh: room.peakEnergyKwh,
        reduction: parseFloat(netReduction.toFixed(1)),
      };
    });

    const peakReductionKwh = Math.max(0, totalPeakBefore - totalPeakAfter);

    return {
      planId: `load-balance-${Date.now()}`,
      createdAt: new Date().toISOString(),
      shifts,
      peakReductionKwh: parseFloat(peakReductionKwh.toFixed(1)),
      rebalancedRooms,
      staggeredSchedules,
      totalImplementationHours: shifts.length * 3 + 2,
      confidence: Math.min(88, 70 + shifts.length * 5),
    };
  }
}

export const loadBalancer = new LoadBalancer();
