export interface RouteInfo {
  distance_km: number;
  eta_minutes: number;
  traffic_condition: 'LOW' | 'MODERATE' | 'HEAVY' | 'CONGESTED_SURGE';
  waypoints: [number, number][]; // [latitude, longitude]
}

export class MapsService {
  // Haversine formula for exact spherical distance
  public calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Calculate realistic ETA based on distance and urban traffic conditions
  public calculateETA(
    distanceKm: number,
    trafficMultiplier = 1.0,
    isAmbulancePriority = true
  ): number {
    // Average urban ambulance speed in congested metro: ~30-40 km/h with siren, ~20 km/h in dense traffic
    const baseSpeedKmH = isAmbulancePriority ? 35 : 25;
    const effectiveSpeed = baseSpeedKmH / trafficMultiplier;
    const timeHours = distanceKm / effectiveSpeed;
    const minutes = Math.ceil(timeHours * 60);
    return Math.max(3, minutes);
  }

  // Generate intermediate coordinate steps between two points for route rendering
  public generateRoutePoints(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    steps = 12
  ): [number, number][] {
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Add slight curvature to simulate real roads rather than straight line
      const curvedOffset = Math.sin(t * Math.PI) * 0.003;
      const lat = startLat + (endLat - startLat) * t + curvedOffset;
      const lon = startLon + (endLon - startLon) * t + curvedOffset * 0.8;
      points.push([lat, lon]);
    }
    return points;
  }

  // Get full route metadata
  public getRouteInfo(
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number,
    trafficMultiplier = 1.0
  ): RouteInfo {
    const distance_km = this.calculateDistanceKm(fromLat, fromLon, toLat, toLon);
    const eta_minutes = this.calculateETA(distance_km, trafficMultiplier, true);
    let traffic_condition: RouteInfo['traffic_condition'] = 'LOW';
    if (trafficMultiplier >= 1.6) traffic_condition = 'CONGESTED_SURGE';
    else if (trafficMultiplier >= 1.3) traffic_condition = 'HEAVY';
    else if (trafficMultiplier >= 1.1) traffic_condition = 'MODERATE';

    return {
      distance_km,
      eta_minutes,
      traffic_condition,
      waypoints: this.generateRoutePoints(fromLat, fromLon, toLat, toLon),
    };
  }
}

export const mapsService = new MapsService();
